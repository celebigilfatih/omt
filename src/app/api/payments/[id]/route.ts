import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const paymentUpdateSchema = z.object({
  paymentMethod: z.enum(['POS', 'IBAN', 'CASH', 'HAND_DELIVERY', 'MAIL_ORDER', 'HOTEL_PAYMENT']).optional(),
  amount: z.number().min(0, 'Tutar 0\'dan küçük olamaz').optional(),
  description: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const validatedData = paymentUpdateSchema.parse(body)
    const { id } = await params

    const payment = await prisma.payment.update({
      where: { id },
      data: validatedData,
      include: {
        team: true,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Ödeme güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Ödeme güncellenemedi' },
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
    await prisma.payment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Ödeme başarıyla silindi' })
  } catch (error) {
    console.error('Ödeme silme hatası:', error)
    return NextResponse.json(
      { error: 'Ödeme silinemedi' },
      { status: 500 }
    )
  }
}
