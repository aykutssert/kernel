'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil, Trash2, Search, X, Eye, Heart, ChevronUp, ChevronDown, ChevronsUpDown, Copy, PawPrint } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './ConfirmDialog'
import type { Pet } from '@/lib/pets'

type StatusFilter = 'all' | 'published' | 'draft'
type SortKey = 'display_name' | 'views_count' | 'likes_count' | 'created_at'
type SortDir = 'asc' | 'desc'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3 h-3 opacity-30" />
  return dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
}

function sortPets(pets: Pet[], key: SortKey, dir: SortDir) {
  return [...pets].sort((a, b) => {
    let cmp = 0
    if (key === 'display_name') cmp = a.display_name.localeCompare(b.display_name)
    else if (key === 'views_count') cmp = (a.views_count ?? 0) - (b.views_count ?? 0)
    else if (key === 'likes_count') cmp = a.likes_count - b.likes_count
    else if (key === 'created_at') cmp = a.created_at.localeCompare(b.created_at)
    return dir === 'asc' ? cmp : -cmp
  })
}

export function PetAdminTable({ pets: initialPets }: { pets: Pet[] }) {
  const router = useRouter()
  const [pets, setPets] = useState(initialPets)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  async function handleDuplicate(id: string) {
    const res = await fetch('/api/pets/duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const { id: newId } = await res.json()
      toast.success('Pet duplicated as draft.')
      router.push(`/admin/pets/edit/${newId}`)
    } else {
      toast.error('Failed to duplicate pet.')
    }
  }

  async function handleSetRoaming(id: string) {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'roaming_pet_id', value: id }),
    })
    if (res.ok) {
      toast.success('Set as global roaming pet.')
      router.refresh()
    } else {
      toast.error('Failed to set roaming pet.')
    }
  }

  async function handleTogglePublish(id: string, current: boolean) {
    setPets((prev) => prev.map((p) => p.id === id ? { ...p, published: !current } : p))
    const res = await fetch('/api/pets/publish', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, published: !current }),
    })
    if (!res.ok) {
      setPets((prev) => prev.map((p) => p.id === id ? { ...p, published: current } : p))
      toast.error('Failed to update status.')
    } else {
      toast.success(!current ? 'Published.' : 'Moved to draft.')
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    const pet = pets.find((p) => p.id === id)
    const res = await fetch('/api/pets/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      toast.success(`"${pet?.display_name ?? 'Pet'}" deleted.`)
    } else {
      toast.error('Failed to delete pet.')
    }
    router.refresh()
  }

  const q = query.trim().toLowerCase()
  const filtered = pets
    .filter((p) => statusFilter === 'all' || (statusFilter === 'published' ? p.published : !p.published))
    .filter((p) => !q || p.display_name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  const sorted = sortPets(filtered, sortKey, sortDir)

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pets…"
          className="w-full pl-9 pr-8 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex border border-border rounded-lg overflow-hidden text-xs">
          {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1 capitalize transition-colors',
                statusFilter === s ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'all' ? 'All' : s === 'published' ? 'Published' : 'Draft'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} pet{filtered.length !== 1 ? 's' : ''}</p>
      </div>
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 w-12" />
            <th
              onClick={() => handleSort('display_name')}
              className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1">Name <SortIcon active={sortKey === 'display_name'} dir={sortDir} /></span>
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
            <th
              onClick={() => handleSort('views_count')}
              className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
            >
              <span className="inline-flex items-center justify-end gap-1"><Eye className="w-3.5 h-3.5" /><SortIcon active={sortKey === 'views_count'} dir={sortDir} /></span>
            </th>
            <th
              onClick={() => handleSort('likes_count')}
              className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
            >
              <span className="inline-flex items-center justify-end gap-1"><Heart className="w-3.5 h-3.5" /><SortIcon active={sortKey === 'likes_count'} dir={sortDir} /></span>
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((pet, i) => (
            <tr key={pet.id} className={i < sorted.length - 1 ? 'border-b border-border' : ''}>
              <td className="px-4 py-2">
                <div
                  className="w-8 h-8 rounded overflow-hidden shrink-0"
                  style={{
                    backgroundImage: `url(${pet.spritesheet_url})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '0 0',
                    backgroundSize: 'auto 100%',
                    imageRendering: 'pixelated',
                  }}
                />
              </td>
              <td className="px-4 py-2 font-medium">{pet.display_name}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{pet.id}</td>
              <td className="px-4 py-2 text-right text-xs tabular-nums text-muted-foreground">{(pet.views_count ?? 0).toLocaleString()}</td>
              <td className="px-4 py-2 text-right text-xs tabular-nums text-muted-foreground">{pet.likes_count.toLocaleString()}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(pet.id, pet.published)}
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70',
                      pet.published
                        ? 'bg-foreground text-background dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {pet.published ? 'Published' : 'Draft'}
                  </button>
                  {pet.is_nsfw && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/30">
                      NSFW
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => handleSetRoaming(pet.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Set as global roaming pet"
                  >
                    <PawPrint className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/admin/pets/edit/${pet.id}`}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDuplicate(pet.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <ConfirmDialog
                    title="Delete pet"
                    description={`"${pet.display_name}" will be permanently deleted. This cannot be undone.`}
                    onConfirm={() => handleDelete(pet.id)}
                  >
                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </ConfirmDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-center py-12 text-sm text-muted-foreground">No pets match your search.</p>
      )}
    </div>
    </div>
  )
}
