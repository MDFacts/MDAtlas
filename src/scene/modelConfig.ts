/**
 * Realistic body GLBs (CC-BY, see public/models/ATTRIBUTION.md). The scene loads
 * the model for the selected sex and falls back to the procedural body if a file
 * is absent or fails to load.
 *
 * Each model is fit into a shared coordinate envelope (feet near y=0, crown near
 * y≈BODY_TARGET_HEIGHT) so the tap hit-proxies line up regardless of the model's
 * original scale or pose.
 */
export const BODY_MODELS = {
  male: '/models/body_male.glb',
  female: '/models/body_female.glb',
} as const

export type BodySex = keyof typeof BODY_MODELS

/** Realistic skeleton meshes, authored to overlay the body models. */
export const SKELETON_MODELS = {
  male: '/models/skeleton_male.glb',
  female: '/models/skeleton_female.glb',
} as const

/** Target standing height in world units — matches the hit-proxy layout. */
export const BODY_TARGET_HEIGHT = 3.4

/**
 * Single shared scale applied to BOTH bodies. The models are pre-normalized in
 * Blender to a consistent real-world scale (feet grounded, female proportionally
 * shorter than male), so one shared scale preserves that relative sizing — unlike
 * per-model height fitting, which would wrongly equalize their heights. Calibrated
 * so a standing adult maps to roughly BODY_TARGET_HEIGHT world units.
 */
export const BODY_MODEL_SCALE = 1.95
