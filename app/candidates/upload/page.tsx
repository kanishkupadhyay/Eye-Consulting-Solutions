"use client";

import dynamic from "next/dynamic";

const CandidatesUploadPage = dynamic(
  () => import("@/common/frontend/CandidatesUploadPage/CandidatesUploadPage"),
  { ssr: false },
);

export default async function page() {
  return <CandidatesUploadPage />;
}
