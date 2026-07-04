import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const leftUpperAbdomenPack: ContentPack = {
  regionId: 'leftUpperAbdomen',
  entryNodeId: 'traumaLuq',
  nodes: {
    traumaLuq: {
      question: {
        id: 'traumaLuq',
        text: 'Was there a recent blow or fall to your left side or ribs?',
        options: YES_NO,
      },
      next: { yes: 'leftShoulderTip', no: 'leftShoulderTip' },
    },
    leftShoulderTip: {
      question: {
        id: 'leftShoulderTip',
        text: 'Is there a sharp pain at the tip of your left shoulder?',
        options: YES_NO,
      },
      next: { yes: 'mealsLuq', no: 'mealsLuq' },
    },
    mealsLuq: {
      question: {
        id: 'mealsLuq',
        text: 'Is it worse with meals, or with bloating and gas?',
        options: YES_NO,
      },
      next: { yes: 'feverLuq', no: 'feverLuq' },
    },
    feverLuq: {
      question: { id: 'feverLuq', text: 'Do you have a fever or chills?', options: YES_NO },
      next: { yes: 'stoolDark', no: 'stoolDark' },
    },
    stoolDark: {
      question: {
        id: 'stoolDark',
        text: 'Have you had black, tarry stools?',
        options: YES_NO,
      },
      next: { yes: 'breathLuq', no: 'breathLuq' },
    },
    breathLuq: {
      question: {
        id: 'breathLuq',
        text: 'Is it sharper when you take a deep breath or twist?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'gastric-irritation',
      name: 'Stomach irritation',
      baseWeight: 1,
      supports: { mealsLuq: ['yes'], traumaLuq: ['no'], breathLuq: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Trial of antacids; H. pylori test if persistent'],
      explanation:
        'The stomach sits under the left ribs — irritation of its lining causes meal-related discomfort and bloating that usually settles with simple measures.',
    },
    {
      id: 'splenic-condition',
      name: 'Spleen problem',
      baseWeight: 0,
      supports: { traumaLuq: ['yes'], leftShoulderTip: ['yes'], feverLuq: ['yes'] },
      tier: 'urgent',
      specialty: 'Emergency medicine / General surgery',
      suggestedTests: ['Abdominal ultrasound or CT', 'CBC'],
      explanation:
        'The spleen sits under the left ribs. Injury or enlargement causes left upper pain, classically referring to the left shoulder tip. This needs prompt evaluation.',
    },
    {
      id: 'luq-rib-muscle',
      name: 'Rib or muscle strain',
      baseWeight: 1,
      supports: { breathLuq: ['yes'], traumaLuq: ['yes'], mealsLuq: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Physical exam; X-ray if pain is severe after injury'],
      explanation:
        'Strained rib-cage muscles or a bruised rib hurt with deep breaths, twisting, and pressing on the spot — and settle over a couple of weeks.',
    },
    {
      id: 'pancreatitis-tail',
      name: 'Pancreatitis (tail of the pancreas)',
      baseWeight: 0,
      supports: { feverLuq: ['yes'], mealsLuq: ['yes'], breathLuq: ['no'] },
      tier: 'urgent',
      specialty: 'Gastroenterology',
      suggestedTests: ['Lipase blood test', 'Abdominal imaging'],
      explanation:
        'The tail of the pancreas reaches the left upper abdomen; inflammation there causes deep, persistent pain often worse after meals.',
    },
  ],
  redFlags: [
    {
      id: 'rf-kehr',
      label: 'Left upper abdominal pain referring to the left shoulder tip — internal bleeding near the spleen must be ruled out',
      tier: 'emergency',
      when: [{ questionId: 'leftShoulderTip', answers: ['yes'] }],
    },
    {
      id: 'rf-luq-trauma',
      label: 'Significant left-side impact with ongoing pain — spleen injury must be ruled out',
      tier: 'urgent',
      when: [{ questionId: 'traumaLuq', answers: ['yes'] }],
      minSeverity: 6,
    },
    {
      id: 'rf-luq-bleed',
      label: 'Black tarry stools with abdominal pain — signs of internal bleeding',
      tier: 'emergency',
      when: [{ questionId: 'stoolDark', answers: ['yes'] }],
    },
  ],
}
