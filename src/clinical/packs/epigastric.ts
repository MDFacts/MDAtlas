import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const epigastricPack: ContentPack = {
  regionId: 'epigastric',
  entryNodeId: 'burning',
  nodes: {
    burning: {
      question: {
        id: 'burning',
        text: 'Is it a burning or gnawing pain related to meals?',
        options: YES_NO,
      },
      next: { yes: 'radiateBack', no: 'radiateBack' },
    },
    radiateBack: {
      question: {
        id: 'radiateBack',
        text: 'Does the pain bore straight through to your back?',
        options: YES_NO,
      },
      next: { yes: 'vomiting', no: 'vomiting' },
    },
    vomiting: {
      question: {
        id: 'vomiting',
        text: 'Have you been vomiting repeatedly?',
        options: YES_NO,
      },
      next: { yes: 'stoolDark', no: 'stoolDark' },
    },
    stoolDark: {
      question: {
        id: 'stoolDark',
        text: 'Have you had black, tarry stools or vomited anything like coffee grounds?',
        options: YES_NO,
      },
      next: { yes: 'alcohol', no: 'alcohol' },
    },
    alcohol: {
      question: {
        id: 'alcohol',
        text: 'Have you had heavy alcohol use recently?',
        options: YES_NO,
      },
      next: { yes: 'antacids', no: 'antacids' },
    },
    antacids: {
      question: {
        id: 'antacids',
        text: 'Do antacids make it feel better?',
        options: YES_NO,
      },
      next: { yes: 'chestPressure', no: 'chestPressure' },
    },
    chestPressure: {
      question: {
        id: 'chestPressure',
        text: 'Do you also feel chest pressure, especially with exertion?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'gerd-epigastric',
      name: 'Acid reflux (GERD)',
      baseWeight: 1,
      supports: { burning: ['yes'], antacids: ['yes'], radiateBack: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Trial of antacids', 'Endoscopy if persistent'],
      explanation:
        'Stomach acid irritating the esophagus causes burning discomfort behind the breastbone and upper stomach, usually tied to meals or lying down.',
    },
    {
      id: 'peptic-ulcer',
      name: 'Peptic ulcer',
      baseWeight: 1,
      supports: { burning: ['yes'], vomiting: ['yes'], alcohol: ['yes'] },
      tier: 'primary-care',
      specialty: 'Gastroenterology',
      suggestedTests: ['H. pylori test', 'Endoscopy if persistent or bleeding signs'],
      explanation:
        'A sore in the stomach or duodenal lining causing gnawing pain that changes with eating. Very treatable once identified.',
    },
    {
      id: 'pancreatitis',
      name: 'Pancreatitis',
      baseWeight: 0,
      supports: { radiateBack: ['yes'], alcohol: ['yes'], vomiting: ['yes'] },
      tier: 'urgent',
      specialty: 'Emergency medicine / Gastroenterology',
      suggestedTests: ['Lipase blood test', 'Abdominal imaging'],
      explanation:
        'Inflammation of the pancreas causes severe upper-middle abdominal pain boring through to the back, often with vomiting. It needs same-day assessment.',
    },
    {
      id: 'gastritis',
      name: 'Stomach lining irritation (gastritis)',
      baseWeight: 1,
      supports: { alcohol: ['yes'], burning: ['yes'], antacids: ['yes'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Usually none; H. pylori test if persistent'],
      explanation:
        'Alcohol, anti-inflammatory medicines, or infection can inflame the stomach lining, causing burning upper-middle abdominal pain and nausea.',
    },
  ],
  redFlags: [
    {
      id: 'rf-gi-bleed',
      label: 'Black tarry stools or coffee-ground vomit — signs of internal bleeding',
      tier: 'emergency',
      when: [{ questionId: 'stoolDark', answers: ['yes'] }],
    },
    {
      id: 'rf-cardiac-mimic',
      label: 'Upper-middle abdominal pain with chest pressure on exertion — the heart must be checked first',
      tier: 'urgent',
      when: [{ questionId: 'chestPressure', answers: ['yes'] }],
    },
    {
      id: 'rf-pancreatic',
      label: 'Severe pain boring through to the back',
      tier: 'urgent',
      when: [{ questionId: 'radiateBack', answers: ['yes'] }],
      minSeverity: 7,
    },
  ],
}
