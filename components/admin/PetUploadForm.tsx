'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { validatePetJson } from '@/lib/pets'
import { Upload, X } from 'lucide-react'

interface ParsedPet {
  id: string
  displayName: string
  description: string
}

export function PetUploadForm() {
  const router = useRouter()
  const jsonRef = useRef<HTMLInputElement>(null)
  const spriteRef = useRef<HTMLInputElement>(null)

  const [parsed, setParsed] = useState<ParsedPet | null>(null)
  const [spriteFile, setSpriteFile] = useState<File | null>(null)
  const [spritePreview, setSpritePreview] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [isNsfw, setIsNsfw] = useState(false)
  const [jsonError, setJsonError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleJsonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        const result = validatePetJson(json)
        if (!result) { setJsonError('Invalid pet.json — id ve displayName zorunlu.'); return }
        setParsed(result)
        setDisplayName(result.displayName)
        setDescription(result.description)
        setJsonError('')
      } catch {
        setJsonError('JSON parse hatası.')
      }
    }
    reader.readAsText(file)
  }

  function handleSpriteFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.webp')) { setError('Sadece .webp dosyası kabul edilir.'); return }
    setSpriteFile(file)
    setSpritePreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSave() {
    if (!parsed || !spriteFile) return
    setSaving(true)
    setError('')

    const formData = new FormData()
    formData.append('file', spriteFile)
    formData.append('petId', parsed.id)
    const uploadRes = await fetch('/api/pets/upload-sprite', { method: 'POST', body: formData })
    const uploadData = await uploadRes.json()
    if (!uploadRes.ok) { setError(uploadData.error ?? 'Upload failed'); setSaving(false); return }

    const saveRes = await fetch('/api/pets/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parsed.id,
        display_name: displayName,
        description,
        spritesheet_url: uploadData.url,
        source_url: sourceUrl,
        published,
        is_nsfw: isNsfw,
      }),
    })
    const saveData = await saveRes.json()
    if (!saveRes.ok) { setError(saveData.error ?? 'Save failed'); setSaving(false); return }

    router.push('/admin/pets')
    router.refresh()
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* JSON upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">pet.json</label>
        <button
          type="button"
          onClick={() => jsonRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {parsed ? `✓ ${parsed.id}` : 'Upload pet.json'}
        </button>
        <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleJsonFile} />
        {jsonError && <p className="text-xs text-red-500 mt-1">{jsonError}</p>}
      </div>

      {/* Spritesheet upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">spritesheet.webp</label>
        {spritePreview ? (
          <div className="relative inline-block">
            <img src={spritePreview} alt="" className="h-32 rounded-lg border border-border object-contain bg-muted/30" />
            <button
              type="button"
              onClick={() => { setSpriteFile(null); setSpritePreview('') }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => spriteRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload spritesheet.webp
          </button>
        )}
        <input ref={spriteRef} type="file" accept=".webp" className="hidden" onChange={handleSpriteFile} />
      </div>

      {/* Metadata (editable) */}
      {parsed && (
        <>
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
        </>
      )}

      <div className="flex items-center gap-6 pt-2">
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
      <div className="flex items-center justify-between pt-2">
        <div />


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
            disabled={!parsed || !spriteFile || saving}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save pet'}
          </button>
        </div>
      </div>
    </div>
  )
}
