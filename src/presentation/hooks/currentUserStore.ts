"use client";

import { useSyncExternalStore } from "react";

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  image: string;
  providerHints: string[];
}

export interface CurrentUserSnapshot {
  user: CurrentUser | null;
  guestUserId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CURRENT_USER_EVENT = "current-user-change";

let currentSnapshot: CurrentUserSnapshot = {
  user: null,
  guestUserId: null,
  isAuthenticated: false,
  isLoading: true,
};

let currentRequest: Promise<void> | null = null;
let hasBootstrappedInitialSnapshot = false;

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
        const data = (await response.json()) as {
          user: CurrentUser | null;
          guestUserId: string | null;
          isAuthenticated: boolean;
        };

        currentSnapshot = {
          user: data.user,
          guestUserId: data.guestUserId,
          isAuthenticated: data.isAuthenticated,
          isLoading: false,
        };
      })
      .catch(() => {
        currentSnapshot = {
          user: null,
          guestUserId: null,
          isAuthenticated: false,
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

function subscribe(onStoreChange: () => void, initialSnapshot?: CurrentUserSnapshot) {
  if (initialSnapshot && !hasBootstrappedInitialSnapshot && currentSnapshot.isLoading) {
    currentSnapshot = initialSnapshot;
    hasBootstrappedInitialSnapshot = true;
  }

  if (currentSnapshot.isLoading) {
    void fetchCurrentUser();
  }

  const handleChange = () => onStoreChange();
  window.addEventListener(CURRENT_USER_EVENT, handleChange);

  return () => {
    window.removeEventListener(CURRENT_USER_EVENT, handleChange);
  };
}

function getSnapshot(initialSnapshot?: CurrentUserSnapshot) {
  if (initialSnapshot && !hasBootstrappedInitialSnapshot && currentSnapshot.isLoading) {
    return initialSnapshot;
  }

  return currentSnapshot;
}

export function refreshCurrentUserStore() {
  currentSnapshot = {
    user: null,
    guestUserId: null,
    isAuthenticated: false,
    isLoading: true,
  };
  emitCurrentUserChange();
}

export function useCurrentUserStore(initialSnapshot?: CurrentUserSnapshot) {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(onStoreChange, initialSnapshot),
    () => getSnapshot(initialSnapshot),
    () => getSnapshot(initialSnapshot),
  );
}
