import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { content, author_name, source } = await req.json()
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for') || '127.0.0.1'

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Rate Limiting: Aynı IP'den son 1 saat içinde kaç yorum gelmiş?
    const { count, error: countError } = await supabase
      .from('site_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('fingerprint', ip)
      .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (count !== null && count >= 3) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    // Yorumu kaydet
    const { error } = await supabase.from('site_feedback').insert({
      content,
      author_name,
      source,
      fingerprint: ip,
      status: 'pending' // Her zaman onay bekler
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Feedback API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_feedback')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
