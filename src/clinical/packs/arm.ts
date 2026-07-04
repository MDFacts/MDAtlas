import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

function armPack(regionId: 'leftArm' | 'rightArm'): ContentPack {
  return {
    regionId,
    entryNodeId: 'armOnset',
    nodes: {
      armOnset: {
        question: {
          id: 'armOnset',
          text: 'How did the arm pain start?',
          options: [
            { value: 'repetitive', label: 'After repetitive use (sport, typing, tools)' },
            { value: 'injury', label: 'After an injury or sudden pull' },
            { value: 'gradual', label: 'Gradually, no clear cause' },
          ],
        },
        next: { repetitive: 'armLocation', injury: 'armLocation', gradual: 'armLocation' },
      },
      armLocation: {
        question: {
          id: 'armLocation',
          text: 'Where is it strongest?',
          options: [
            { value: 'upper-arm', label: 'Between shoulder and elbow' },
            { value: 'elbow', label: 'At the elbow' },
            { value: 'forearm-wrist', label: 'Forearm or wrist' },
            { value: 'whole-arm', label: 'The whole arm' },
          ],
        },
        next: {
          'upper-arm': 'tingling',
          elbow: 'tingling',
          'forearm-wrist': 'tingling',
          'whole-arm': 'tingling',
        },
      },
      tingling: {
        question: {
          id: 'tingling',
          text: 'Any tingling or numbness in the fingers?',
          options: YES_NO,
        },
        next: { yes: 'neckMove', no: 'neckMove' },
      },
      neckMove: {
        question: {
          id: 'neckMove',
          text: 'Does moving your neck change the arm pain?',
          options: YES_NO,
        },
        next: { yes: 'swelling', no: 'swelling' },
      },
      swelling: {
        question: {
          id: 'swelling',
          text: 'Is the arm swollen, warm, or red?',
          options: YES_NO,
        },
        next: { yes: 'chestSx', no: 'chestSx' },
      },
      chestSx: {
        question: {
          id: 'chestSx',
          text: 'Does the arm pain come with chest pressure or shortness of breath?',
          options: YES_NO,
        },
        next: { yes: 'gripWeak', no: 'gripWeak' },
      },
      gripWeak: {
        question: {
          id: 'gripWeak',
          text: 'Is your grip weak, or are you dropping things?',
          options: YES_NO,
        },
        next: { yes: null, no: null },
      },
    },
    differentials: [
      {
        id: 'tendinopathy',
        name: 'Tendon overuse (e.g. tennis elbow)',
        baseWeight: 1,
        supports: { armOnset: ['repetitive'], armLocation: ['elbow', 'forearm-wrist'], swelling: ['no'] },
        tier: 'self-care',
        specialty: 'Physical therapy / Sports medicine',
        suggestedTests: ['Physical exam; ultrasound if persistent'],
        explanation:
          'Repetitive gripping or typing overloads forearm tendons, causing focal pain at the elbow or wrist that flares with use. Load management and exercises fix most cases.',
      },
      {
        id: 'arm-muscle-strain',
        name: 'Arm muscle strain',
        baseWeight: 1,
        supports: { armOnset: ['injury'], armLocation: ['upper-arm'], tingling: ['no'] },
        tier: 'self-care',
        specialty: 'Primary care',
        suggestedTests: ['Usually none'],
        explanation:
          'A pulled muscle from a sudden effort aches with use and bruises occasionally. Rest and gradual return to activity usually resolve it within weeks.',
      },
      {
        id: 'carpal-tunnel',
        name: 'Carpal tunnel syndrome',
        baseWeight: 0,
        supports: { armLocation: ['forearm-wrist'], tingling: ['yes'], gripWeak: ['yes'] },
        tier: 'primary-care',
        specialty: 'Neurology / Hand specialist',
        suggestedTests: ['Nerve conduction study if persistent'],
        explanation:
          'A compressed nerve at the wrist causes tingling in the thumb-side fingers, often at night, sometimes with a weakening grip. Splinting helps early cases.',
      },
      {
        id: 'arm-cervical-referred',
        name: 'Nerve pain referred from the neck',
        baseWeight: 0,
        supports: { neckMove: ['yes'], tingling: ['yes'], armLocation: ['whole-arm'] },
        tier: 'primary-care',
        specialty: 'Neurology / Physical therapy',
        suggestedTests: ['Neck exam', 'MRI of cervical spine if persistent'],
        explanation:
          'A pinched nerve in the neck can send pain and tingling down the whole arm, changing with neck position rather than arm use.',
      },
    ],
    redFlags: [
      {
        id: 'rf-arm-cardiac',
        label: 'Arm pain with chest pressure or breathlessness — heart attack must be ruled out',
        tier: 'emergency',
        when: [{ questionId: 'chestSx', answers: ['yes'] }],
      },
      {
        id: 'rf-arm-swelling',
        label: 'A swollen, warm arm — possible blood clot or infection',
        tier: 'urgent',
        when: [{ questionId: 'swelling', answers: ['yes'] }],
      },
    ],
  }
}

export const leftArmPack = armPack('leftArm')
export const rightArmPack = armPack('rightArm')
