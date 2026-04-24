"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

import { FaGithub, FaLock, FaGoogle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const { login, loginWithGoogle, loginWithGithub } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Welcome Back!
          </h2>
        </div>

        <div className="relative">
          <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex justify-end -mt-3">
          <Link
            href="/forgot-password"
            className="text-sm text-green-400 hover:text-green-300 hover:underline transition"
          >
            Forgot password?
          </Link>
        </div>

        <Button loading={loading} disabled={loading}>
          Login
        </Button>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        <div className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-green-400 hover:underline"
          >
            Register here
          </Link>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full border border-gray-600 p-3 rounded text-white flex items-center justify-center gap-2 hover:bg-gray-800"
          >
            <FaGoogle />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={loginWithGithub}
            className="w-full border border-gray-600 p-3 rounded text-white flex items-center justify-center gap-2 hover:bg-gray-800"
          >
            <FaGithub />
            Continue with GitHub
          </button>
        </div>
      </form>
    </Card>
  );
}