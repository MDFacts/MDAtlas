import { contentPackSchema } from '../contentPackSchema'
import type { ContentPack } from '../types'
import { leftArmPack, rightArmPack } from './arm'
import { chestPack } from './chest'
import { epigastricPack } from './epigastric'
import { headPack } from './head'
import { leftUpperAbdomenPack } from './leftUpperAbdomen'
import { neckPack } from './neck'
import { rightLowerAbdomenPack } from './rightLowerAbdomen'
import { rightUpperAbdomenPack } from './rightUpperAbdomen'
import { leftShoulderPack, rightShoulderPack } from './shoulder'
import { upperBackPack } from './upperBack'

function validated(pack: ContentPack): ContentPack {
  contentPackSchema.parse(pack)
  return pack
}

export const CONTENT_PACKS: Record<string, ContentPack> = {
  head: validated(headPack),
  neck: validated(neckPack),
  chest: validated(chestPack),
  rightUpperAbdomen: validated(rightUpperAbdomenPack),
  epigastric: validated(epigastricPack),
  leftUpperAbdomen: validated(leftUpperAbdomenPack),
  upperBack: validated(upperBackPack),
  rightLowerAbdomen: validated(rightLowerAbdomenPack),
  leftShoulder: validated(leftShoulderPack),
  rightShoulder: validated(rightShoulderPack),
  leftArm: validated(leftArmPack),
  rightArm: validated(rightArmPack),
}

export function packForRegion(regionId: string): ContentPack | null {
  return CONTENT_PACKS[regionId] ?? null
}
