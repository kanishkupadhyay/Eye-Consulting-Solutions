"use client";

import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";
import dynamic from "next/dynamic";

const AddCandidatePage = dynamic(
  () => import("@/common/frontend/AddCandidatePage/AddCandidatePage"),
  { ssr: false },
);

export default function page() {
  return (
    <AuthGuard>
      <AddCandidatePage />
    </AuthGuard>
  );
}
