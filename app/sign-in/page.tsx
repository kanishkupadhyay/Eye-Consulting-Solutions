"use client";

import dynamic from "next/dynamic";

const AuthPage = dynamic(() => import("@/common/frontend/AuthPage/AuthPage"), {
  ssr: false,
});

export default function Page() {
  return <AuthPage />;
}
