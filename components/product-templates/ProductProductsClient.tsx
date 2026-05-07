'use client'

import Link from 'next/link'
import { PackagePlus, Plus, UserRound } from 'lucide-react'
import type { ProductProduct } from '@/types'

export function ProductProductsClient({
  products,
  signedIn,
}: {
  products: ProductProduct[]
  signedIn: boolean
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-end">
        <Link
          href="/product-studio/create"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      {!signedIn ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-border text-center">
          <UserRound className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">Sign in to save products.</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Your uploaded products will stay tied to your account.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-border text-center">
          <PackagePlus className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">No products yet.</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Add your first product image to use it with templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-md border border-border bg-background">
              <div className="aspect-square bg-muted">
                <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
              </div>
              <div className="border-t border-border p-3">
                <p className="truncate text-sm font-medium">{product.name}</p>
                {product.product_prompt && (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.product_prompt}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
