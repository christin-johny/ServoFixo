
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
