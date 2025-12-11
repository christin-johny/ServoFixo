// src/config/authConfig.ts

// Why a list? 
// Since we store tokens in memory, on a page reload we don't know the user's role yet.
// We try the generic endpoint first. If the backend requires a specific role path 
// (e.g. strict middleware), we try those next.
export const REFRESH_ENDPOINTS = [
  "/api/admin/auth/refresh",      // 2. Admin specific
  "/api/customer/auth/refresh",   // 3. Customer specific
  "/api/technician/auth/refresh", // 4. Technician specific
];
