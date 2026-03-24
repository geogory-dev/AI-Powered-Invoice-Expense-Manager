import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  const testFile = Buffer.from('test-content')
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload('test/test-file.txt', testFile, { upsert: true })

  if (error) {
    console.error('FAILED:', error.message)
    return
  }

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(data.path)

  console.log('SUCCESS — public URL:', urlData.publicUrl)
}

test()
