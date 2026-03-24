import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function parseReceipt(imageUrl: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `Extract the following from this receipt and return ONLY valid JSON, no markdown:
{ vendor: string, amount: number, date: 'YYYY-MM-DD', category: one of Food/Transport/Office/Travel/Shopping/Health/Other }
If you cannot determine a field, use null.`,
          },
        ],
      },
    ],
  })

  const text = response.choices[0].message.content ?? ''
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('GPT-4o returned invalid JSON: ' + text)
  }
}
