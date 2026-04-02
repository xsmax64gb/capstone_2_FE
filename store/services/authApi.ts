import { baseApi } from "@/store/api/baseApi";
import { API_ENDPOINTS } from "@/config/api";
import { setUser } from "@/store/slices/authSlice";
import type {
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  UpdateProfileRequest,
  User,
} from "@/types";

interface AuthPayload {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    nativeLanguage?: string;
    timezone?: string;
    role?: string;
    currentLevel?: string;
    exp?: number;
    onboardingDone?: boolean;
    placementScore?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

const toProfileFormData = (payload: UpdateProfileRequest) => {
  const formData = new FormData();
  formData.append("fullName", payload.fullName);
  formData.append("bio", payload.bio || "");
  formData.append("nativeLanguage", payload.nativeLanguage || "");
  formData.append("timezone", payload.timezone || "");

  if (payload.avatarFile) {
    formData.append("avatarFile", payload.avatarFile);
  }

  return formData;
};

const toAvatarFormData = (avatarFile: File) => {
  const formData = new FormData();
  formData.append("avatarFile", avatarFile);
  return formData;
};

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

const syncProfileState = async (
  dispatch: (action: unknown) => unknown,
  queryFulfilled: Promise<{ data: User }>
) => {
  const { data } = await queryFulfilled;
  dispatch(setUser(data));
  dispatch(authApi.util.upsertQueryData("getProfile", undefined, data));
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

    getProfile: builder.query<User, void>({
      query: () => ({
        url: API_ENDPOINTS.USER.PROFILE,
        method: "GET",
      }),
      providesTags: ["Profile"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.USER.PROFILE,
        method: "PUT",
        body: toProfileFormData(data),
      }),
      invalidatesTags: ["Profile"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await syncProfileState(dispatch, queryFulfilled);
      },
    }),

    uploadAvatar: builder.mutation<User, File>({
      query: (avatarFile) => ({
        url: API_ENDPOINTS.USER.PROFILE_AVATAR,
        method: "PATCH",
        body: toAvatarFormData(avatarFile),
      }),
      invalidatesTags: ["Profile"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await syncProfileState(dispatch, queryFulfilled);
      },
    }),

    deleteAvatar: builder.mutation<User, void>({
      query: () => ({
        url: API_ENDPOINTS.USER.PROFILE_AVATAR,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await syncProfileState(dispatch, queryFulfilled);
      },
    }),
  }),
});

export const {
  useDeleteAvatarMutation,
  useLoginMutation,
  useGetProfileQuery,
  useRegisterMutation,
  useChangePasswordMutation,
  useSendRegisterOtpMutation,
  useSendChangePasswordOtpMutation,
  useUploadAvatarMutation,
  useUpdateProfileMutation,
} = authApi;
