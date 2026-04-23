"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

import { FaLock, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <div className="text-center space-y-4 py-4">
          <h2 className="text-2xl font-bold text-white">Check your email!</h2>
          <p className="text-gray-400">
            We sent a verification link to <span className="text-green-400">{email}</span>.
            Please verify before logging in.
          </p>
          <Link href="/login" className="text-green-400 hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleRegister} className="space-y-6">

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
        </div>

        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
          />
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

        <Button loading={loading}>
          Create Account
        </Button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:underline">
            Login here
          </Link>
        </div>

      </form>
    </Card>
  );
}