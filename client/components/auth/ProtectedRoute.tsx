"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // safe navigation side-effect
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return null; // UI blocked, redirect handled in effect
  }

  return <>{children}</>;
}