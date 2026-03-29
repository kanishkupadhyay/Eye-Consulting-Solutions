"use client";

import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";
import dynamic from "next/dynamic";

const CandidatesPage = dynamic(
  () => import("@/common/frontend/CandidatesPage/CandidatesPage"),
  { ssr: false },
);

export default function page() {
  return (
    <AuthGuard>
      <CandidatesPage />
    </AuthGuard>
  );
}
