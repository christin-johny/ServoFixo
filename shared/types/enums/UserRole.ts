export const UserRole = {
  CUSTOMER: "customer",
  TECHNICIAN: "technician",
  ADMIN: "admin"
} as const;



export type UserRoleType = typeof UserRole[keyof typeof UserRole];