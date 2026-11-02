"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/features/auth/api";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuthentication = async () => {
      const redirectToLogin = () => {
        if (active) {
          setRedirecting(true);
          window.location.replace("/login");
        }
      };

      try {
        await authApi.me();
        if (active) {
          setAuthenticated(true);
        }
      } catch {
        try {
          await authApi.refresh();
          await authApi.me();
          if (active) {
            setAuthenticated(true);
          }
        } catch {
          redirectToLogin();
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
  }, []);

  if (checking || redirecting || !authenticated) {
    return (
      <main className="auth-loading" aria-live="polite">
        Checking your session...
      </main>
    );
  }

  return <>{children}</>;
}
