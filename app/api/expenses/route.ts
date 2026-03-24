import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const expenses = await db.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { vendor, amount, date, category, imageUrl, rawText } = body

  const expense = await db.expense.create({
    data: {
      userId,
      vendor,
      amount: parseFloat(amount),
      date: new Date(date),
      category,
      imageUrl,
      rawText,
    },
  })

  return NextResponse.json(expense, { status: 201 })
}
