export const ROLES = {
  VISITOR: 'visitor',
  COLLEGE_MEMBER: 'college-member',
  ADMIN: 'admin',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
