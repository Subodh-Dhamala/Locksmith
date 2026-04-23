"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function OAuthSuccess() {
  const { refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await refresh();

        if (mounted) {
          router.replace("/dashboard");
        }
      } catch {
        router.replace("/login");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  return <Spinner />;
}