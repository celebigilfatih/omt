import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().min(1, 'Email veya kullanıcı adı gereklidir'),
  password: z.string().min(1, 'Şifre gereklidir'),
})

// Sabit admin credentials (geriye dönük uyumluluk için)
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin123'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Önce sabit admin credentials'ları kontrol et (geriye dönük uyumluluk)
    if (validatedData.email === ADMIN_CREDENTIALS.email && 
        validatedData.password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: 'admin', 
          email: 'admin', 
          name: 'System Admin' 
        } 
      })
    }

    // Veritabanındaki kullanıcıları kontrol et
    const user = await prisma.admin.findUnique({
      where: { email: validatedData.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Başarılı giriş
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Giriş hatası:', error)
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız' },
      { status: 500 }
    )
  }
}