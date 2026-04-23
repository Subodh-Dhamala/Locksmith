"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="border border-gray-600 px-4 py-2 rounded text-white hover:bg-gray-800 disabled:opacity-50 transition"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}