"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import NavSection from "../NavSection/NavSection";
import { mainNav, toolsNav } from "./SideBar.Data";
import { useEffect, useState } from "react";
import Avatar from "../Avatar/Avatar";
import getCandidatesCount from "@/services/frontend/candidates-count";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [candidateCount, setCandidateCount] = useState<number>(0);

  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    // 🔥 Fetch candidate count
    const fetchCount = async () => {
      try {
        const res = await getCandidatesCount();
        // API returns { success: true, data: { count: number } }
        setCandidateCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch candidate count", err);
      }
    };

    fetchCount();
  }, []);

  const handleLogout = async () => {
    logout();
    router.push("/sign-in");
  };

  if (!user) return null;

  const isAdmin = user?.isAdmin === true;

  return (
    <>
      {/* 🔥 Hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow"
      >
        <Menu size={20} />
      </button>

      {/* 🔥 Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔥 Sidebar */}
      <aside
        className={`overflow-auto fixed top-0 left-0 w-full md:w-64 h-screen bg-[#0B1220] text-white flex flex-col justify-between z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Top */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 w-8 h-8 rounded-md flex items-center justify-center">
                ⚡
              </div>
              <h2 className="text-2xl font-bold tracking-wide flex items-center relative">
                <span className="text-red-500">X</span>
                <span className="text-green-500">perthi</span>
                <span className="text-blue-500">repro</span>

                {/* Wave underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-24 h-4"
                  viewBox="0 0 100 20"
                  fill="none"
                >
                  <path
                    d="M0 10 Q15 0 30 10 T60 10 T100 10"
                    stroke="#0284c7"
                    strokeWidth="3"
                    fill="transparent"
                  />
                </svg>
              </h2>
            </div>

            <button onClick={() => setIsOpen(false)} className="md:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <NavSection
            title="Main"
            items={mainNav
              .filter((item) => {
                if (
                  ["/dashboard", "/clients"].includes(item.href) &&
                  !isAdmin
                ) {
                  return false;
                }
                return true;
              })
              .map((item) => {
                // 🔥 Inject dynamic badge here
                if (item.href === "/candidates") {
                  return {
                    ...item,
                    badge: candidateCount, // ✅ now a number
                  };
                }
                return item;
              })}
          />

          <NavSection title="Tools" items={toolsNav} />
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800">
          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="mx-3 mt-3 flex w-[calc(100%-1.5rem)] items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-red-500 hover:text-white transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          {/* Profile */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar firstName={user?.firstName} lastName={user?.lastName} />

              <div>
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? "Admin" : "Sub user"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
