// src/infrastructure/config/Cookie.ts
export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // secure=true only in prod (HTTPS)
  sameSite: process.env.NODE_ENV === "production" ? ("None" as const) : ("Lax" as const),
  path: "/", // <- important: use root so cookie is available and removable
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // domain: process.env.COOKIE_DOMAIN ?? undefined, // include only if you set domain on creation
};
