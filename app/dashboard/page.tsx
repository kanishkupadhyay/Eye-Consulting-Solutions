'use client';
import dynamic from "next/dynamic";

const DashboardPage = dynamic(
  () => import("@/common/frontend/DashboardPage/DashboardPage"),
  { ssr: false },
);

export default function page() {
  return <DashboardPage />;
}
