"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

import LogoutButton from "@/components/auth/LogoutButton";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <pre className="text-green-400 mt-4 text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
    <LogoutButton />
      </div>
    </ProtectedRoute>
  );
}