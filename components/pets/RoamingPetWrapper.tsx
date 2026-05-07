import { Suspense } from 'react'
import { getRoamingPetSpritesheetUrl } from '@/lib/roaming-pet'
import { RoamingPetVisibilityGate } from './RoamingPetVisibilityGate'

async function RoamingPetFetcher() {
  const spritesheetUrl = await getRoamingPetSpritesheetUrl()
  if (!spritesheetUrl) return null

  return <RoamingPetVisibilityGate spritesheetUrl={spritesheetUrl} />
}

export function RoamingPetWrapper() {
  return (
    <Suspense fallback={null}>
      <RoamingPetFetcher />
    </Suspense>
  )
}
