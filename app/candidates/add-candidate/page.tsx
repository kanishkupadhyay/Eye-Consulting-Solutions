"use client";

import dynamic from "next/dynamic";

const AddCandidatePage = dynamic(
  () => import("@/common/frontend/AddCandidatePage/AddCandidatePage"),
  { ssr: false },
);

export default async function page() {
  return <AddCandidatePage />;
}
