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
    expect(boneLabel('Object_6001', { x: -0.5, y: 2.4, z: 0 })).toBe('Right humerus (upper arm)')
    expect(boneLabel('Object_7', { x: 0.2, y: 0.5, z: 0 })).toBe('Left tibia & fibula (shin)')
  })

  it('names the shoulder girdle merged into the arm mesh (scapula vs clavicle by depth)', () => {
    // High + posterior = scapula; high + anterior = clavicle. Body's right is −x.
    expect(boneLabel('Object_6', { x: -0.16, y: 2.7, z: -0.16 })).toBe('Right shoulder blade (scapula)')
    expect(boneLabel('Object_6001', { x: 0.16, y: 2.7, z: 0.16 })).toBe('Left collarbone (clavicle)')
    // Same height but centred in depth is still the humerus, not the girdle.
    expect(boneLabel('Object_6', { x: -0.4, y: 2.5, z: 0 })).toBe('Right humerus (upper arm)')
  })

  it('returns null for unrecognised meshes', () => {
    expect(boneLabel('Object_999')).toBeNull()
    expect(boneLabel('Camera')).toBeNull()
  })
})

describe('regionForBone', () => {
  it('maps male and female node ids to the same region', () => {
    expect(regionForBone('Object_11', { x: 0, y: 2.6, z: 0 })).toBe('chest')
    expect(regionForBone('Object_11001', { x: 0, y: 2.6, z: 0 })).toBe('chest')
  })

  it('splits the spine into upper and lower back by height', () => {
    expect(regionForBone('Object_14', { x: 0, y: 2.5, z: -0.2 })).toBe('upperBack')
    expect(regionForBone('Object_14', { x: 0, y: 1.9, z: -0.2 })).toBe('lowerBack')
  })

  it('routes the shoulder girdle to the shoulder, and the arm shaft to the arm', () => {
    expect(regionForBone('Object_6', { x: -0.16, y: 2.7, z: -0.16 })).toBe('rightShoulder')
    expect(regionForBone('Object_6001', { x: 0.16, y: 2.7, z: 0.16 })).toBe('leftShoulder')
    expect(regionForBone('Object_6', { x: -0.5, y: 1.9, z: 0 })).toBe('rightArm')
  })
})
