import {jwtDecode} from "jwt-decode";

export const decodeExp = (token: string) => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp;
  } catch {
    return null;
  }
};
