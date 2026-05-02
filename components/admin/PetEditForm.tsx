'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PetViewer } from '@/components/pets/PetViewer'
import type { Pet } from '@/lib/pets'

export function PetEditForm({ pet }: { pet: Pet }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(pet.display_name)
  const [description, setDescription] = useState(pet.description ?? '')
  const [sourceUrl, setSourceUrl] = useState(pet.source_url ?? '')
  const [published, setPublished] = useState(pet.published)
  const [isNsfw, setIsNsfw] = useState(pet.is_nsfw)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/pets/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: pet.id,
        display_name: displayName,
        description,
        spritesheet_url: pet.spritesheet_url,
        source_url: sourceUrl,
        published,
        is_nsfw: isNsfw,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Save failed'); setSaving(false); return }
    router.push('/admin/pets')
    router.refresh()
  }

  return (
    <div className="flex gap-12 items-start">
      <div className="flex-1 max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Source URL <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">ID</label>
          <p className="text-sm font-mono text-muted-foreground">{pet.id}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setPublished((p) => !p)}
                className={`relative w-10 h-5 rounded-full transition-colors ${published ? 'bg-foreground' : 'bg-muted border border-border'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${published ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setIsNsfw((p) => !p)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isNsfw ? 'bg-red-500' : 'bg-muted border border-border'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${isNsfw ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm">NSFW</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 sticky top-[80px]">
        <PetViewer spritesheetUrl={pet.spritesheet_url} size={200} />
      </div>
    </div>
  )
}
