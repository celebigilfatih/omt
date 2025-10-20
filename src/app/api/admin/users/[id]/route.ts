import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

const updateUserSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz').optional(),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error)
    return NextResponse.json(
      { error: 'Kullanıcı getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, ...data } = body

    // Check if user exists
    const existingUser = await prisma.admin.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    if (action === 'change_password') {
      const validatedData = updatePasswordSchema.parse(data)
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      const updatedUser = await prisma.admin.update({
        where: { id },
        data: { password: hashedPassword },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return NextResponse.json(updatedUser)
    } else {
      // Update user info
      const validatedData = updateUserSchema.parse(data)

      // Check if email is being updated and if it already exists
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailExists = await prisma.admin.findUnique({
          where: { email: validatedData.email }
        })

        if (emailExists) {
          return NextResponse.json(
            { error: 'Bu email adresi ile kayıtlı kullanıcı zaten mevcut' },
            { status: 400 }
          )
        }
      }

      const updatedUser = await prisma.admin.update({
        where: { id },
        data: validatedData,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return NextResponse.json(updatedUser)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Kullanıcı güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Kullanıcı güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.admin.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Check if this is the last admin user
    const adminCount = await prisma.admin.count()
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Son admin kullanıcısı silinemez' },
        { status: 400 }
      )
    }

    await prisma.admin.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' })
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi' },
      { status: 500 }
    )
  }
}