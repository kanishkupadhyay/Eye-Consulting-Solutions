"use client";

import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";
import dynamic from "next/dynamic";

const ClientsPage = dynamic(
  () => import("@/common/frontend/ClientsPage/ClientsPage"),
  {
    ssr: false,
  },
);

export default function Page() {
  return (
    <AuthGuard>
      <ClientsPage />
    </AuthGuard>
  );
}
