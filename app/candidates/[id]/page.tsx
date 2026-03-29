"use client";

import AuthGuard from "@/common/frontend/AuthGuard/AuthGuard";
import dynamic from "next/dynamic";

const CandidateDetailPage = dynamic(
  () => import("@/common/frontend/CandidateDetailPage/CandidateDetailPage"),
  { ssr: false },
);

export default function page({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <CandidateDetailPage candidateId={params.id} />
    </AuthGuard>
  );
}
