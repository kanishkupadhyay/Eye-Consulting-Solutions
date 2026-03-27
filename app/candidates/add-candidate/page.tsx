"use client";

import dynamic from "next/dynamic";

const AddCandidatesPage = dynamic(
  () => import("@/common/frontend/AddCandidatesPage/AddCandidatesPage"),
  { ssr: false },
);

export default async function page() {
  return <AddCandidatesPage />;
}
