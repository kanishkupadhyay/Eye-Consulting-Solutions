"use client";

import { Search } from "lucide-react";

export function HeaderSearch({
  onSearch,
}: {
  onSearch?: (val: string) => void;
}) {
  return (
    <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-300">
      <Search size={16} className="text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Search candidates jobs..."
        onChange={(e) => onSearch?.(e.target.value)}
        className="bg-transparent outline-none text-sm"
      />
    </div>
  );
}