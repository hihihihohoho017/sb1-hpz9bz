export const COLLEGES = [
  "KING FAISAL CENTER FOR ISLAMIC ARABIC AND ASIAN STUDIES",
  "COLLEGE OF AGRICULTURE",
  "COLLEGE OF BUSINESS ADMINISTRATION AND ACCOUNTANCY",
  "COLLEGE OF EDUCATION",
  "COLLEGE OF FISHERIES AND AQUATIC SCIENCES",
  "COLLEGE OF FORESTRY AND ENVIRONMENTAL STUDIES",
  "COLLEGE OF ENGINEERING",
  "COLLEGE OF HEALTH SCIENCES",
  "COLLEGE OF HOSPITALITY AND TOURISM MANAGEMENT",
  "COLLEGE OF INFORMATION AND COMPUTING SCIENCES",
  "COLLEGE OF NATURAL SCIENCES AND MATHEMATICS",
  "COLLEGE OF PUBLIC AFFAIRS",
  "COLLEGE OF SOCIAL SCIENCES AND HUMANITIES",
  "COLLEGE OF SPORTS PHYSICAL EDUCATION AND RECREATION",
  "COLLEGE OF LAW"
] as const;

export const DEPARTMENTS = {
  "COLLEGE OF INFORMATION AND COMPUTING SCIENCES": [
    "Department of Information Sciences",
    "Department of Computer Sciences"
  ]
} as const;

export const FACULTY = {
  "Department of Information Sciences": [
    "Joseph Sieras",
    "Reymark Delena"
  ],
  "Department of Computer Sciences": [
    "Janice Wade",
    "Llewelyn Elcana"
  ]
} as const;

export const PROJECT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const PROJECT_PROGRESS = {
  IN_PROGRESS: 'In Progress',
  PROPOSAL_DEFENDED: 'Proposal Defended',
  FINAL_DEFENDED: 'Final Capstone Defended'
} as const;

export const PROJECT_TYPES = {
  PROPOSAL: 'proposal',
  FINAL: 'final',
  INVENTORY: 'inventory'
} as const;

export type College = typeof COLLEGES[number];
export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
export type ProjectProgress = typeof PROJECT_PROGRESS[keyof typeof PROJECT_PROGRESS];
export type ProjectType = typeof PROJECT_TYPES[keyof typeof PROJECT_TYPES];