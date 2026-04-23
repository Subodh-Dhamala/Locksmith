"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const called = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`,
          { method: "GET" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setStatus("success");
        setMessage("Your email has been verified!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      }
    };

    verify();
  }, [token]);

  return (
    <Card>
      <div className="text-center space-y-4 py-4">

        {status === "loading" && (
          <>
            <h2 className="text-2xl font-bold text-white">Verifying...</h2>
            <p className="text-gray-400">Please wait while we verify your email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-green-400">{message}</p>
            <Link href="/login" className="text-green-400 hover:underline text-sm block">
              Continue to Login →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-red-400">{message}</p>
            <Link href="/register" className="text-green-400 hover:underline text-sm block">
              Back to Register
            </Link>
          </>
        )}

      </div>
    </Card>
  );
}