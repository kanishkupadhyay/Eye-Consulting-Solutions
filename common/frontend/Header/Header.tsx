"use client";

import { IHeaderProps } from "./Header.Model";

export default function Header({
  title,
  leftContent,
  rightContent,
}: IHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between bg-[#faf8f3] px-6 py-4 border-b border-gray-300">
      {/* Left */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        )}
        {leftContent}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {rightContent}
      </div>
    </div>
  );
}