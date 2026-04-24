"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { MdEmail } from "react-icons/md";

import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    await authApi.forgotPassword(email);
    setSuccess(true);
  } catch (err: any) {
    setError(err.message || "Something went wrong");
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
            If <span className="text-green-400">{email}</span> exists we sent a reset link.
          </p>
          <Link href="/login" className="text-green-400 hover:underline text-sm block">
            Back to Login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
          <p className="text-gray-400 text-sm mt-2">
            Enter your email and we'll send you a reset link.
          </p>
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

        <Button loading={loading}>
          Send Reset Link
        </Button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <div className="text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link href="/login" className="text-green-400 hover:underline">
            Login here
          </Link>
        </div>

      </form>
    </Card>
  );
}