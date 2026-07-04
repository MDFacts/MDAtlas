import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const rightUpperAbdomenPack: ContentPack = {
  regionId: 'rightUpperAbdomen',
  entryNodeId: 'fattyMeals',
  nodes: {
    fattyMeals: {
      question: {
        id: 'fattyMeals',
        text: 'Does the pain flare after fatty or rich meals?',
        options: YES_NO,
      },
      next: { yes: 'colicky', no: 'colicky' },
    },
    colicky: {
      question: {
        id: 'colicky',
        text: 'How does the pain behave?',
        options: [
          { value: 'waves', label: 'Comes in intense waves' },
          { value: 'constant', label: 'Steady and constant' },
        ],
      },
      next: { waves: 'feverRuq', constant: 'feverRuq' },
    },
    feverRuq: {
      question: { id: 'feverRuq', text: 'Do you have a fever or chills?', options: YES_NO },
      next: { yes: 'vomiting', no: 'vomiting' },
    },
    vomiting: {
      question: { id: 'vomiting', text: 'Have you been vomiting?', options: YES_NO },
      next: { yes: 'yellowing', no: 'yellowing' },
    },
    yellowing: {
      question: {
        id: 'yellowing',
        text: 'Any yellowing of your skin or eyes, or unusually dark urine?',
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
      next: { yes: 'shoulderTip', no: 'shoulderTip' },
    },
    shoulderTip: {
      question: {
        id: 'shoulderTip',
        text: 'Does the pain refer up to your right shoulder blade?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'biliary-colic',
      name: 'Gallstone pain (biliary colic)',
      baseWeight: 1,
      supports: { fattyMeals: ['yes'], colicky: ['waves'], shoulderTip: ['yes'] },
      tier: 'primary-care',
      specialty: 'General surgery / Gastroenterology',
      suggestedTests: ['Abdominal ultrasound', 'Liver function tests'],
      explanation:
        'Gallstones cause waves of pain under the right ribs, classically after rich meals, sometimes referring to the right shoulder blade.',
    },
    {
      id: 'cholecystitis',
      name: 'Gallbladder inflammation (cholecystitis)',
      baseWeight: 1,
      supports: { feverRuq: ['yes'], fattyMeals: ['yes'], vomiting: ['yes'], colicky: ['constant'] },
      tier: 'urgent',
      specialty: 'General surgery',
      suggestedTests: ['Abdominal ultrasound', 'CBC', 'Liver function tests'],
      explanation:
        'When a gallstone blocks the gallbladder, pain becomes constant with fever and vomiting. This needs same-day assessment.',
    },
    {
      id: 'liver-inflammation',
      name: 'Liver inflammation (hepatitis)',
      baseWeight: 0,
      supports: { yellowing: ['yes'], feverRuq: ['yes'], fattyMeals: ['no'] },
      tier: 'urgent',
      specialty: 'Hepatology / Gastroenterology',
      suggestedTests: ['Liver function tests', 'Hepatitis panel', 'Ultrasound'],
      explanation:
        'An inflamed liver causes a dull ache under the right ribs, often with fatigue, nausea, and sometimes yellowing of the skin or eyes.',
    },
    {
      id: 'ruq-dyspepsia',
      name: 'Indigestion (dyspepsia)',
      baseWeight: 1,
      supports: { antacids: ['yes'], colicky: ['constant'], feverRuq: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Trial of antacids; H. pylori test if persistent'],
      explanation:
        'Irritation of the stomach or duodenum can sit under the right ribs and typically eases with antacids and smaller meals.',
    },
  ],
  redFlags: [
    {
      id: 'rf-jaundice',
      label: 'Yellowing skin or eyes with right upper abdominal pain — bile duct blockage or liver problem needs emergency review',
      tier: 'emergency',
      when: [{ questionId: 'yellowing', answers: ['yes'] }],
    },
    {
      id: 'rf-ruq-fever',
      label: 'Fever with severe right upper abdominal pain',
      tier: 'urgent',
      when: [{ questionId: 'feverRuq', answers: ['yes'] }],
      minSeverity: 7,
    },
  ],
}
