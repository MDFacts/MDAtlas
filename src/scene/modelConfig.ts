/**
 * Where the realistic body GLB lives once sourced. The scene loads this and
 * falls back to the procedural body if it is absent or fails to load.
 *
 * The model is expected to be a standing, front-facing human roughly centered
 * on the origin. `fitToHeight` rescales/recenters it into the shared coordinate
 * envelope (feet near y=0, crown near y≈3.4) that the tap hit-proxies use.
 */
export const BODY_MODEL_URL = '/models/body.glb'

/** Target standing height in world units — matches the hit-proxy layout. */
export const BODY_TARGET_HEIGHT = 3.4

/** Vertical offset applied after fitting so feet rest near the ground plane. */
export const BODY_GROUND_Y = 0
