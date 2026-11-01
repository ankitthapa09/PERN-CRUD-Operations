"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuthentication = async () => {
      try {
        await authApi.me();
        if (active) {
          setAuthenticated(true);
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, [router]);

  if (checking || !authenticated) {
    return (
      <main className="auth-loading" aria-live="polite">
        Checking your session...
      </main>
    );
  }

  return <>{children}</>;
}
