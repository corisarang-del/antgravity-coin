"use client";

import { useEffect, useState } from "react";

interface CurrentUser {
  userId: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        });
        const data = (await response.json()) as CurrentUser;

        if (!cancelled) {
          setUser(data);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    isLoading,
  };
}
