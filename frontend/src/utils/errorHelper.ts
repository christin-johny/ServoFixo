
import axios from "axios";
import { ZodError } from "zod";

export const extractErrorMessage = (error: unknown, defaultMessage: string = "Something went wrong"): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof ZodError) {
    return error.issues?.[0]?.message || defaultMessage;
  }

  if (axios.isAxiosError(error)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosError = error as any;
    if (axiosError.response) {
      const data = axiosError.response.data;

      if (typeof data === "string") {
        return data; 
      }

      if (data?.message && typeof data.message === "string") {
        return data.message;
      }

      if (data?.error && typeof data.error === "string") {
        return data.error;
      }

      if (data?.errors && Array.isArray(data.errors)) {
        const firstError = data.errors[0];
        if (typeof firstError === "string") {
          return firstError;
        }
        if (firstError?.message && typeof firstError.message === "string") {
          return firstError.message;
        }
      }
      
      if (axiosError.response.statusText) {
          return axiosError.response.statusText;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }
 
  if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
  }

  return defaultMessage;
};