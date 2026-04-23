"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/auth/LogoutButton";
import RoleGuard from "@/components/auth/RoleGuard";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-6 text-white space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <pre className="text-green-400 text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>

        <LogoutButton />

        <RoleGuard role="ADMIN">
          <div className="text-yellow-400">Admin Panel</div>
        </RoleGuard>

        <RoleGuard role="USER">
          <div className="text-blue-400">User Panel</div>
        </RoleGuard>

        <RoleGuard role={["ADMIN", "MODERATOR"]}>
          <div className="text-green-400">Mod Tools</div>
        </RoleGuard>
      </div>
    </ProtectedRoute>
  );
}