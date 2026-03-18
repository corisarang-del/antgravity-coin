"use client";

import { useCurrentUserStore } from "@/presentation/hooks/currentUserStore";

export function useCurrentUser() {
  return useCurrentUserStore();
}
