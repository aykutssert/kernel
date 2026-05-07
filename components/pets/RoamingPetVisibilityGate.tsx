'use client'

import { useSyncExternalStore } from 'react'
import { RoamingPetClient } from './RoamingPetClient'
import { ROAMING_PET_EVENT, ROAMING_PET_STORAGE_KEY } from './RoamingPetToggle'

function readEnabled() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(ROAMING_PET_STORAGE_KEY) !== 'false'
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  function onStorage(event: StorageEvent) {
    if (event.key === ROAMING_PET_STORAGE_KEY) callback()
  }

  window.addEventListener(ROAMING_PET_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(ROAMING_PET_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

export function RoamingPetVisibilityGate({ spritesheetUrl }: { spritesheetUrl: string | null }) {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => true)

  if (!enabled) return null
  return <RoamingPetClient spritesheetUrl={spritesheetUrl} />
}
