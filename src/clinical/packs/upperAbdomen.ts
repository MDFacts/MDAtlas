import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const upperAbdomenPack: ContentPack = {
  regionId: 'upperAbdomen',
  entryNodeId: 'burning',
  nodes: {
    burning: {
      question: {
        id: 'burning',
        text: 'Is it a burning or gnawing pain related to meals?',
        options: YES_NO,
      },
      next: { yes: 'rightSide', no: 'rightSide' },
    },
    rightSide: {
      question: {
        id: 'rightSide',
        text: 'Does it sit under the right ribs, especially after fatty meals?',
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
      next: { yes: 'chestlike', no: 'chestlike' },
    },
    chestlike: {
      question: {
        id: 'chestlike',
        text: 'Do you also feel chest pressure, especially with exertion?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'gerd-dyspepsia',
      name: 'Acid reflux / indigestion',
      baseWeight: 1,
      supports: { burning: ['yes'], stoolDark: ['no'], vomiting: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Trial of antacids', 'H. pylori test if persistent'],
      explanation:
        'Stomach acid irritating the upper gut causes burning discomfort tied to meals. Often improves with smaller meals, less caffeine and alcohol, and antacids.',
    },
    {
      id: 'peptic-ulcer',
      name: 'Peptic ulcer',
      baseWeight: 1,
      supports: { burning: ['yes'], alcohol: ['yes'], vomiting: ['yes'] },
      tier: 'primary-care',
      specialty: 'Gastroenterology',
      suggestedTests: ['H. pylori test', 'Endoscopy if symptoms persist or bleeding signs'],
      explanation:
        'A sore in the stomach or duodenal lining causing gnawing pain that changes with eating. Very treatable once identified.',
    },
    {
      id: 'gallstones',
      name: 'Gallbladder pain (biliary colic)',
      baseWeight: 1,
      supports: { rightSide: ['yes'], vomiting: ['yes'], burning: ['no'] },
      tier: 'primary-care',
      specialty: 'General surgery / Gastroenterology',
      suggestedTests: ['Abdominal ultrasound', 'Liver function tests'],
      explanation:
        'Gallstones cause waves of pain under the right ribs, classically after rich or fatty meals, sometimes with nausea. Persistent pain with fever needs urgent review.',
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
        'Inflammation of the pancreas causes severe upper abdominal pain boring through to the back, often with vomiting. It needs same-day medical assessment.',
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
      label: 'Upper abdominal pain with chest pressure on exertion — the heart must be checked first',
      tier: 'urgent',
      when: [{ questionId: 'chestlike', answers: ['yes'] }],
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
