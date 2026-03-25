"use client";
import dynamic from "next/dynamic";

const UserDetailPage = dynamic(
  () => import("@/common/frontend/UserDetailPage/UserDetailPage"),
  { ssr: false },
);

export default async function page() {
  return <UserDetailPage />;
}
