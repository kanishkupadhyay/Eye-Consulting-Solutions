"use client";

import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";
import dynamic from "next/dynamic";

const CandidatesUploadPage = dynamic(
  () => import("@/common/frontend/CandidatesUploadPage/CandidatesUploadPage"),
  { ssr: false },
);

export default function page() {
  return (
    <AuthGuard>
      <CandidatesUploadPage />
    </AuthGuard>
  );
}
