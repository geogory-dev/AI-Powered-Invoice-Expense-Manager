import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadReceiptImage(file: Buffer, filename: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(`uploads/${filename}`, file, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw new Error('Supabase upload failed: ' + error.message)

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
