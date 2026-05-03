import { BulkUploadForm } from '@/components/admin/BulkUploadForm'

export default function BulkUploadPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Bulk import pets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select multiple <code>.codex-pet.zip</code> files. Pets with existing IDs will be skipped.
        </p>
      </div>
      <BulkUploadForm />
    </div>
  )
}
