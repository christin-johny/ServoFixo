// src/presentation/components/PasswordStrength/usePasswordStrength.ts
export type PasswordChecks = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

export const usePasswordStrength = (password: string) => {
  const checks: PasswordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;

  const messages: { [K in keyof PasswordChecks]: string } = {
    length: "8+ characters",
    uppercase: "Uppercase (A-Z)",
    lowercase: "Lowercase (a-z)",
    number: "Number (0-9)",
    special: "Special character (!@#$%^&*)",
  };

  // list of failed messages (useful to show form errors inline)
  const failed = (Object.keys(checks) as (keyof PasswordChecks)[])
    .filter((k) => !checks[k])
    .map((k) => messages[k]);

  return { checks, strength, messages, failed };
};
