'use client'

import { PawPrint } from 'lucide-react'
import { useCallback, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

export const ROAMING_PET_STORAGE_KEY = 'kernel:roaming-pet-enabled'
export const ROAMING_PET_EVENT = 'kernel-roaming-pet-change'

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

export function RoamingPetToggle() {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => true)

  const toggle = useCallback(() => {
    const next = !readEnabled()
    window.localStorage.setItem(ROAMING_PET_STORAGE_KEY, String(next))
    window.dispatchEvent(new Event(ROAMING_PET_EVENT))
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]',
        enabled && 'text-foreground'
      )}
      aria-label={enabled ? 'Hide roaming pet' : 'Show roaming pet'}
      aria-pressed={enabled}
      title={enabled ? 'Hide pet' : 'Show pet'}
    >
      <PawPrint className="h-4 w-4" />
    </button>
  )
}
