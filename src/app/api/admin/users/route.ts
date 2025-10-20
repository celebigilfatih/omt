import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const createUserSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export async function GET() {
  try {
    const users = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received body:', body)
    const validatedData = createUserSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if user already exists
    const existingUser = await prisma.admin.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı kullanıcı zaten mevcut' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = await prisma.admin.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Kullanıcı oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}