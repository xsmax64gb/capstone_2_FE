"use client";
//auth provider để xác định trạng thái đăng nhập của người dùng và cung cấp các phương thức liên quan đến xác thực cho các component con trong ứng dụng.
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { setLoading, logout } from "@/store/slices/authSlice";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(setLoading(false));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? auth.user : null,
        isAuthenticated: mounted ? auth.isAuthenticated : false,
        isLoading: !mounted || auth.isLoading,
        error: auth.error,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
