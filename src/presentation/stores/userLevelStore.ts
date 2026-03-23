"use client";

import { create } from "zustand";
import type { UserLevel } from "@/domain/models/UserLevel";
import { storageKeys } from "@/shared/constants/storageKeys";

const defaultUserLevel: UserLevel = {
  level: 1,
  title: "개미",
  xp: 0,
  wins: 0,
  losses: 0,
};

interface UserLevelStore {
  userLevel: UserLevel;
  hydrated: boolean;
  hydratedUserId: string | null;
  hydrateUserLevel: (userId: string) => void;
  setUserLevel: (userId: string, userLevel: UserLevel) => void;
}

function getUserLevelStorageKey(userId: string) {
  return `${storageKeys.userLevel}:${userId}`;
}

function readStoredLevelByUserId(userId: string) {
  if (typeof window === "undefined") {
    return defaultUserLevel;
  }

  const rawValue = window.localStorage.getItem(getUserLevelStorageKey(userId));
  if (!rawValue) {
    return defaultUserLevel;
  }

  try {
    return JSON.parse(rawValue) as UserLevel;
  } catch {
    return defaultUserLevel;
  }
}

export const useUserLevelStore = create<UserLevelStore>((set) => ({
  userLevel: defaultUserLevel,
  hydrated: false,
  hydratedUserId: null,
  hydrateUserLevel: (userId) => {
    set({
      userLevel: readStoredLevelByUserId(userId),
      hydrated: true,
      hydratedUserId: userId,
    });
  },
  setUserLevel: (userId, userLevel) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getUserLevelStorageKey(userId), JSON.stringify(userLevel));
    }

    set({ userLevel });
  },
}));
