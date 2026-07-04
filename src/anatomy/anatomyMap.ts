export type BodySide = 'left' | 'right' | 'midline'
export type AnatomyLayer = 'skin' | 'skeleton' | 'organs'

export interface AnatomyRegion {
  regionId: string
  name: string
  snomedTag: string
  side: BodySide
  structuresByLayer: Record<AnatomyLayer, string[]>
}

function region(
  regionId: string,
  name: string,
  snomedTag: string,
  side: BodySide,
  structuresByLayer: Record<AnatomyLayer, string[]>,
): AnatomyRegion {
  return { regionId, name, snomedTag, side, structuresByLayer }
}

export const ANATOMY_MAP: Record<string, AnatomyRegion> = {
  head: region('head', 'Head', 'SCT:69536005', 'midline', {
    skin: ['Scalp', 'Face'],
    skeleton: ['Skull'],
    organs: ['Brain'],
  }),
  neck: region('neck', 'Neck', 'SCT:45048000', 'midline', {
    skin: ['Neck'],
    skeleton: ['Cervical spine'],
    organs: ['Thyroid', 'Larynx'],
  }),
  chest: region('chest', 'Chest', 'SCT:51185008', 'midline', {
    skin: ['Chest wall'],
    skeleton: ['Ribs', 'Sternum'],
    organs: ['Heart', 'Lungs', 'Esophagus'],
  }),
  upperAbdomen: region('upperAbdomen', 'Upper abdomen', 'SCT:41527007', 'midline', {
    skin: ['Epigastric wall'],
    skeleton: ['Lower ribs'],
    organs: ['Stomach', 'Liver', 'Pancreas', 'Gallbladder'],
  }),
  rightLowerAbdomen: region('rightLowerAbdomen', 'Right lower abdomen', 'SCT:48544008', 'right', {
    skin: ['Right iliac fossa wall'],
    skeleton: ['Right iliac crest'],
    organs: ['Appendix', 'Cecum', 'Right ovary'],
  }),
  leftLowerAbdomen: region('leftLowerAbdomen', 'Left lower abdomen', 'SCT:68505006', 'left', {
    skin: ['Left iliac fossa wall'],
    skeleton: ['Left iliac crest'],
    organs: ['Sigmoid colon', 'Left ovary'],
  }),
  pelvis: region('pelvis', 'Pelvis', 'SCT:12921003', 'midline', {
    skin: ['Suprapubic wall'],
    skeleton: ['Pelvic bones'],
    organs: ['Bladder', 'Reproductive organs'],
  }),
  leftShoulder: region('leftShoulder', 'Left shoulder', 'SCT:91775009', 'left', {
    skin: ['Left deltoid area'],
    skeleton: ['Left humeral head', 'Left clavicle', 'Left scapula'],
    organs: [],
  }),
  rightShoulder: region('rightShoulder', 'Right shoulder', 'SCT:91774008', 'right', {
    skin: ['Right deltoid area'],
    skeleton: ['Right humeral head', 'Right clavicle', 'Right scapula'],
    organs: [],
  }),
  upperBack: region('upperBack', 'Upper back', 'SCT:304035009', 'midline', {
    skin: ['Upper back'],
    skeleton: ['Thoracic spine', 'Scapulae'],
    organs: ['Lungs (posterior)'],
  }),
  lowerBack: region('lowerBack', 'Lower back', 'SCT:37822005', 'midline', {
    skin: ['Lumbar area'],
    skeleton: ['Lumbar spine', 'Sacrum'],
    organs: ['Kidneys'],
  }),
  leftArm: region('leftArm', 'Left arm', 'SCT:368208006', 'left', {
    skin: ['Left arm'],
    skeleton: ['Left humerus', 'Left radius/ulna'],
    organs: [],
  }),
  rightArm: region('rightArm', 'Right arm', 'SCT:368209003', 'right', {
    skin: ['Right arm'],
    skeleton: ['Right humerus', 'Right radius/ulna'],
    organs: [],
  }),
  leftLeg: region('leftLeg', 'Left leg', 'SCT:32153003', 'left', {
    skin: ['Left leg'],
    skeleton: ['Left femur', 'Left tibia/fibula'],
    organs: [],
  }),
  rightLeg: region('rightLeg', 'Right leg', 'SCT:62175007', 'right', {
    skin: ['Right leg'],
    skeleton: ['Right femur', 'Right tibia/fibula'],
    organs: [],
  }),
}

export function regionName(regionId: string): string {
  return ANATOMY_MAP[regionId]?.name ?? regionId
}
