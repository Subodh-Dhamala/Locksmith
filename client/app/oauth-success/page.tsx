"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Let AuthProvider handle everything
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Completing login...
    </div>
  );
}