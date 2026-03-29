"use client";
import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";

export default function Page() {
  return (
    <AuthGuard>
      <></>
    </AuthGuard>
  );
}
