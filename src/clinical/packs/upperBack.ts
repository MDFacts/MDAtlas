import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const upperBackPack: ContentPack = {
  regionId: 'upperBack',
  entryNodeId: 'tearing',
  nodes: {
    tearing: {
      question: {
        id: 'tearing',
        text: 'Did it start suddenly with a tearing or ripping sensation?',
        options: YES_NO,
      },
      next: { yes: 'movement', no: 'movement' },
    },
    movement: {
      question: {
        id: 'movement',
        text: 'Is it worse with movement or certain postures?',
        options: YES_NO,
      },
      next: { yes: 'desk', no: 'desk' },
    },
    desk: {
      question: {
        id: 'desk',
        text: 'Do you spend long hours at a desk or driving?',
        options: YES_NO,
      },
      next: { yes: 'breath', no: 'breath' },
    },
    breath: {
      question: {
        id: 'breath',
        text: 'Is it sharper when you take a deep breath?',
        options: YES_NO,
      },
      next: { yes: 'trauma', no: 'trauma' },
    },
    trauma: {
      question: {
        id: 'trauma',
        text: 'Did it start after a fall, twist, or heavy lifting?',
        options: YES_NO,
      },
      next: { yes: 'nightConstant', no: 'nightConstant' },
    },
    nightConstant: {
      question: {
        id: 'nightConstant',
        text: 'Is the pain constant, even at rest and at night?',
        options: YES_NO,
      },
      next: { yes: 'feverBack', no: 'feverBack' },
    },
    feverBack: {
      question: {
        id: 'feverBack',
        text: 'Do you also have a fever?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'back-muscle-strain',
      name: 'Upper back muscle strain',
      baseWeight: 1,
      supports: { movement: ['yes'], trauma: ['yes'], nightConstant: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care / Physical therapy',
      suggestedTests: ['Usually none'],
      explanation:
        'Strained muscles between the shoulder blades from lifting, twisting, or overuse. Hurts with movement, eases with rest, and settles over one to two weeks.',
    },
    {
      id: 'postural-pain',
      name: 'Postural upper back pain',
      baseWeight: 1,
      supports: { desk: ['yes'], movement: ['yes'], trauma: ['no'] },
      tier: 'self-care',
      specialty: 'Physical therapy',
      suggestedTests: ['Posture and workstation review'],
      explanation:
        'Long desk hours load the mid-back and shoulder girdle. Aching builds through the day and improves with breaks, stretching, and strengthening.',
    },
    {
      id: 'rib-joint-dysfunction',
      name: 'Rib joint irritation',
      baseWeight: 0,
      supports: { breath: ['yes'], movement: ['yes'] },
      tier: 'primary-care',
      specialty: 'Primary care / Physical therapy',
      suggestedTests: ['Physical exam'],
      explanation:
        'Where ribs meet the spine, joints can get irritated and cause sharp, well-localized pain with deep breaths or twisting.',
    },
    {
      id: 'thoracic-disc',
      name: 'Thoracic spine issue',
      baseWeight: 0,
      supports: { nightConstant: ['yes'], movement: ['no'] },
      tier: 'primary-care',
      specialty: 'Orthopedics / Neurology',
      suggestedTests: ['Spine exam', 'MRI if pain persists or neurological signs appear'],
      explanation:
        'Persistent mid-back pain that does not vary with movement deserves a structural look at the thoracic spine.',
    },
  ],
  redFlags: [
    {
      id: 'rf-aortic',
      label: 'Sudden tearing pain between the shoulder blades — aortic emergency must be ruled out',
      tier: 'emergency',
      when: [{ questionId: 'tearing', answers: ['yes'] }],
    },
    {
      id: 'rf-constant-night',
      label: 'Constant pain unrelieved by rest, worse at night',
      tier: 'urgent',
      when: [{ questionId: 'nightConstant', answers: ['yes'] }],
    },
    {
      id: 'rf-fever-back',
      label: 'Back pain with fever — possible spinal infection',
      tier: 'urgent',
      when: [{ questionId: 'feverBack', answers: ['yes'] }],
    },
  ],
}
