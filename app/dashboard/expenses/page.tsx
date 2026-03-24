'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, startOfMonth, isSameMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ImageIcon, Search, Filter, Download } from 'lucide-react'
import Link from 'next/link'

type Expense = {
  id: string
  vendor: string
  amount: number
  date: string
  category: string
  imageUrl?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  Transport: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  Office: 'bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  Travel: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  Shopping: 'bg-pink-100 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400',
  Health: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  Other: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [month, setMonth] = useState('all')

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [expenses, search, category, month])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/expenses')
      if (!res.ok) throw new Error('Failed to fetch expenses')
      const data = await res.json()
      setExpenses(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...expenses]

    if (search) {
      filtered = filtered.filter((e) => e.vendor.toLowerCase().includes(search.toLowerCase()))
    }

    if (category !== 'all') {
      filtered = filtered.filter((e) => e.category === category)
    }

    if (month !== 'all') {
      const selectedMonth = parseISO(month)
      filtered = filtered.filter((e) => isSameMonth(parseISO(e.date), selectedMonth))
    }

    setFilteredExpenses(filtered)
  }

  const uniqueMonths = Array.from(
    new Set(expenses.map((e) => format(startOfMonth(parseISO(e.date)), 'yyyy-MM-dd')))
  ).sort().reverse()

  const handleExport = async () => {
    window.location.href = '/api/expenses/export'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader className="pb-0">
             <div className="flex gap-4">
               <Skeleton className="h-10 flex-1" />
               <Skeleton className="h-10 w-40" />
               <Skeleton className="h-10 w-40" />
             </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {uniqueMonths.map((m) => (
                  <SelectItem key={m} value={m}>
                    {format(parseISO(m), 'MMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense: Expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {format(parseISO(expense.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>
                    <Badge className={CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}>
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    RM {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {expense.imageUrl ? (
                      <a href={expense.imageUrl} target="_blank" rel="noopener noreferrer">
                        <div className="h-10 w-10 bg-muted rounded overflow-hidden hover:opacity-80 transition-opacity">
                          <img 
                            src={expense.imageUrl} 
                            alt="Receipt" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </a>
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <p className="text-muted-foreground">No expenses found matching your filters.</p>
              <Link href="/dashboard/upload">
                <Button variant="link">Upload a new receipt</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
