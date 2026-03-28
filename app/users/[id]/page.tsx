"use client";
import dynamic from "next/dynamic";

const UserDetailPage = dynamic(
  () => import("@/common/frontend/UserDetailPage/UserDetailPage"),
  { ssr: false },
);

export default function page() {
  return <UserDetailPage />;
}
