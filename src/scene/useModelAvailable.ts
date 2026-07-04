import { useEffect, useState } from 'react'

type Availability = 'checking' | 'available' | 'absent'

/**
 * Probes whether the body GLB exists before we try to load it, so the app shows
 * the fallback quietly instead of throwing a loader error on every render until
 * the model is sourced. Vite dev serves missing /public files as the SPA HTML
 * (200 + text/html), so we treat a non-model content-type as absent too.
 */
export function useModelAvailable(url: string): Availability {
  const [state, setState] = useState<Availability>('checking')

  useEffect(() => {
    let active = true
    fetch(url, { method: 'HEAD' })
      .then((response) => {
        if (!active) {
          return
        }
        const type = response.headers.get('content-type') ?? ''
        const ok = response.ok && !type.includes('text/html')
        setState(ok ? 'available' : 'absent')
      })
      .catch(() => {
        if (active) {
          setState('absent')
        }
      })
    return () => {
      active = false
    }
  }, [url])

  return state
}
