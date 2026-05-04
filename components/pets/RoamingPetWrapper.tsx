import { Suspense } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import { RoamingPetClient } from './RoamingPetClient'

async function RoamingPetFetcher() {
  const supabase = createPublicClient()
  const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'roaming_pet_id').single()
  
  if (!setting?.value) return null

  const { data: pet } = await supabase.from('pets').select('spritesheet_url').eq('id', setting.value).single()
  if (!pet?.spritesheet_url) return null

  return <RoamingPetClient spritesheetUrl={pet.spritesheet_url} />
}

export function RoamingPetWrapper() {
  return (
    <Suspense fallback={null}>
      <RoamingPetFetcher />
    </Suspense>
  )
}
