"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      redirect("/sign-in");
    }
    const isAdmin = JSON.parse(localStorage.getItem("userInfo") ?? "")?.isAdmin;
    if (isAdmin) {
      redirect("/dashboard");
    }
  }, []);

  return <></>;
}
