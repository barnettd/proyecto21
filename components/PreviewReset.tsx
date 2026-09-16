'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { resetPreview } from '@/app/actions'

/** Dev-only control: clears the local answer so the flow can be walked again. */
export function PreviewReset({ dayId }: { dayId: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <nav className="preview-bar" aria-label="Vista previa">
      <button
        type="button"
        onClick={() =>
          start(async () => {
            await resetPreview(dayId)
            try {
              localStorage.removeItem(`p21-draft-${dayId}`)
            } catch {
              /* ignore */
            }
            router.refresh()
          })
        }
      >
        {pending ? 'Reiniciando…' : '↺ Reiniciar vista previa'}
      </button>
    </nav>
  )
}
