import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const headPack: ContentPack = {
  regionId: 'head',
  entryNodeId: 'pattern',
  nodes: {
    pattern: {
      question: {
        id: 'pattern',
        text: 'Which best describes the pain?',
        options: [
          { value: 'pressure-band', label: 'A tight band or pressure on both sides' },
          { value: 'one-sided-throbbing', label: 'Throbbing on one side' },
          { value: 'behind-eye', label: 'Sharp, behind or around one eye' },
          { value: 'sudden-worst', label: 'Sudden — the worst headache of my life' },
        ],
      },
      next: {
        'pressure-band': 'nauseaLight',
        'one-sided-throbbing': 'nauseaLight',
        'behind-eye': 'nauseaLight',
        'sudden-worst': 'nauseaLight',
      },
    },
    nauseaLight: {
      question: {
        id: 'nauseaLight',
        text: 'Do you have nausea, or does light and sound bother you?',
        options: YES_NO,
      },
      next: { yes: 'neuro', no: 'neuro' },
    },
    neuro: {
      question: {
        id: 'neuro',
        text: 'Any vision changes, weakness, numbness, or trouble speaking?',
        options: YES_NO,
      },
      next: { yes: 'feverNeck', no: 'feverNeck' },
    },
    feverNeck: {
      question: {
        id: 'feverNeck',
        text: 'Do you have a fever with a stiff neck?',
        options: YES_NO,
      },
      next: { yes: 'trauma', no: 'trauma' },
    },
    trauma: {
      question: {
        id: 'trauma',
        text: 'Did you hit your head recently?',
        options: YES_NO,
      },
      next: { yes: 'recurring', no: 'screens' },
    },
    screens: {
      question: {
        id: 'screens',
        text: 'Is it worse after long screen time, stress, or poor sleep?',
        options: YES_NO,
      },
      next: { yes: 'recurring', no: 'recurring' },
    },
    recurring: {
      question: {
        id: 'recurring',
        text: 'Have you had similar headaches before?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'tension-headache',
      name: 'Tension-type headache',
      baseWeight: 1,
      supports: { pattern: ['pressure-band'], screens: ['yes'], recurring: ['yes'], nauseaLight: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Usually none'],
      explanation:
        'The most common headache: a tight, band-like pressure on both sides, often tied to stress, screens, posture, or poor sleep. Usually eases with rest, hydration, and simple pain relief.',
    },
    {
      id: 'migraine',
      name: 'Migraine',
      baseWeight: 1,
      supports: { pattern: ['one-sided-throbbing'], nauseaLight: ['yes'], recurring: ['yes'] },
      tier: 'primary-care',
      specialty: 'Neurology',
      suggestedTests: ['Clinical diagnosis; headache diary helps'],
      explanation:
        'Throbbing, usually one-sided headaches with nausea or sensitivity to light and sound. Recurrent attacks respond well to modern preventive and abortive treatments.',
    },
    {
      id: 'cluster-headache',
      name: 'Cluster headache',
      baseWeight: 0,
      supports: { pattern: ['behind-eye'], recurring: ['yes'], nauseaLight: ['no'] },
      tier: 'primary-care',
      specialty: 'Neurology',
      suggestedTests: ['Clinical diagnosis'],
      explanation:
        'Severe, sharp pain behind one eye arriving in bouts, often with a watery eye or blocked nostril on the same side. Distinct treatments exist, so recognition matters.',
    },
    {
      id: 'post-concussive',
      name: 'Post-concussive headache',
      baseWeight: 0,
      supports: { trauma: ['yes'], recurring: ['no'] },
      tier: 'primary-care',
      specialty: 'Primary care / Neurology',
      suggestedTests: ['Neurological exam', 'CT only if red flags present'],
      explanation:
        'Headache after a head knock is common and usually settles, but new or worsening headache after injury deserves a professional check.',
    },
  ],
  redFlags: [
    {
      id: 'rf-thunderclap',
      label: 'Sudden "worst headache of my life" — thunderclap headache needs emergency assessment',
      tier: 'emergency',
      when: [{ questionId: 'pattern', answers: ['sudden-worst'] }],
    },
    {
      id: 'rf-neuro',
      label: 'Headache with vision changes, weakness, numbness, or speech trouble — stroke-like signs',
      tier: 'emergency',
      when: [{ questionId: 'neuro', answers: ['yes'] }],
    },
    {
      id: 'rf-meningitis',
      label: 'Fever with a stiff neck — meningitis must be ruled out',
      tier: 'emergency',
      when: [{ questionId: 'feverNeck', answers: ['yes'] }],
    },
    {
      id: 'rf-head-trauma',
      label: 'Significant headache after a head injury',
      tier: 'urgent',
      when: [{ questionId: 'trauma', answers: ['yes'] }],
      minSeverity: 6,
    },
  ],
}
