"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/user";

export default function RoleGuard({
  role,
  children,
}: {
  role: Role | Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  const allowed = Array.isArray(role)
    ? role.includes(user.role)
    : user.role === role;

  if (!allowed) return null;

  return <>{children}</>;
}