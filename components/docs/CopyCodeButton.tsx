'use client'

import { useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyCodeButton() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>('.prose pre')

    blocks.forEach((pre) => {
      if (pre.querySelector('[data-copy-btn]')) return

      pre.style.position = 'relative'

      const btn = document.createElement('button')
      btn.setAttribute('data-copy-btn', '')
      btn.className =
        'absolute top-2 right-2 p-1.5 rounded-md bg-background/10 hover:bg-background/20 text-foreground/60 hover:text-foreground/90 transition-colors'
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`

      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')
        const text = code?.innerText ?? ''
        await navigator.clipboard.writeText(text)

        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
        setTimeout(() => {
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
        }, 1500)
      })

      pre.appendChild(btn)
    })
  }, [])

  return null
}
