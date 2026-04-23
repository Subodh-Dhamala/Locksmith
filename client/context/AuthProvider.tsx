"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import { authApi,oauthAPI} from "@/lib/api";
import { setTokenRef } from "@/lib/auth";

import { User } from "@/types/user";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
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

//session restore
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


  //login
  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);

    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);
    setUser(data.user);

    router.replace("/dashboard");
  };

  //register
  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const data = await authApi.register(name, email, password);

    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);
    setUser(data.user);

    router.replace("/dashboard");
  };

  //logout
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

//oauth api
const loginWithGoogle = () => {
  oauthAPI.google();
};

const loginWithGithub = () => {
  oauthAPI.github();
};

//refresh 
const refresh = async () => {
  try {
    const data = await authApi.refresh();

    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);
    setUser(data.user);

    return data;
  } catch (err) {
    setUser(null);
    setAccessToken(null);
    setTokenRef(null);
    throw err;
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        loginWithGithub,
        loginWithGoogle,
        refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}