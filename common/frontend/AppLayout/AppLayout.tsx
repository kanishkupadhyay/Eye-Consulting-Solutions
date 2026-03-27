"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/common/frontend/Sidebar/Sidebar";
import Header from "../Header/Header";
import { HeaderSearch } from "../HeaderSearch/HeaderSearch";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // New: dropdown state
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for outside click

  // User info listener
  useEffect(() => {
    const getUserInfo = () => {
      const data = localStorage.getItem("userInfo");
      setUserInfo(data ? JSON.parse(data) : null);
    };
    getUserInfo();
    window.addEventListener("storage", getUserInfo);
    window.addEventListener("authChange", getUserInfo);
    return () => {
      window.removeEventListener("storage", getUserInfo);
      window.removeEventListener("authChange", getUserInfo);
    };
  }, []);

  // Auth listener
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };
    checkToken();
    window.addEventListener("storage", checkToken);
    window.addEventListener("authChange", checkToken);
    return () => {
      window.removeEventListener("storage", checkToken);
      window.removeEventListener("authChange", checkToken);
    };
  }, []);

  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const mainRoute = segments[0];

  const getTitleFromPath = () => {
    if (!pathname) return "Dashboard";
    return mainRoute
      ? mainRoute.charAt(0).toUpperCase() + mainRoute.slice(1)
      : "Dashboard";
  };
  const dynamicTitle = getTitleFromPath();

  // Only show button on candidates page
  const getHeaderActions = () => {
    if (mainRoute === "candidates") {
      return [
        { label: "Add Candidate", value: "add-candidate" },
        { label: "Bulk Upload", value: "bulk-upload" },
      ];
    }
    return [];
  };
  const headerActions = getHeaderActions();

  const handleActionButtonClick = (value: string) => {
    setDropdownOpen(false); // Close dropdown after click
    switch (value) {
      case "add-candidate":
        router.push("/candidates/add-candidate");
        break;
      case "bulk-upload":
        router.push("/candidates/upload");
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                  {headerActions.length > 0 && (
                    <>
                      <HeaderSearch onSearch={(val) => console.log(val)} />
                      <div
                        className="relative inline-block text-left"
                        ref={dropdownRef}
                      >
                        {/* Button */}
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none"
                        >
                          + Candidates
                          <svg
                            className="-mr-1 ml-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.062a.75.75 0 111.08 1.04l-4.25 4.656a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                          <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="py-1">
                              {headerActions.map((action) => (
                                <button
                                  key={action.value}
                                  onClick={() =>
                                    handleActionButtonClick(action.value)
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              }
            />
          </div>
        )}

        {isLoggedIn ? (
          <h1 className="bg-[#f4f1eb] px-6 pt-6 pb-2 text-2xl font-semibold text-gray-800">
            Welcome,{" "}
            <span className="text-gray-900">{userInfo?.firstName}</span>{" "}
            <span
              className="inline-block origin-[70%_70%] animate-[wave_1.5s_ease-in-out_infinite]"
              style={{
                display: "inline-block",
                transformOrigin: "70% 70%",
                animationName: "wave",
              }}
            >
              👋
            </span>
            <style>
              {`
      @keyframes wave {
        0% { transform: rotate(0deg); }
        15% { transform: rotate(14deg); }
        30% { transform: rotate(-8deg); }
        40% { transform: rotate(14deg); }
        50% { transform: rotate(-4deg); }
        60% { transform: rotate(10deg); }
        70% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
      }
    `}
            </style>
          </h1>
        ) : null}

        <main
          className={`flex-1 overflow-y-auto ${isLoggedIn ? "bg-[#f4f1eb]" : "bg-gray-100"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
