"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface ExpandableCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const ExpandableCard = ({
  title,
  children,
  defaultOpen = true,
}: ExpandableCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={clsx(
        "group rounded-2xl border bg-white transition-all duration-300",
        "shadow-sm hover:shadow-md",
        isOpen ? "border-gray-300" : "border-gray-200"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <div
            className={clsx(
              "h-5 w-1.5 rounded-full transition-all duration-300",
              isOpen ? "bg-blue-500" : "bg-gray-300 group-hover:bg-gray-400"
            )}
          />

          <h2 className="text-base font-semibold text-gray-800 tracking-tight">
            {title}
          </h2>
        </div>

        <ChevronDown
          className={clsx(
            "h-5 w-5 hover:text-orange-300 text-gray-400 transition-all duration-300",
            "group-hover:text-gray-600",
            isOpen && "rotate-180 text-gray-700"
          )}
        />
      </button>

      {/* Divider */}
      <div
        className={clsx(
          "h-px bg-gray-100 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Body */}
      <div
        className={clsx(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 py-5 text-sm text-gray-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableCard;