
import { jwtDecode } from "jwt-decode";

export const decodeExp = (token: string | null) => {
  try {
    if (!token) return null;
    const decoded = jwtDecode<{ exp?: number }>(token);
    return decoded?.exp ?? null;
  } catch {
    return null;
  }
};


// src/utils/jwt.ts
export const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};
