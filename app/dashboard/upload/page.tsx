'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<{
    vendor: string
    amount: number
    date: string
    category: string
  } | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setExtractedData(null)
      setStatus('idle')
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError(null)
      setExtractedData(null)
      setStatus('idle')
    }
  }

  const handleAnalyse = async () => {
    if (!file) return
    setStatus('uploading')
    setError(null)

    try {
      // 1. Upload to Supabase
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadRes.ok) {
        const data = await uploadRes.json()
        throw new Error(data.error || 'Upload failed')
      }
      
      const { imageUrl } = await uploadRes.json()
      
      // 2. Parse with GPT-4o
      setStatus('parsing')
      const parseRes = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      
      if (!parseRes.ok) {
        const data = await parseRes.json()
        throw new Error(data.error || 'Parsing failed')
      }
      
      const parsedData = await parseRes.json()
      
      // 3. Save to Database
      setStatus('saving')
      const saveRes = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsedData,
          imageUrl,
          rawText: '' // Optional for now
        }),
      })
      
      if (!saveRes.ok) {
        const data = await saveRes.json()
        throw new Error(data.error || 'Saving failed')
      }
      
      setExtractedData(parsedData)
      setStatus('success')
      toast.success('Receipt processed successfully!')
    } catch (err: any) {
      console.error('Flow error:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Upload Receipt</h1>
      </div>

      <Card className="border-dashed border-2">
        <CardContent 
          className="pt-10 pb-10 flex flex-col items-center justify-center space-y-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="p-4 bg-muted rounded-full">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium text-lg text-primary">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">JPG, PNG or PDF (max. 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            id="file-upload"
            accept="image/jpeg,image/png,application/pdf"
            onChange={onFileChange}
          />
          <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            Select File
          </Button>
        </CardContent>
      </Card>

      {file && (
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base truncate">{file.name}</CardTitle>
              <CardDescription>{(file.size / 1024 / 1024).toFixed(2)} MB</CardDescription>
            </div>
            {status === 'idle' && (
              <Button onClick={handleAnalyse}>Analyse receipt</Button>
            )}
            {status !== 'idle' && status !== 'success' && status !== 'error' && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </CardHeader>
        </Card>
      )}

      {(status === 'uploading' || status === 'parsing' || status === 'saving') && (
        <div className="flex items-center justify-center p-8 space-x-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="capitalize">{status}...</p>
        </div>
      )}

      {status === 'error' && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex items-center space-x-3 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error || 'An error occurred during processing.'}</p>
          </CardContent>
        </Card>
      )}

      {status === 'success' && extractedData && (
        <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <CardTitle className="text-lg">Extracted Details</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setFile(null)
                setExtractedData(null)
                setStatus('idle')
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Upload Another
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Vendor</p>
              <p className="font-semibold">{extractedData.vendor}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Amount</p>
              <p className="font-semibold text-xl text-primary">
                ${extractedData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Date</p>
              <p className="font-medium text-muted-foreground">{extractedData.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Category</p>
              <Badge variant="secondary">{extractedData.category}</Badge>
            </div>
          </CardContent>
          <div className="p-6 pt-0 border-t mt-4 flex justify-end">
            <Link href="/dashboard/expenses">
              <Button variant="link" className="text-primary hover:no-underline">
                View all expenses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
