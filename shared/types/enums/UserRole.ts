export const UserRole = {
  CUSTOMER: "CUSTOMER",
  TECHNICIAN: "technician",
  ADMIN: "admin"
} as const;



export type UserRoleType = typeof UserRole[keyof typeof UserRole];