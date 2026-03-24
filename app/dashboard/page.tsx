'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, subMonths, isSameMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts'
import { ArrowUpRight, Receipt, Wallet, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

type Expense = {
  id: string
  vendor: string
  amount: number
  date: string
  category: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#22c55e',      // green-500
  Transport: '#3b82f6', // blue-500
  Office: '#a855f7',    // purple-500
  Travel: '#f59e0b',    // amber-500
  Shopping: '#ec4899',  // pink-500
  Health: '#ef4444',    // red-500
  Other: '#71717a',      // zinc-500
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  Food: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Office: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Travel: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Other: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400',
}

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      setExpenses(data)
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Summary logic
  const now = new Date()
  const currentMonthExpenses = expenses.filter((e: Expense) => isSameMonth(parseISO(e.date), now))
  const totalSpent = currentMonthExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)
  const receiptCount = currentMonthExpenses.length
  const biggestExpense = currentMonthExpenses.length > 0 
    ? Math.max(...currentMonthExpenses.map((e: Expense) => e.amount)) 
    : 0

  // Chart: Last 6 months trend
  const last6Months = [...Array(6)].map((_, i) => {
    const d = subMonths(now, 5 - i)
    const monthExpenses = expenses.filter((e: Expense) => isSameMonth(parseISO(e.date), d))
    return {
      name: format(d, 'MMM'),
      total: monthExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)
    }
  })

  // Chart: Category breakdown
  const categoryDataDict = expenses.reduce((acc: Record<string, number>, e: Expense) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(categoryDataDict).map(([name, value]) => ({
    name,
    value
  }))

  const recentExpenses = expenses.slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/dashboard/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Upload Receipt
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Spent This Month</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">From {receiptCount} receipts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Receipts Count</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receiptCount}</div>
            <p className="text-xs text-muted-foreground">Processed this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Biggest Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {biggestExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Single highest spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Spending</CardTitle>
            <CardDescription>Spend trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `RM${val}`} />
                <Tooltip 
                  formatter={(value: any) => [`RM ${Number(value).toLocaleString()}`, 'Total Spend']}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spend by Category</CardTitle>
            <CardDescription>Breakdown of all-time expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `RM ${Number(value).toLocaleString()}`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Expenses</CardTitle>
            <CardDescription>Your latest 5 activities</CardDescription>
          </div>
          <Link href="/dashboard/expenses">
            <Button variant="outline" size="sm">
              View all <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExpenses.map((expense: Expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold leading-none">{expense.vendor}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${CATEGORY_BADGE_COLORS[expense.category]}`}>
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(parseISO(expense.date), 'dd MMM yyyy')}</span>
                  </div>
                </div>
                <div className="text-sm font-bold">
                  RM {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {recentExpenses.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No recent expenses found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
