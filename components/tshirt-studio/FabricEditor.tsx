'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

const TARGET_EXPORT = 2000

export interface FabricEditorHandle {
  triggerUpload: () => void
  resetImage: () => void
}

interface Props {
  size: number
  onChange: (snapshot: HTMLCanvasElement) => void
}

export const FabricEditor = forwardRef<FabricEditorHandle, Props>(function FabricEditor(
  { size, onChange },
  ref,
) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fbRef = useRef<any>(null)
  const emitRef = useRef<(() => void) | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialScale = size / 550
  const defaultPos = {
    left: size * 0.88 - 60 * initialScale,
    top: size * 0.72 - 60 * initialScale,
  }

  useImperativeHandle(ref, () => ({
    triggerUpload: () => fileInputRef.current?.click(),
    resetImage: () => {
      const fb = fbRef.current
      if (!fb) return
      const obj = fb.getObjects()[0]
      if (!obj) return
      obj.scaleToWidth(140 * initialScale)
      obj.set({ ...defaultPos, angle: 0 })
      fb.discardActiveObject()
      fb.setActiveObject(obj)
      fb.renderAll()
      emitRef.current?.()
    },
  }))

  useEffect(() => {
    if (!wrapperRef.current) return

    const canvasEl = document.createElement('canvas')
    canvasEl.width = size
    canvasEl.height = size
    wrapperRef.current.appendChild(canvasEl)

    let destroyed = false

    import('fabric').then(async ({ Canvas, FabricImage }) => {
      if (destroyed) return

      const fb = new Canvas(canvasEl, { width: size, height: size })
      fbRef.current = fb

      const initialScale = size / 550
      const img = await FabricImage.fromURL('/kernel-logo.png')
      img.scaleToWidth(140 * initialScale)
      img.set({
        left: size * 0.88 - 60 * initialScale,
        top:  size * 0.72  - 60 * initialScale,
      })
      fb.add(img)
      fb.setActiveObject(img)
      fb.renderAll()

      const multiplier = TARGET_EXPORT / size
      const emit = () => onChange(fb.toCanvasElement(multiplier))
      emitRef.current = emit
      emit()

      const MARGIN_START = 120  // sol ve üst
      const MARGIN_END   = 30   // sağ ve alt
      fb.on('object:moving', ({ target }: any) => {
        if (!target) return
        const w = target.getScaledWidth()
        const h = target.getScaledHeight()
        target.left = Math.min(Math.max(target.left, MARGIN_START - w), size - MARGIN_END)
        target.top  = Math.min(Math.max(target.top,  MARGIN_START - h), size - MARGIN_END)
        target.setCoords()
        emit()
      })
      fb.on('object:scaling', emit)
      fb.on('object:rotating', emit)
      fb.on('object:modified', emit)
      fb.on('object:added', emit)
      fb.on('object:removed', emit)

      function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = fb.getActiveObject()
          if (active) {
            fb.remove(active)
            fb.discardActiveObject()
            fb.renderAll()
          }
        }
      }
      window.addEventListener('keydown', onKeyDown)
      const cleanup = () => window.removeEventListener('keydown', onKeyDown)
      ;(fb as any).__keyCleanup = cleanup
    })

    return () => {
      destroyed = true
      ;(fbRef.current as any)?.__keyCleanup?.()
      fbRef.current?.dispose()
      fbRef.current = null
      emitRef.current = null
      canvasEl.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !fbRef.current) return
    e.target.value = ''

    const { FabricImage } = await import('fabric')
    const blobUrl = URL.createObjectURL(file)
    const img = await FabricImage.fromURL(blobUrl)
    URL.revokeObjectURL(blobUrl)

    const fb = fbRef.current
    img.scaleToWidth(140 * initialScale)
    img.set({ ...defaultPos, angle: 0 })
    fb.add(img)
    fb.setActiveObject(img)
    fb.renderAll()
    emitRef.current?.()
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-[#27272a] bg-[#09090b]"
      style={{ width: size, height: size }}
    >
      <img
        src="/uv-template.png"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ opacity: 0.3 }}
        alt="UV template"
      />
      <div ref={wrapperRef} className="absolute inset-0" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
})
