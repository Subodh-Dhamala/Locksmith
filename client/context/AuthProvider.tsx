"use client";

import {createContext, useState, ReactNode} from "react";
import {useRouter} from "next/navigation";

import {authApi} from "@/lib/api";
import { setTokenRef } from "@/lib/auth";

import { User } from "@/types/user";

type AuthContextType = {
  user: User | null;
  accessToken : string | null;

  login: (email:string, password:string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: ()=> Promise <void>;

  setUser: (user: User | null) => void;

};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({children}: {children: ReactNode}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken,setAccessToken] = useState<string | null> (null);

  //login
  const login = async (email:string, password: string)=>{
    const data = await authApi.login(email,password);
    
    setAccessToken(data.accessToken);
    setTokenRef(data.accessToken);

    setUser(data.user);

    router.push("/dashboard");
  }

  //register
  const register = async (name: string, email: string, password: string) => {
  const data = await authApi.register(name, email, password);

  setAccessToken(data.accessToken);
  setTokenRef(data.accessToken);

  setUser(data.user);

  router.push("/dashboard");
};

  //logout
  const logout = async ()=>{
    try{
      await authApi.logout();
    }
    finally{
      setAccessToken(null);
      setTokenRef(null);
      setUser(null);

      router.push("/login");
    }
  };

  return(
    <AuthContext.Provider
    value={{
      user,
      accessToken,
      login,
      register,
      logout,
      setUser,
    }}
    >
      {children}

    </AuthContext.Provider>
  );
  

}