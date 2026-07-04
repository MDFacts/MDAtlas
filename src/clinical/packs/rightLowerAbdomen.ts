import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const rightLowerAbdomenPack: ContentPack = {
  regionId: 'rightLowerAbdomen',
  entryNodeId: 'fever',
  nodes: {
    fever: {
      question: { id: 'fever', text: 'Do you have a fever or feel feverish?', options: YES_NO },
      next: { yes: 'walkingPain', no: 'walkingPain' },
    },
    walkingPain: {
      question: {
        id: 'walkingPain',
        text: 'Is the pain worse when you walk, cough, or go over bumps?',
        options: YES_NO,
      },
      next: { yes: 'nausea', no: 'nausea' },
    },
    nausea: {
      question: { id: 'nausea', text: 'Do you feel nauseous or have you lost your appetite?', options: YES_NO },
      next: { yes: 'vomiting', no: 'pregnancy' },
    },
    vomiting: {
      question: { id: 'vomiting', text: 'Have you vomited?', options: YES_NO },
      next: { yes: 'pregnancy', no: 'pregnancy' },
    },
    pregnancy: {
      question: {
        id: 'pregnancy',
        text: 'Is there any possibility of pregnancy?',
        options: [
          { value: 'yes', label: 'Yes, possible' },
          { value: 'no', label: 'No' },
          { value: 'not-applicable', label: 'Not applicable' },
        ],
      },
      next: { yes: 'eating', no: 'eating', 'not-applicable': 'eating' },
    },
    eating: {
      question: {
        id: 'eating',
        text: 'How does eating affect the pain?',
        options: [
          { value: 'worse', label: 'Worse after eating' },
          { value: 'better', label: 'Better after eating' },
          { value: 'no-relation', label: 'No relation' },
        ],
      },
      next: { worse: 'bloodInStool', better: 'bloodInStool', 'no-relation': 'bloodInStool' },
    },
    bloodInStool: {
      question: { id: 'bloodInStool', text: 'Have you noticed blood in your stool?', options: YES_NO },
      next: { yes: 'movement', no: 'movement' },
    },
    movement: {
      question: {
        id: 'movement',
        text: 'Can you reproduce the pain by twisting or pressing on the area?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'appendicitis',
      name: 'Appendicitis',
      baseWeight: 1,
      supports: { fever: ['yes'], walkingPain: ['yes'], nausea: ['yes'], vomiting: ['yes'] },
      tier: 'urgent',
      specialty: 'Emergency medicine / General surgery',
      suggestedTests: ['Physical exam', 'CBC (blood count)', 'CRP', 'Abdominal ultrasound or CT'],
      explanation:
        'Inflammation of the appendix. Classically starts near the belly button and settles in the right lower abdomen, often with fever, nausea, and pain that worsens with movement.',
    },
    {
      id: 'gastroenteritis',
      name: 'Gastroenteritis (stomach bug)',
      baseWeight: 1,
      supports: { nausea: ['yes'], vomiting: ['yes'], eating: ['worse'], bloodInStool: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Usually none; stool test if it persists'],
      explanation:
        'An intestinal infection causing crampy pain, nausea, and sometimes vomiting or diarrhea. Usually improves with rest and fluids within a few days.',
    },
    {
      id: 'ovarian',
      name: 'Ovarian condition (cyst or torsion)',
      baseWeight: 1,
      supports: { walkingPain: ['yes'], nausea: ['yes'], pregnancy: ['yes', 'no'] },
      tier: 'urgent',
      specialty: 'Gynecology',
      suggestedTests: ['Pelvic ultrasound', 'Pregnancy test'],
      explanation:
        'Ovarian cysts can cause sharp one-sided lower abdominal pain. Sudden severe pain with nausea can indicate torsion, which needs urgent evaluation.',
    },
    {
      id: 'ibd',
      name: 'Inflammatory bowel condition',
      baseWeight: 1,
      supports: { bloodInStool: ['yes'], eating: ['worse'], fever: ['yes'] },
      tier: 'primary-care',
      specialty: 'Gastroenterology',
      suggestedTests: ['Stool studies', 'CBC', 'CRP', 'Referral for colonoscopy if persistent'],
      explanation:
        'Conditions like Crohn’s disease can cause right lower abdominal pain with cramping, blood in the stool, and symptoms that flare after eating.',
    },
    {
      id: 'hernia',
      name: 'Inguinal hernia',
      baseWeight: 1,
      supports: { movement: ['yes'], walkingPain: ['yes'], nausea: ['no'] },
      tier: 'primary-care',
      specialty: 'General surgery',
      suggestedTests: ['Physical exam', 'Ultrasound if unclear'],
      explanation:
        'A bulge of tissue through the abdominal wall, often noticeable with straining or standing, causing an aching pull in the groin or lower abdomen.',
    },
    {
      id: 'muscle-strain',
      name: 'Abdominal muscle strain',
      baseWeight: 1,
      supports: { movement: ['yes'], fever: ['no'], nausea: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Usually none'],
      explanation:
        'An overstretched abdominal wall muscle. Pain is reproducible by pressing or twisting and typically improves over one to two weeks with rest.',
    },
  ],
  redFlags: [
    {
      id: 'rf-severe-fever',
      label: 'Fever with severe right lower abdominal pain — possible appendicitis',
      tier: 'emergency',
      when: [{ questionId: 'fever', answers: ['yes'] }],
      minSeverity: 7,
    },
    {
      id: 'rf-pregnancy',
      label: 'Possible pregnancy with one-sided abdominal pain — ectopic pregnancy must be ruled out',
      tier: 'urgent',
      when: [{ questionId: 'pregnancy', answers: ['yes'] }],
    },
    {
      id: 'rf-blood-stool',
      label: 'Blood in stool with abdominal pain',
      tier: 'urgent',
      when: [{ questionId: 'bloodInStool', answers: ['yes'] }],
    },
  ],
}
