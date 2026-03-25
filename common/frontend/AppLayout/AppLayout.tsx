"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/common/frontend/Sidebar/Sidebar";
import Header from "../Header/Header";
import { HeaderSearch } from "../HeaderSearch/HeaderSearch";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserInfo = () => {
      const data = localStorage.getItem("userInfo");
      setUserInfo(data ? JSON.parse(data) : null);
    };

    // initial load
    getUserInfo();

    // Listen for cross-tab storage changes
    window.addEventListener("storage", getUserInfo);

    // Listen for same-tab login/logout events
    window.addEventListener("authChange", getUserInfo);

    return () => {
      window.removeEventListener("storage", getUserInfo);
      window.removeEventListener("authChange", getUserInfo);
    };
  }, []);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    // initial check
    checkToken();

    // Listen for cross-tab storage changes
    window.addEventListener("storage", checkToken);

    // Listen for same-tab login/logout events
    window.addEventListener("authChange", checkToken);

    return () => {
      window.removeEventListener("storage", checkToken);
      window.removeEventListener("authChange", checkToken);
    };
  }, []);

  const pathname = usePathname();

  const getTitleFromPath = () => {
    if (!pathname) return "Dashboard";

    const segments = pathname.split("/").filter(Boolean);

    const mainRoute = segments[0];

    if (!mainRoute) return "Dashboard";

    // Capitalize first letter
    return mainRoute.charAt(0).toUpperCase() + mainRoute.slice(1);
  };

  const dynamicTitle = getTitleFromPath();

  const segments = pathname.split("/").filter(Boolean);
  const mainRoute = segments[0];

  const getHeaderAction = () => {
    switch (mainRoute) {
      case "candidates":
        return {
          label: "+ Post Candidates",
          value: "upload-candidates",
        };
      case "jobs":
        return {
          label: "+ Post Job",
          value: "jobs",
        };
      default:
        return {
          label: "+ Post Job",
          value: "jobs",
        };
    }
  };

  const headerAction = getHeaderAction();

  const handleActionButtonClick = (value: string): void => {
    if(value === 'upload-candidates') {
      router.push('/candidates/upload')
    }
  }

  return (
    <div className="min-h-screen">
      {isLoggedIn && <Sidebar />}

      <div
        className={`${isLoggedIn ? "md:ml-64" : ""} flex flex-col min-h-screen`}
      >
        {/* Header */}
        {isLoggedIn && (
          <div className="sticky top-0 z-40 bg-white border-gray-300">
            <Header
              title={dynamicTitle}
              rightContent={
                <>
                  <HeaderSearch onSearch={(val) => console.log(val)} />
                  <button
                    onClick={() => handleActionButtonClick(headerAction.value)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {headerAction.label}
                  </button>
                </>
              }
            />
          </div>
        )}
        {isLoggedIn ? (
          <h1 className="bg-[#f4f1eb] px-6 pt-6 pb-2 text-2xl font-semibold text-gray-800">
            Welcome,{" "}
            <span className="text-gray-900">{userInfo?.firstName}</span> 👋
          </h1>
        ) : null}
        <main
          className={`flex-1 overflow-y-auto ${
            isLoggedIn ? "bg-[#f4f1eb]" : "bg-gray-100"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
