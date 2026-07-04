import { contentPackSchema } from '../contentPackSchema'
import type { ContentPack } from '../types'
import { chestPack } from './chest'
import { rightLowerAbdomenPack } from './rightLowerAbdomen'
import { leftShoulderPack, rightShoulderPack } from './shoulder'

function validated(pack: ContentPack): ContentPack {
  contentPackSchema.parse(pack)
  return pack
}

export const CONTENT_PACKS: Record<string, ContentPack> = {
  rightLowerAbdomen: validated(rightLowerAbdomenPack),
  chest: validated(chestPack),
  leftShoulder: validated(leftShoulderPack),
  rightShoulder: validated(rightShoulderPack),
}

export function packForRegion(regionId: string): ContentPack | null {
  return CONTENT_PACKS[regionId] ?? null
}
