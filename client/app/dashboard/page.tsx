"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/hooks/useAuth";
import { adminAPI, moderatorAPI } from "@/lib/api";
import { User, Role } from "@/types/user";

export default function DashboardPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (user?.role === "ADMIN") {
        const data = await adminAPI.getUsers(p);
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      } else if (user?.role === "MODERATOR") {
        const data = await moderatorAPI.getUsers();
        setUsers(data.users);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "MODERATOR") {
      fetchUsers(page);
    }
  }, [user, page]);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      fetchUsers(page);
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(userId);
      fetchUsers(page);
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 text-white space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              {user?.email} — <span className="text-green-400">{user?.role}</span>
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* USER view */}
        <RoleGuard role="USER">
          <div className="bg-gray-800 rounded p-4 space-y-2">
            <h2 className="text-lg font-semibold">Your Profile</h2>
            <p className="text-gray-400 text-sm">ID: {user?.id}</p>
            <p className="text-gray-400 text-sm">Email: {user?.email}</p>
            <p className="text-gray-400 text-sm">Role: {user?.role}</p>
          </div>
        </RoleGuard>

        {/* ADMIN + MODERATOR user table */}
        <RoleGuard role={["ADMIN", "MODERATOR"]}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Users</h2>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {loading && <p className="text-gray-400 text-sm">Loading...</p>}

            {!loading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2 pr-4">Name</th>
                      <th className="text-left py-2 pr-4">Email</th>
                      <th className="text-left py-2 pr-4">Role</th>
                      <th className="text-left py-2 pr-4">Verified</th>
                      <RoleGuard role="ADMIN">
                        <th className="text-left py-2">Actions</th>
                      </RoleGuard>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-2 pr-4">{u.name ?? "—"}</td>
                        <td className="py-2 pr-4 text-gray-300">{u.email}</td>
                        <td className="py-2 pr-4">
                          <RoleGuard role="ADMIN">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                              className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                            >
                              <option value="USER">USER</option>
                              <option value="MODERATOR">MODERATOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </RoleGuard>
                          <RoleGuard role="MODERATOR">
                            <span className="text-gray-300">{u.role}</span>
                          </RoleGuard>
                        </td>
                        <td className="py-2 pr-4">
                          <span className={u.isVerified ? "text-green-400" : "text-red-400"}>
                            {u.isVerified ? "Yes" : "No"}
                          </span>
                        </td>
                        <RoleGuard role="ADMIN">
                          <td className="py-2">
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="text-red-400 hover:text-red-300 text-xs border border-red-800 rounded px-2 py-1 hover:bg-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </RoleGuard>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination — ADMIN only */}
            <RoleGuard role="ADMIN">
              {totalPages > 1 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-xs border border-gray-600 px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-400 py-1">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-xs border border-gray-600 px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </RoleGuard>

          </div>
        </RoleGuard>

      </div>
    </ProtectedRoute>
  );
}