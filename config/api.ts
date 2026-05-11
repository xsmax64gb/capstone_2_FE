const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const productionApiFallback = "https://capstone-2-g51u.onrender.com/api";
const defaultApiBaseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : productionApiFallback;

export const API_BASE_URL = configuredApiBaseUrl || defaultApiBaseUrl;

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
