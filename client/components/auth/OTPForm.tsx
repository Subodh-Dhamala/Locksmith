"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function OTPForm() {
  const { loginWithOTP } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithOTP(code);
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Two-Factor Auth</h2>
          <p className="text-gray-400 text-sm mt-2">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <Input
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />

        <Button loading={loading}>Verify</Button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </form>
    </Card>
  );
}