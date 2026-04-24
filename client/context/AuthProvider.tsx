"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import { authApi, oauthAPI, setAuthHandlers } from "@/lib/api";
import { setTokenRef } from "@/lib/auth";
import { User } from "@/types/user";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  pendingTwoFactor: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (code: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  refresh: () => Promise<any>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTwoFactor, setPendingTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);

  // session restore
  useEffect(() => {
    const init = async () => {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.accessToken);
        setTokenRef(data.accessToken);
        setUser(data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
        setTokenRef(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // wire up 401 retry bridge
  useEffect(() => {
    setAuthHandlers({
      refresh: async () => {
        try {
          const data = await authApi.refresh();
          setAccessToken(data.accessToken);
          setTokenRef(data.accessToken);
          setUser(data.user);
          return data.accessToken;
        } catch {
          return null;
        }
      },
      logout: () => {
        setAccessToken(null);
        setTokenRef(null);
        setUser(null);
        router.replace("/login");
      },
    });
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);

    if (data.requiresTwoFactor) {
      setPendingTwoFactor(true);
      setTwoFactorUserId(data.userId!);
      return;
    }

    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);
    setUser(data.user);
    router.replace("/dashboard");
  };

  const loginWithOTP = async (code: string) => {
    const data = await authApi.twoFactorLogin(twoFactorUserId!, code);
    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);
    setUser(data.user);
    setPendingTwoFactor(false);
    setTwoFactorUserId(null);
    router.replace("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setTokenRef(null);
      setUser(null);
      router.replace("/login");
    }
  };

  const loginWithGoogle = () => oauthAPI.google();
  const loginWithGithub = () => oauthAPI.github();

  const refresh = async () => {
    const data = await authApi.refresh();
    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        pendingTwoFactor,
        login,
        loginWithOTP,
        register,
        logout,
        loginWithGithub,
        loginWithGoogle,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}