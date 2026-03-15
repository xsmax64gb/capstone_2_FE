import { baseApi } from "./baseApi";
import { API_ENDPOINTS } from "@/config/api";
import type {
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
} from "@/types";

interface AuthPayload {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
    currentLevel?: string;
    exp?: number;
    onboardingDone?: boolean;
    placementScore?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

const toAuthResponse = (response: ApiResponse<AuthPayload>): AuthResponse => {
  const payload = response.data as AuthPayload;

  return {
    accessToken: payload.token,
    user: {
      ...payload.user,
      name: payload.user.fullName,
    },
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthPayload>) =>
        toAuthResponse(response),
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<AuthPayload>) =>
        toAuthResponse(response),
    }),

    sendRegisterOtp: builder.mutation<ApiResponse, SendOtpRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.REGISTER_SEND_OTP,
        method: "POST",
        body: data,
      }),
    }),

    changePassword: builder.mutation<ApiResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        method: "POST",
        body: data,
      }),
    }),

    sendChangePasswordOtp: builder.mutation<ApiResponse, SendOtpRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD_SEND_OTP,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useChangePasswordMutation,
  useSendRegisterOtpMutation,
  useSendChangePasswordOtpMutation,
} = authApi;
