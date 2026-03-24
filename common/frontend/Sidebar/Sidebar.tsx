"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import NavSection from "../NavSection/NavSection";
import { mainNav, toolsNav } from "./SideBar.Data";
import { useEffect, useState } from "react";
import { IUserInfo } from "@/common/backend/user.interfaces";
import Avatar from "../Avatar/Avatar";

export default function Sidebar() {
  const [loggedInUserInfo, setLoggedInUserInfo] = useState<IUserInfo | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo") ?? "");
    if (user) {
      setLoggedInUserInfo(user);
    }
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      window.dispatchEvent(new Event("authChange"));
      router.push("/sign-in");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-[#0B1220] text-white flex flex-col justify-between">
      {/* Top */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
          <div className="bg-orange-500 w-8 h-8 rounded-md flex items-center justify-center">
            ⚡
          </div>
          <h1 className="text-lg font-semibold">TalentFlow</h1>
        </div>

        {/* Navigation */}
        <NavSection title="Main" items={mainNav} />
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
              firstName={loggedInUserInfo?.firstName}
              lastName={loggedInUserInfo?.lastName}
            />

            <div>
              <p className="text-sm font-medium">
                {loggedInUserInfo?.firstName} {loggedInUserInfo?.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {loggedInUserInfo?.isAdmin ? "Admin" : "Sub user"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
