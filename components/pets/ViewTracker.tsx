'use client'

import { useEffect } from 'react'

export function ViewTracker({ petId }: { petId: string }) {
  useEffect(() => {
    const key = `viewed:${petId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch('/api/pets/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: petId }),
    })
  }, [petId])

  return null
}
