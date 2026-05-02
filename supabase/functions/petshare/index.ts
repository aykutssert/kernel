import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import JSZip from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const match = url.pathname.match(/\/api\/pets\/([^/]+)\/download$/)
  if (!match) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const id = match[1]

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: pet, error } = await supabase
    .from('pets')
    .select('id, display_name, description, spritesheet_url')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error || !pet) {
    return new Response(JSON.stringify({ error: 'Pet not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const spritesheetRes = await fetch(pet.spritesheet_url)
  if (!spritesheetRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch spritesheet' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const spritesheetBuffer = await spritesheetRes.arrayBuffer()

  const petJson = JSON.stringify({
    id: pet.id,
    displayName: pet.display_name,
    description: pet.description ?? '',
    spritesheetPath: 'spritesheet.webp',
  }, null, 2)

  const zip = new JSZip()
  zip.file('pet.json', petJson)
  zip.file('spritesheet.webp', spritesheetBuffer)

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })

  return new Response(zipBuffer, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${pet.id}.codex-pet.zip"`,
    },
  })
})
