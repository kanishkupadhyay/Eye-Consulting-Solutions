"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/common/frontend/Sidebar/Sidebar";
import Header from "../Header/Header";
import { HeaderSearch } from "../HeaderSearch/HeaderSearch";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TopLoader from "../TopLoader/TopLoader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false); // New: dropdown state
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for outside click
  const { user } = useAuth();

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
        router.push("/candidates/bulk-upload");
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
      {user && <Sidebar />}

      <div className={`${user ? "md:ml-64" : ""} flex flex-col min-h-screen`}>
        {/* Header */}
        {user && (
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
                        <Button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm font-medium text-white focus:outline-none"
                        >
                          + Candidates
                          <ChevronDown className="ml-2 h-5 w-5" />
                        </Button>

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

        {user ? (
          <h1 className="bg-[#f4f1eb] px-6 pt-6 pb-2 text-2xl font-semibold text-gray-800">
            Welcome, <span className="text-orange-400">{user?.firstName}</span>{" "}
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
        {/* Top Loader */}
        <TopLoader />
        <main
          className={`flex-1 overflow-y-auto ${user ? "bg-[#f4f1eb]" : "bg-gray-100"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
