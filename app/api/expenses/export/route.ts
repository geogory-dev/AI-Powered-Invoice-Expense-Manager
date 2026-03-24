import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const expenses = await db.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  const header = 'Date,Vendor,Amount,Category\n'
  const rows = expenses.map(e =>
    `${e.date.toISOString().split('T')[0]},${e.vendor},${e.amount},${e.category}`
  ).join('\n')

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="expenses.csv"',
    },
  })
}
