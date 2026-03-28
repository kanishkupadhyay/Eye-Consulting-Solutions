"use client";

import dynamic from "next/dynamic";

const CandidateDetailPage = dynamic(
  () => import("@/common/frontend/CandidateDetailPage/CandidateDetailPage"),
  { ssr: false },
);

export default function page({ params }: { params: { id: string } }) {
  return <CandidateDetailPage candidateId={params.id} />;
}
