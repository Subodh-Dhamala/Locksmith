const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import { User, Role } from "@/types/user";
import { AuthResponse, ApiError } from "@/types/auth";
import { getToken } from "./auth";

// core request wrapper
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((data as ApiError)?.message || "Request failed");
  }

  return data;
}

// auth handler bridge
let _refresh: (() => Promise<string | null>) | null = null;
let _logout: (() => void) | null = null;

export const setAuthHandlers = (handlers: {
  refresh: () => Promise<string | null>;
  logout: () => void;
}) => {
  _refresh = handlers.refresh;
  _logout = handlers.logout;
};

// authenticated request wrapper
async function authRequest<T>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (res.ok) {
    return data;
  }

  // handle 401
  if (res.status === 401 && retry && _refresh) {
    const newToken = await _refresh();

    if (!newToken) {
      _logout?.();
      throw new Error("Session expired");
    }

    return authRequest<T>(url, options, false);
  }

  _logout?.();
  throw new Error((data as ApiError)?.message || "Request failed");
}

// auth api
export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  refresh: () =>
    request<AuthResponse>("/auth/refresh", {
      method: "POST",
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  getMe: () =>
    authRequest<User>("/user/me", {
      method: "GET",
    }),
};

// admin api
export const adminAPI = {
  getUsers: (page = 1, limit = 10) =>
    authRequest<{
      users: User[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/users?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  updateUserRole: (userId: string, role: Role) =>
    authRequest<{ message: string; user: User }>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  deleteUser: (userId: string) =>
    authRequest<{ message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    }),
};

// moderator api
export const moderatorAPI = {
  getUsers: () =>
    authRequest<{ users: User[] }>("/moderator/users", {
      method: "GET",
    }),
};

// oauth
export const oauthAPI = {
  google: () => {
    window.location.href = `${BASE_URL}/auth/google`;
  },

  github: () => {
    window.location.href = `${BASE_URL}/auth/github`;
  },
};