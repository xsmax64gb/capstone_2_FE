export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REGISTER_SEND_OTP: "/auth/register/send-otp",
    CHANGE_PASSWORD: "/auth/password/change",
    CHANGE_PASSWORD_SEND_OTP: "/auth/password/send-otp",
  },
  USER: {
    PROFILE: "/me/profile",
    PROFILE_AVATAR: "/me/profile/avatar",
  },
};
