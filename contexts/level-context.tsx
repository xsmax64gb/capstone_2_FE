"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { levelApi, type LevelInfo } from "@/lib/level-api";
import { useAuth } from "@/lib/auth-context";

interface LevelContextType {
  levelInfo: LevelInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshLevelInfo: () => Promise<void>;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelInfo = useCallback(async () => {
    if (!isAuthenticated) {
      setLevelInfo(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await levelApi.getUserLevel();
      setLevelInfo(data);
    } catch (err) {
      setError("Không thể tải thông tin cấp độ");
      console.error("Failed to fetch level info:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLevelInfo();
  }, [fetchLevelInfo]);

  const refreshLevelInfo = useCallback(async () => {
    await fetchLevelInfo();
  }, [fetchLevelInfo]);

  return (
    <LevelContext.Provider
      value={{
        levelInfo,
        isLoading,
        error,
        refreshLevelInfo,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
}

export function useLevel() {
  const context = useContext(LevelContext);
  if (context === undefined) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
}
