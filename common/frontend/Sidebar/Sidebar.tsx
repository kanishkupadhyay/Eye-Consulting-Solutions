"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import NavSection from "../NavSection/NavSection";
import { mainNav, toolsNav } from "./SideBar.Data";
import { useEffect, useState } from "react";
import { IUserInfo } from "@/common/backend/user.interfaces";
import Avatar from "../Avatar/Avatar";

export default function Sidebar() {
  const [loggedInUserInfo, setLoggedInUserInfo] = useState<IUserInfo | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("userInfo");
    const user = data ? JSON.parse(data) : null;
    if (user) setLoggedInUserInfo(user);
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    router.push("/sign-in");
  };

  if (!loggedInUserInfo) return null;

  const isAdmin = loggedInUserInfo.isAdmin === true;

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
        className={`fixed top-0 left-0 w-full md:w-64 h-screen bg-[#0B1220] text-white flex flex-col justify-between z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Top */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 w-8 h-8 rounded-md flex items-center justify-center">
                ⚡
              </div>
              <h1 className="text-lg font-semibold">TalentFlow</h1>
            </div>

            <button onClick={() => setIsOpen(false)} className="md:hidden">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <NavSection
            title="Main"
            items={mainNav.filter((item) => {
              // ❗ hide dashboard for NON-admin
              if (item.href === "/dashboard" && !isAdmin) {
                return false;
              }
              return true;
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
              <Avatar
                firstName={loggedInUserInfo.firstName}
                lastName={loggedInUserInfo.lastName}
              />

              <div>
                <p className="text-sm font-medium">
                  {loggedInUserInfo.firstName} {loggedInUserInfo.lastName}
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
