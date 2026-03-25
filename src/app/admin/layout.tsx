import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const adminAccess = await getAdminAccess();

  if (!adminAccess.allowed) {
    notFound();
  }

  return <>{children}</>;
}
