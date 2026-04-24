"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token as string, password, confirmPassword);
      router.replace("/login");
    } catch (err: any) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your new password below.</p>
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <Button loading={loading}>Reset Password</Button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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