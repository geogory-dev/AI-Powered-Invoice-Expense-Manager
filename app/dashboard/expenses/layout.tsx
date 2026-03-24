import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expenses | InvoiceAI',
  description: 'View and filter your processed expenses.',
}

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
