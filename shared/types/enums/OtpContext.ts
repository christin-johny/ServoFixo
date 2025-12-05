// shared/types/enums/OtpContext.ts

export const OtpContext = {
  Registration : "registration",
  ForgotPassword : "forgot_password",
  Login: "login",
} as const;

export type OtpContext = (typeof OtpContext)[keyof typeof OtpContext];
