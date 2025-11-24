import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const paymentSchema = z.object({
  teamId: z.string().min(1, 'Takım seçimi gereklidir'),
  paymentMethod: z.enum(['POS', 'IBAN', 'CASH', 'HAND_DELIVERY', 'MAIL_ORDER', 'HOTEL_PAYMENT']),
  amount: z.number().min(0, 'Tutar 0\'dan küçük olamaz'),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    const payment = await prisma.payment.create({
      data: validatedData,
      include: {
        team: true,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Ödeme oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Ödeme oluşturulamadı' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Ödemeler getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Ödemeler getirilemedi' },
      { status: 500 }
    )
  }
}
