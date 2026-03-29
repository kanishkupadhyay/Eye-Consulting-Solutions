"use client";
import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";
import dynamic from "next/dynamic";

const UserDetailPage = dynamic(
  () => import("@/common/frontend/UserDetailPage/UserDetailPage"),
  { ssr: false },
);

export default function page() {
  return (
    <AuthGuard>
      <UserDetailPage />
    </AuthGuard>
  );
}
