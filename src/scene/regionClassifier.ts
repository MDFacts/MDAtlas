import type { BodySex } from './modelConfig'

/**
 * Classifies a point ON THE BODY SURFACE into an assessment region.
 *
 * This replaces the invisible hit-proxy volumes for the skin layer. Proxies
 * floated in front of the mesh, so a ray aimed at one body part could be
 * intercepted by a volume belonging to another (worse when zoomed/orbited —
 * the "genital area on the thigh" bug). Raycasting the visible mesh itself and
 * classifying the true hit point makes that impossible: the selected region is
 * a pure function of where on the body the tap landed.
 *
 * Coordinates are BODY-LOCAL world units: feet at y=0, body faces +z, body's
 * right side at −x (mirror of the viewer's left). Callers must un-rotate the
 * point when the model is flipped for the back view.
 */
export interface RegionBounds {
  /** Top of the head envelope; above neckTop is head. */
  neckTop: number
  /** Shoulder line — chest starts below, the neck column sits above. */
  shoulderTop: number
  /** The armpit line: the shoulder cap spans from here upward (lateral of
   * shoulderMinX), wrapping front → lateral → rear deltoid. Below it, lateral
   * territory belongs to the arm. */
  shoulderBottom: number
  /** Bottom of the pecs/bust: chest ↔ upper-abdomen boundary. */
  pecBottom: number
  /** The navel: upper ↔ lower abdomen boundary. */
  navel: number
  /** Top of the pelvic region (≈ iliac line): lower-abdomen ↔ pelvis boundary. */
  pelvisTop: number
  /** The pubic bone: bottom of the pelvis band; the genital band sits below it. */
  pubic: number
  /** Top of the legs (the crotch); below this is legs. */
  crotch: number
  /** Vertical band of the external genitalia (front, near midline). */
  genitalTop: number
  genitalBottom: number
  /** Half-width of the genital band around the midline. */
  genitalHalfW: number
  /** |x| beyond this (below the shoulder line) is the arm. */
  armMinX: number
  /** |x| beyond this at shoulder height is the shoulder ball. */
  shoulderMinX: number
  /** z behind this is the back surface… */
  backMaxZ: number
  /** …but only within this half-width of the spine — the torso's SIDE surface
   * (armpit, flank) also curves behind the z-centroid and must not read as back. */
  backHalfW: number
}

/**
 * Boundaries MEASURED off each mesh's geometry (not eyeballed):
 *  - crotch = the height where the inter-leg gap closes (midline occupancy scan);
 *  - genital band = the dense forward vertex cluster just above the crotch
 *    (frontal-z bulge scan near the midline);
 *  - pubic bone = just above the genital band (matches anthropometric ≈0.51×H);
 *  - navel ≈0.60×H and pec/bust line ≈0.69×H (standard proportions on this
 *    normalized rig), chin ≈0.87×H.
 * Male H≈3.47, female H≈3.17.
 */
export const REGION_BOUNDS: Record<BodySex, RegionBounds> = {
  male: {
    neckTop: 3.02,
    shoulderTop: 2.77,
    shoulderBottom: 2.48,
    pecBottom: 2.39,
    navel: 2.1,
    pelvisTop: 1.9,
    pubic: 1.74,
    crotch: 1.52,
    genitalTop: 1.72,
    genitalBottom: 1.52,
    genitalHalfW: 0.1,
    // Armpit crease sits at |x|≈0.42; anything lateral of it is arm. (0.45 left
    // the inner half of the upper arm reading as chest.)
    armMinX: 0.41,
    shoulderMinX: 0.32,
    backMaxZ: -0.1,
    backHalfW: 0.32,
  },
  female: {
    neckTop: 2.76,
    shoulderTop: 2.54,
    shoulderBottom: 2.28,
    pecBottom: 2.2,
    navel: 1.94,
    pelvisTop: 1.83,
    pubic: 1.7,
    crotch: 1.53,
    genitalTop: 1.68,
    genitalBottom: 1.53,
    genitalHalfW: 0.09,
    // Female armpit crease ≈0.38.
    armMinX: 0.38,
    shoulderMinX: 0.29,
    backMaxZ: -0.1,
    backHalfW: 0.3,
  },
}

export interface Point3 {
  x: number
  y: number
  z: number
}

/** Region for a body-surface point, in body-local coordinates. */
export function classifyRegion(point: Point3, sex: BodySex): string {
  const B = REGION_BOUNDS[sex]
  const { x, y, z } = point
  const ax = Math.abs(x)
  const left = x > 0

  if (y > B.neckTop) return 'head'

  // Shoulder cap: from the armpit line upward and the crease outward, wrapping
  // front → lateral → rear deltoid (deliberately no z condition, so the rear
  // deltoid is shoulder — not upper back or chest).
  if (y > B.shoulderBottom && ax > B.shoulderMinX) {
    return left ? 'leftShoulder' : 'rightShoulder'
  }
  if (y > B.shoulderTop) return 'neck'

  // Arms — everything lateral of the armpit crease below the shoulder cap.
  if (ax > B.armMinX) {
    return left ? 'leftArm' : 'rightArm'
  }

  // Back surface — torso only, and only near the spine: the torso's SIDE (armpit,
  // flank) also curves behind the z-centroid and must stay chest/abdomen.
  if (z < B.backMaxZ && ax < B.backHalfW && y > B.crotch) {
    if (y > B.pecBottom) return 'upperBack'
    if (y > B.pubic) return 'lowerBack'
    return 'pelvis' // gluteal region
  }

  if (y > B.pecBottom) return 'chest'
  if (y > B.navel) {
    // RUQ / epigastric / LUQ tile the band; body's right is −x.
    if (x < -0.09) return 'rightUpperAbdomen'
    if (x > 0.09) return 'leftUpperAbdomen'
    return 'epigastric'
  }
  if (y > B.pelvisTop) {
    return left ? 'leftLowerAbdomen' : 'rightLowerAbdomen'
  }
  // Pelvis band: iliac line down to the pubic bone, full width.
  if (y > B.pubic) return 'pelvis'

  // External genitalia: a narrow central band on the FRONT of the pubis. The
  // surface there can dip slightly behind the body's z-centroid (measured down
  // to z≈−0.01 on the male), so "front" is anything clearly ahead of the back.
  if (y > B.genitalBottom && y <= B.genitalTop && ax < B.genitalHalfW && z > -0.05) {
    return 'genitals'
  }
  if (y > B.crotch) return 'pelvis'
  return left ? 'leftLeg' : 'rightLeg'
}
