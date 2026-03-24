"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/common/frontend/Sidebar/Sidebar";
import Header from "../Header/Header";
import { HeaderSearch } from "../HeaderSearch/HeaderSearch";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <div className="min-h-screen">
      {isLoggedIn && <Sidebar />}

      <div className={`${isLoggedIn ? "ml-64" : ""} flex flex-col min-h-screen`}>
        {/* Header */}
        {isLoggedIn && (
          <div className="sticky top-0 z-40 bg-white border-gray-300">
            <Header
              title="Dashboard"
              rightContent={
                <>
                  <HeaderSearch onSearch={(val) => console.log(val)} />
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    + Post Job
                  </button>
                </>
              }
            />
          </div>
        )}

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