import { describe, expect, it } from 'vitest'
import { boneLabel, regionForBone } from './boneLabels'

describe('boneLabel', () => {
  it('names bones from the male export node ids', () => {
    expect(boneLabel('Object_14')).toBe('Spine (vertebrae)')
    expect(boneLabel('Object_11')).toBe('Ribs')
    expect(boneLabel('Object_16')).toBe('Skull')
  })

  it('names bones from the female export (Blender 3-digit duplicate suffix)', () => {
    // The female GLB exports Object_14 as Object_14001 etc.; the suffix must be
    // stripped or hover silently fails on the whole female skeleton.
    expect(boneLabel('Object_14001')).toBe('Spine (vertebrae)')
    expect(boneLabel('Object_11001')).toBe('Ribs')
    expect(boneLabel('Object_6001')).toBe('Arm & hand bones')
  })

  it('resolves merged arm/leg meshes to a specific bone by height', () => {
    expect(boneLabel('Object_6001', { x: -0.5, y: 2.4 })).toBe('Right humerus (upper arm)')
    expect(boneLabel('Object_7', { x: 0.2, y: 0.5 })).toBe('Left tibia & fibula (shin)')
  })

  it('returns null for unrecognised meshes', () => {
    expect(boneLabel('Object_999')).toBeNull()
    expect(boneLabel('Camera')).toBeNull()
  })
})

describe('regionForBone', () => {
  it('maps male and female node ids to the same region', () => {
    expect(regionForBone('Object_11', { x: 0, y: 2.6 })).toBe('chest')
    expect(regionForBone('Object_11001', { x: 0, y: 2.6 })).toBe('chest')
  })

  it('splits the spine into upper and lower back by height', () => {
    expect(regionForBone('Object_14', { x: 0, y: 2.5 })).toBe('upperBack')
    expect(regionForBone('Object_14', { x: 0, y: 1.9 })).toBe('lowerBack')
  })
})
