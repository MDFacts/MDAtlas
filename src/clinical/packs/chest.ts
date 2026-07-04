import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const chestPack: ContentPack = {
  regionId: 'chest',
  entryNodeId: 'exertion',
  nodes: {
    exertion: {
      question: {
        id: 'exertion',
        text: 'Is the pain worse with physical effort, like climbing stairs?',
        options: YES_NO,
      },
      next: { yes: 'breath', no: 'breath' },
    },
    breath: {
      question: { id: 'breath', text: 'Are you short of breath?', options: YES_NO },
      next: { yes: 'radiation', no: 'radiation' },
    },
    radiation: {
      question: {
        id: 'radiation',
        text: 'Does the pain spread anywhere?',
        options: [
          { value: 'arm-jaw', label: 'To my arm, jaw, or neck' },
          { value: 'back', label: 'To my back' },
          { value: 'none', label: 'It stays in one place' },
        ],
      },
      next: { 'arm-jaw': 'position', back: 'position', none: 'position' },
    },
    position: {
      question: {
        id: 'position',
        text: 'Does body position change the pain?',
        options: [
          { value: 'lying-worse', label: 'Worse lying down' },
          { value: 'leaning-helps', label: 'Better leaning forward' },
          { value: 'no-change', label: 'No change' },
        ],
      },
      next: { 'lying-worse': 'meals', 'leaning-helps': 'meals', 'no-change': 'meals' },
    },
    meals: {
      question: {
        id: 'meals',
        text: 'Do you get a burning feeling after meals or when lying down after eating?',
        options: YES_NO,
      },
      next: { yes: 'tender', no: 'tender' },
    },
    tender: {
      question: {
        id: 'tender',
        text: 'Is the sore spot tender when you press on it?',
        options: YES_NO,
      },
      next: { yes: null, no: 'stress' },
    },
    stress: {
      question: {
        id: 'stress',
        text: 'Does the pain come with a racing heart, worry, or panic?',
        options: YES_NO,
      },
      next: { yes: null, no: null },
    },
  },
  differentials: [
    {
      id: 'cardiac',
      name: 'Heart-related chest pain (angina)',
      baseWeight: 1,
      supports: { exertion: ['yes'], breath: ['yes'], radiation: ['arm-jaw'] },
      tier: 'emergency',
      specialty: 'Cardiology',
      suggestedTests: ['ECG', 'Troponin blood test', 'Stress testing if stable'],
      explanation:
        'Pain from the heart muscle not getting enough oxygen. Typically pressure-like, brought on by exertion, and may spread to the arm or jaw. Needs prompt evaluation.',
    },
    {
      id: 'gerd',
      name: 'Acid reflux (GERD)',
      baseWeight: 1,
      supports: { meals: ['yes'], position: ['lying-worse'], exertion: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care / Gastroenterology',
      suggestedTests: ['Trial of antacids', 'Endoscopy if persistent'],
      explanation:
        'Stomach acid irritating the esophagus causes burning chest discomfort, usually after meals or when lying down. Often improves with dietary changes and antacids.',
    },
    {
      id: 'costochondritis',
      name: 'Chest wall inflammation (costochondritis)',
      baseWeight: 1,
      supports: { tender: ['yes'], exertion: ['no'], breath: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Physical exam; usually no imaging needed'],
      explanation:
        'Inflammation of the cartilage joining ribs to breastbone. The tell-tale sign is pain reproduced by pressing on the spot. Usually settles with time and anti-inflammatories.',
    },
    {
      id: 'pericarditis',
      name: 'Pericarditis (inflammation around the heart)',
      baseWeight: 0,
      supports: { position: ['leaning-helps', 'lying-worse'], breath: ['yes'] },
      tier: 'urgent',
      specialty: 'Cardiology',
      suggestedTests: ['ECG', 'Echocardiogram', 'Inflammatory markers'],
      explanation:
        'Sharp chest pain that is worse lying flat and eases when leaning forward can indicate inflammation of the sac around the heart.',
    },
    {
      id: 'anxiety',
      name: 'Anxiety-related chest tightness',
      baseWeight: 0,
      supports: { stress: ['yes'], tender: ['no'] },
      tier: 'self-care',
      specialty: 'Primary care / Mental health',
      suggestedTests: ['Evaluation to first rule out cardiac causes'],
      explanation:
        'Panic and anxiety commonly cause chest tightness with a racing heart. It is a real physical response — and worth confirming the heart is healthy first.',
    },
    {
      id: 'chest-muscle-strain',
      name: 'Chest muscle strain',
      baseWeight: 0,
      supports: { tender: ['yes'], exertion: ['yes'] },
      tier: 'self-care',
      specialty: 'Primary care',
      suggestedTests: ['Usually none'],
      explanation:
        'Overuse of chest wall muscles (lifting, new workouts, heavy coughing) causes soreness that is tender to the touch and worse with certain movements.',
    },
  ],
  redFlags: [
    {
      id: 'rf-radiation',
      label: 'Chest pain spreading to arm, jaw, or neck — heart attack must be ruled out',
      tier: 'emergency',
      when: [{ questionId: 'radiation', answers: ['arm-jaw'] }],
    },
    {
      id: 'rf-breath',
      label: 'Chest pain with shortness of breath',
      tier: 'emergency',
      when: [{ questionId: 'breath', answers: ['yes'] }],
      minSeverity: 6,
    },
    {
      id: 'rf-exertional',
      label: 'Chest pain brought on by exertion',
      tier: 'urgent',
      when: [{ questionId: 'exertion', answers: ['yes'] }],
      minSeverity: 5,
    },
  ],
}
