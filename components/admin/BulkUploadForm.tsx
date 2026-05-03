'use client'

import { useRef, useState } from 'react'
import JSZip from 'jszip'
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ParsedPet {
  id: string
  display_name: string
  description: string
  is_nsfw: boolean
  published: boolean
  webpBlob: Blob
  previewUrl: string
  status: 'pending' | 'uploading' | 'done' | 'skipped' | 'error'
  error?: string
}

export function BulkUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pets, setPets] = useState<ParsedPet[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)

  async function handleFiles(files: FileList) {
    setParsing(true)
    const parsed: ParsedPet[] = []

    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.zip')) continue
      try {
        const zip = await JSZip.loadAsync(file)

        const jsonFile = Object.values(zip.files).find((f) => f.name.endsWith('pet.json'))
        const webpFile = Object.values(zip.files).find((f) => f.name.endsWith('.webp'))
        if (!jsonFile || !webpFile) continue

        const json = JSON.parse(await jsonFile.async('string'))
        const webpBlob = await webpFile.async('blob')
        const previewUrl = URL.createObjectURL(webpBlob)

        parsed.push({
          id: json.id,
          display_name: json.displayName ?? json.display_name ?? json.id,
          description: json.description ?? '',
          is_nsfw: false,
          published: false,
          webpBlob,
          previewUrl,
          status: 'pending',
        })
      } catch {
        // skip malformed zip
      }
    }

    setPets(parsed)
    setParsing(false)
  }

  function updatePet(index: number, patch: Partial<ParsedPet>) {
    setPets((prev) => prev.map((p, i) => i === index ? { ...p, ...patch } : p))
  }

  function removePet(index: number) {
    setPets((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleImport() {
    setImporting(true)
    let created = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < pets.length; i++) {
      if (pets[i].status !== 'pending') continue
      updatePet(i, { status: 'uploading' })

      const pet = pets[i]
      const fd = new FormData()
      fd.append('id', pet.id)
      fd.append('display_name', pet.display_name)
      fd.append('description', pet.description)
      fd.append('published', String(pet.published))
      fd.append('is_nsfw', String(pet.is_nsfw))
      fd.append('webp', pet.webpBlob, `${pet.id}.webp`)

      try {
        const res = await fetch('/api/pets/bulk', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          updatePet(i, { status: 'error', error: data.error })
          failed++
        } else if (data.skipped) {
          updatePet(i, { status: 'skipped' })
          skipped++
        } else {
          updatePet(i, { status: 'done' })
          created++
        }
      } catch {
        updatePet(i, { status: 'error', error: 'Network error' })
        failed++
      }
    }

    setImporting(false)
    toast.success(`Done — ${created} created, ${skipped} skipped, ${failed} failed`)
  }

  const pending = pets.filter((p) => p.status === 'pending').length
  const CELL_W = 192, CELL_H = 208

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors cursor-pointer"
      >
        <Upload className="w-8 h-8" />
        <div className="text-center">
          <p className="text-sm font-medium">Click to select .codex-pet.zip files</p>
          <p className="text-xs mt-1">Multiple files supported</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {parsing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Parsing zip files…
        </div>
      )}

      {pets.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{pets.length} pet{pets.length !== 1 ? 's' : ''} ready</p>
            <button
              onClick={handleImport}
              disabled={importing || pending === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Import {pending} pet{pending !== 1 ? 's' : ''}
            </button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 w-12" />
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">NSFW</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">
                    <label className="flex items-center justify-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pets.filter(p => p.status === 'pending').every(p => p.published)}
                        onChange={(e) => setPets(prev => prev.map(p => p.status === 'pending' ? { ...p, published: e.target.checked } : p))}
                        className="w-3.5 h-3.5"
                      />
                      <span>Publish all</span>
                    </label>
                  </th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {pets.map((pet, i) => (
                  <tr key={pet.id} className={i < pets.length - 1 ? 'border-b border-border' : ''}>
                    <td className="px-3 py-2">
                      <div
                        className="w-8 h-8 rounded overflow-hidden shrink-0"
                        style={{
                          backgroundImage: `url(${pet.previewUrl})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: '0 0',
                          backgroundSize: `${(32 / CELL_W) * CELL_W * 8}px ${32}px`,
                          imageRendering: 'pixelated',
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={pet.display_name}
                        onChange={(e) => updatePet(i, { display_name: e.target.value })}
                        disabled={pet.status !== 'pending'}
                        className="w-full text-sm bg-transparent border-b border-transparent focus:border-border outline-none py-0.5 disabled:text-muted-foreground"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={pet.description}
                        onChange={(e) => updatePet(i, { description: e.target.value })}
                        disabled={pet.status !== 'pending'}
                        placeholder="—"
                        className="w-full text-sm bg-transparent border-b border-transparent focus:border-border outline-none py-0.5 text-muted-foreground disabled:text-muted-foreground/50 placeholder:text-muted-foreground/30"
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{pet.id}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={pet.is_nsfw}
                        onChange={(e) => updatePet(i, { is_nsfw: e.target.checked })}
                        disabled={pet.status !== 'pending'}
                        className="w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={pet.published}
                        onChange={(e) => updatePet(i, { published: e.target.checked })}
                        disabled={pet.status !== 'pending'}
                        className="w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {pet.status === 'pending' && (
                        <button onClick={() => removePet(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {pet.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                      {pet.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      {pet.status === 'skipped' && <span className="text-xs text-muted-foreground">exists</span>}
                      {pet.status === 'error' && (
                        <span title={pet.error}>
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
