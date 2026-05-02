import { notFound } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { PetEditForm } from '@/components/admin/PetEditForm'
import type { Pet } from '@/lib/pets'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPetPage({ params }: Props) {
  const { id } = await params
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: pet } = await supabase.from('pets').select('*').eq('id', id).single() as { data: Pet | null }
  if (!pet) notFound()

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Edit pet</h1>
      <PetEditForm pet={pet} />
    </div>
  )
}
