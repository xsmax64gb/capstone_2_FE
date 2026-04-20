"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useGetProfileQuery } from "@/store/services/authApi";

/** Gọi GET /me/profile khi đã đăng nhập để đồng bộ Redux/header với dữ liệu đầy đủ từ server. */
export function UserProfileBootstrap() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  useGetProfileQuery(undefined, { skip: !isAuthenticated });
  return null;
}
