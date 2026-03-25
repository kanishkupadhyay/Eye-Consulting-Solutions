"use client";

import dynamic from "next/dynamic";

const CandidatesPage = dynamic(
  () => import("@/common/frontend/CandidatesPage/CandidatesPage"),
  { ssr: false },
);

export default async function page() {
  return <CandidatesPage />;
}
