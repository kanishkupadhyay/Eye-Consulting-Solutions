"use client";

import NotFound from "@/common/frontend/NotFound/NotFound";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const AuthPage = dynamic(() => import("@/common/frontend/AuthPage/AuthPage"), {
  ssr: false,
});

export default function Page() {
  const { user } = useAuth();
  if (!user) {
    return <AuthPage />;
  }
  return <NotFound title={""} />;
}
