import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const neckPack: ContentPack = {
  regionId: 'neck',
  entryNodeId: 'onsetType',
  nodes: {
    onsetType: {
      question: {
        id: 'onsetType',
        text: 'How did it start?',
        options: [
          { value: 'waking', label: 'Stiff after waking up' },
          { value: 'injury', label: 'After an accident or sudden jolt' },
          { value: 'gradual', label: 'Gradually, no clear cause' },
        ],
      },
      next: { waking: 'radiate', injury: 'radiate', gradual: 'radiate' },
    },
    radiate: {
      question: {
        id: 'radiate',
        text: 'Does pain or tingling travel down your arm?',
        options: YES_NO,
      },
      next: { yes: 'weakness', no: 'feverStiff' },
    },
    weakness: {
      question: {
        id: 'weakness',
        text: 'Any arm weakness, or are you dropping things?',
        options: YES_NO,
      },
      next: { yes: 'feverStiff', no: 'feverStiff' },
    },
    feverStiff: {
      question: {
        id: 'feverStiff',
        text: 'Do you have a fever and find it hard to touch your chin to your chest?',
        options: YES_NO,
      },
      next: { yes: 'movement', no: 'movement' },
    },
    movement: {
      question: {
        id: 'movement',
        text: 'Is it worse when you turn your head?',
        options: YES_NO,
      },
      next: { yes: 'posture', no: 'posture' },
    },
    posture: {
      question: {
        id: 'posture',
        text: 'Do you spend long hours at a desk or looking at screens?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'neck-strain',
      name: 'Neck muscle strain',
      baseWeight: 1,
      supports: { onsetType: ['gradual', 'waking'], movement: ['yes'], posture: ['yes'], radiate: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care / Physical therapy',
      suggestedTests: ['Usually none'],
      explanation:
        'Overworked neck muscles from posture, screens, or sleeping position. Aches with movement and typically settles within days with gentle stretching and heat.',
    },
    {
      id: 'cervical-radiculopathy',
      name: 'Pinched nerve in the neck (cervical radiculopathy)',
      baseWeight: 1,
      supports: { radiate: ['yes'], movement: ['yes'] },
      tier: 'primary-care',
      specialty: 'Neurology / Physical therapy',
      suggestedTests: ['Neurological exam', 'MRI of cervical spine if persistent'],
      explanation:
        'A compressed nerve root sends pain, tingling, or numbness down the arm and often changes with neck position. Most cases improve with therapy.',
    },
    {
      id: 'whiplash',
      name: 'Whiplash-type injury',
      baseWeight: 0,
      supports: { onsetType: ['injury'], movement: ['yes'] },
      tier: 'primary-care',
      specialty: 'Primary care',
      suggestedTests: ['Exam; X-ray if pain is severe or midline'],
      explanation:
        'A sudden jolt strains neck muscles and ligaments. Stiffness often peaks a day or two after the event and improves with early gentle movement.',
    },
    {
      id: 'torticollis',
      name: 'Acute wry neck (torticollis)',
      baseWeight: 0,
      supports: { onsetType: ['waking'], movement: ['yes'], radiate: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Usually none'],
      explanation:
        'Waking with the neck locked to one side is usually a muscle spasm. Painful but benign; it typically releases over a few days.',
    },
  ],
  redFlags: [
    {
      id: 'rf-meningism',
      label: 'Fever with a rigid neck — meningitis must be ruled out',
      tier: 'emergency',
      when: [{ questionId: 'feverStiff', answers: ['yes'] }],
    },
    {
      id: 'rf-arm-weakness',
      label: 'Arm weakness or loss of dexterity with neck pain — nerve compression needs prompt review',
      tier: 'urgent',
      when: [{ questionId: 'weakness', answers: ['yes'] }],
    },
    {
      id: 'rf-neck-injury',
      label: 'Severe neck pain after an accident or jolt',
      tier: 'urgent',
      when: [{ questionId: 'onsetType', answers: ['injury'] }],
      minSeverity: 7,
    },
  ],
}
