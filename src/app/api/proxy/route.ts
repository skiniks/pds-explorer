import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Fetch failed with status ${response.status} for URL: ${url}`)
      return new NextResponse(JSON.stringify({ error: `Fetch failed with status ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const contentType = response.headers.get('Content-Type')

    const isJson = contentType && contentType.includes('application/json')
    const data = isJson ? await response.json() : await response.text()

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  catch (error) {
    console.error('Error in proxy route:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
