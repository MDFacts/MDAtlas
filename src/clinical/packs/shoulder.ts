import type { ContentPack } from '../types'

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

function shoulderPack(regionId: 'leftShoulder' | 'rightShoulder'): ContentPack {
  return {
    regionId,
    entryNodeId: 'depth',
    nodes: {
      depth: {
        question: {
          id: 'depth',
          text: 'Where does the pain feel like it lives?',
          options: [
            { value: 'surface', label: 'On the surface / skin' },
            { value: 'muscle', label: 'In the muscle' },
            { value: 'joint', label: 'Inside the joint' },
            { value: 'bone', label: 'Deep in the bone' },
          ],
        },
        next: { surface: 'overhead', muscle: 'overhead', joint: 'overhead', bone: 'overhead' },
      },
      overhead: {
        question: {
          id: 'overhead',
          text: 'Is it worse when reaching overhead or behind your back?',
          options: YES_NO,
        },
        next: { yes: 'night', no: 'night' },
      },
      night: {
        question: { id: 'night', text: 'Does the pain wake you at night?', options: YES_NO },
        next: { yes: 'trauma', no: 'trauma' },
      },
      trauma: {
        question: {
          id: 'trauma',
          text: 'Did it start after a fall, impact, or sudden pull?',
          options: YES_NO,
        },
        next: { yes: 'deformity', no: 'neck' },
      },
      deformity: {
        question: {
          id: 'deformity',
          text: 'Is there visible deformity, or are you unable to move the arm?',
          options: YES_NO,
        },
        next: { yes: 'feverJoint', no: 'neck' },
      },
      neck: {
        question: {
          id: 'neck',
          text: 'Does turning your neck change the pain, or does it tingle down the arm?',
          options: YES_NO,
        },
        next: { yes: 'feverJoint', no: 'feverJoint' },
      },
      feverJoint: {
        question: {
          id: 'feverJoint',
          text: 'Do you have a fever with a hot, swollen shoulder?',
          options: YES_NO,
        },
        next: { yes: null, no: null },
      },
    },
    differentials: [
      {
        id: 'rotator-cuff',
        name: 'Rotator cuff strain or tear',
        baseWeight: 1,
        supports: { depth: ['muscle'], overhead: ['yes'], night: ['yes'] },
        tier: 'primary-care',
        specialty: 'Orthopedics / Sports medicine',
        suggestedTests: ['Physical exam', 'Ultrasound or MRI if weakness persists'],
        explanation:
          'The rotator cuff muscles stabilize the shoulder. Strains and tears cause pain with overhead motion and often ache at night when lying on that side.',
      },
      {
        id: 'impingement',
        name: 'Shoulder impingement',
        baseWeight: 1,
        supports: { overhead: ['yes'], depth: ['joint', 'muscle'], trauma: ['no'] },
        tier: 'self-care',
        specialty: 'Physical therapy / Orthopedics',
        suggestedTests: ['Physical exam', 'X-ray if persistent'],
        explanation:
          'Tendons pinched under the shoulder blade’s bony arch cause a painful arc when lifting the arm. Usually improves with activity changes and targeted exercises.',
      },
      {
        id: 'frozen-shoulder',
        name: 'Frozen shoulder (adhesive capsulitis)',
        baseWeight: 0,
        supports: { depth: ['joint'], night: ['yes'], overhead: ['yes'] },
        tier: 'primary-care',
        specialty: 'Orthopedics / Physical therapy',
        suggestedTests: ['Physical exam of range of motion'],
        explanation:
          'The joint capsule stiffens, progressively limiting motion in all directions with a deep joint ache, often worse at night.',
      },
      {
        id: 'ac-joint',
        name: 'AC joint sprain',
        baseWeight: 0,
        supports: { trauma: ['yes'], depth: ['joint'] },
        tier: 'primary-care',
        specialty: 'Orthopedics',
        suggestedTests: ['X-ray'],
        explanation:
          'A fall onto the shoulder can sprain the joint where the collarbone meets the shoulder blade, causing pain at the top of the shoulder.',
      },
      {
        id: 'cervical-referred',
        name: 'Referred pain from the neck',
        baseWeight: 0,
        supports: { neck: ['yes'], depth: ['surface'] },
        tier: 'primary-care',
        specialty: 'Neurology / Physical therapy',
        suggestedTests: ['Neck exam', 'MRI of cervical spine if tingling persists'],
        explanation:
          'A pinched nerve in the neck can masquerade as shoulder pain, often with tingling or numbness running down the arm and changes with neck position.',
      },
    ],
    redFlags: [
      {
        id: 'rf-deformity',
        label: 'Trauma with deformity or inability to move the arm — possible fracture or dislocation',
        tier: 'emergency',
        when: [{ questionId: 'deformity', answers: ['yes'] }],
      },
      {
        id: 'rf-septic',
        label: 'Fever with a hot, swollen joint — possible joint infection',
        tier: 'emergency',
        when: [{ questionId: 'feverJoint', answers: ['yes'] }],
      },
    ],
  }
}

export const leftShoulderPack = shoulderPack('leftShoulder')
export const rightShoulderPack = shoulderPack('rightShoulder')
