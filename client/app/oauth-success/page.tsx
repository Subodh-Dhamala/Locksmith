"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function OAuthSuccess() {
  const { refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        await refresh();
        router.replace("/dashboard");
      } catch {
        router.replace("/login");
      }
    };

    run();
  }, [refresh, router]);

  return <Spinner/>;
}