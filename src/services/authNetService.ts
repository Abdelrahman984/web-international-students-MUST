import { apiRequest } from "./api";

export interface ForgotPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/**
 * .NET Backend Auth Services
 */
export const authNetService = {
  /**
   * Request an OTP to be sent to the user's email for password reset.
   */
  async requestOtp(email: string): Promise<void> {
    await apiRequest("/api/Auth/request-otp", {
      method: "POST",
      body: { email },
      auth: false,
    });
  },

  /**
   * Reset password using the OTP received via email.
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiRequest("/api/Auth/forgot-password", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  /**
   * Change password for the currently authenticated user.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiRequest("/api/Auth/change-password", {
      method: "POST",
      body: payload,
    });
  },
};
