export const refreshCookieOptions = {
  httpOnly: true,
  secure: false, 
  sameSite: "lax" as const,  
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};