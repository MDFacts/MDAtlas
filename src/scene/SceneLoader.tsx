import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'

/** Shown in place of the body while a realistic GLB is loading — a small spinner
 * at body-centre height, instead of flashing the low-poly primitive fallback.
 * Held back for a moment so a fast (<1s) load shows nothing at all rather than a
 * spinner flash; if the load finishes first this component unmounts before the
 * timer fires. */
export function SceneLoader() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1000)
    return () => clearTimeout(t)
  }, [])

  if (!show) {
    return null
  }

  return (
    <Html center position={[0, 1.9, 0]} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none h-9 w-9 animate-spin rounded-full border-[3px] border-brand/25 border-t-brand"
        role="status"
        aria-label="Loading model"
      />
    </Html>
  )
}
