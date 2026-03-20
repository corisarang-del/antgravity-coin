"use client";

import {
  useCurrentUserStore,
  type CurrentUserSnapshot,
} from "@/presentation/hooks/currentUserStore";

export function useCurrentUser(initialSnapshot?: CurrentUserSnapshot) {
  return useCurrentUserStore(initialSnapshot);
}
