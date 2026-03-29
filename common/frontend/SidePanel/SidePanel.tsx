"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  children,
  title = "Details",
}) => {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] max-w-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition transform hover:scale-110"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          {children}
        </div>
      </div>
    </>
  );
};

export default SidePanel;