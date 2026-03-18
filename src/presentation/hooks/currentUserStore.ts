"use client";

import { useSyncExternalStore } from "react";

interface CurrentUser {
  userId: string;
}

interface CurrentUserSnapshot {
  user: CurrentUser | null;
  isLoading: boolean;
}

const CURRENT_USER_EVENT = "current-user-change";

let currentSnapshot: CurrentUserSnapshot = {
  user: null,
  isLoading: true,
};

let currentRequest: Promise<void> | null = null;

function emitCurrentUserChange() {
  window.dispatchEvent(new Event(CURRENT_USER_EVENT));
}

async function fetchCurrentUser() {
  if (!currentSnapshot.isLoading) {
    return;
  }

  if (!currentRequest) {
    currentRequest = fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    })
      .then(async (response) => {
        const data = (await response.json()) as CurrentUser;
        currentSnapshot = {
          user: data,
          isLoading: false,
        };
      })
      .catch(() => {
        currentSnapshot = {
          user: null,
          isLoading: false,
        };
      })
      .finally(() => {
        currentRequest = null;
        emitCurrentUserChange();
      });
  }

  await currentRequest;
}

function subscribe(onStoreChange: () => void) {
  if (currentSnapshot.isLoading) {
    void fetchCurrentUser();
  }

  const handleChange = () => onStoreChange();
  window.addEventListener(CURRENT_USER_EVENT, handleChange);

  return () => {
    window.removeEventListener(CURRENT_USER_EVENT, handleChange);
  };
}

function getSnapshot() {
  return currentSnapshot;
}

export function useCurrentUserStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
