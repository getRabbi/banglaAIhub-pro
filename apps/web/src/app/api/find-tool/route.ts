import { NextRequest, NextResponse } from 'next/server'

async function geminiGenerate(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    }
  )
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json()

    const prompt = `তুমি BanglaAIHub-এর AI tool recommendation system।

User-এর উত্তর:
- লক্ষ্য: ${answers.goal}
- অভিজ্ঞতা: ${answers.level}
- বাজেট: ${answers.budget}
- ব্যবহার: ${answers.use}

এই user-এর জন্য সেরা ৩টি AI tool suggest করো।

শুধু এই JSON দাও (backtick ছাড়া):
{"summary":"এক বাক্যে ব্যাখ্যা","tools":[{"name":"টুলের নাম","slug":"url-slug","why":"কেন ভালো (বাংলায়)","pricing":"ফ্রি/ফ্রিমিয়াম/পেইড"}]}`

    const text = await geminiGenerate(prompt)
    const parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({
      summary: 'আপনার প্রয়োজন অনুযায়ী কিছু জনপ্রিয় AI টুলস:',
      tools: [
        { name: 'ChatGPT', slug: 'chatgpt', why: 'সর্বাধিক ব্যবহৃত AI assistant', pricing: 'ফ্রিমিয়াম' },
        { name: 'Canva AI', slug: 'canva', why: 'Design ও ছবির জন্য সহজতম', pricing: 'ফ্রিমিয়াম' },
        { name: 'Notion AI', slug: 'notion-ai', why: 'নোট ও project management', pricing: 'ফ্রিমিয়াম' },
      ]
    })
  }
}
