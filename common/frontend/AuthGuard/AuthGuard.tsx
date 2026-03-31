"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // ❌ not logged in
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // 🔥 admin redirect from root
    if (user.isAdmin && pathname === "/") {
      router.push("/dashboard");
      return;
    }

    // 🔥 non-admin redirect from root
    if (!user.isAdmin && pathname === "/") {
      router.push("/candidates");
      return;
    }
  }, [user, loading, pathname]);

  if (loading) return null;
  if (!user) return null;

  return <>{children}</>;
}
