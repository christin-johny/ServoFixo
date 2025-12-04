// shared/types/enums/OtpContext.ts

export const OtpContext = {
  Registration : "registration",
  ForgotPassword : "forgot_password",
} as const;

export type OtpContext = (typeof OtpContext)[keyof typeof OtpContext];
