import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { format, parseISO } from 'date-fns'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const expenses = await db.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })

    // CSV Headers
    let csv = 'Date,Vendor,Amount,Category\n'

    // CSV Rows
    expenses.forEach((expense: any) => {
      const formattedDate = format(parseISO(expense.date.toISOString()), 'dd MMM yyyy')
      const row = [
        `"${formattedDate}"`,
        `"${expense.vendor.replace(/"/g, '""')}"`,
        expense.amount.toFixed(2),
        `"${expense.category}"`
      ].join(',')
      csv += row + '\n'
    })

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="expenses.csv"'
      }
    })
  } catch (error) {
    console.error('CSV Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
