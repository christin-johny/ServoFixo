export const refreshCookieOptions = {
  httpOnly: true,
  secure: false, // Keep false until you get an SSL certificate (HTTPS)
  sameSite: "lax" as const, // 'lax' works perfectly because Nginx puts everything on the same origin!
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};