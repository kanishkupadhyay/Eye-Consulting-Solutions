"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface YearPickerProps {
  label?: string;
  value: number | undefined;
  onChange: (year: number) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  errorMessage?: string; // ✅ Add this
}

const YearPicker: React.FC<YearPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select Year",
  minYear = 1950,
  maxYear = new Date().getFullYear() + 5,
  errorMessage, // ✅ Add this
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const togglePopover = () => setOpen((prev) => !prev);

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  return (
    <div className="relative w-full" ref={ref}>
      {label && (
        <label className="block text-sm text-gray-500 mb-1">{label}</label>
      )}
      <div
        className={`w-full border rounded-lg p-2 cursor-pointer flex justify-between items-center text-sm bg-white focus:outline-none focus:ring-2 ${
          errorMessage
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-orange-500"
        }`}
        onClick={togglePopover}
      >
        {value ?? placeholder}
        <FiChevronDown size={18} />
      </div>

      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto border border-gray-300 rounded-lg bg-white shadow-lg">
          {years.map((y) => (
            <div
              key={y}
              className="px-3 py-2 hover:bg-orange-100 cursor-pointer"
              onClick={() => {
                onChange(y);
                setOpen(false);
              }}
            >
              {y}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YearPicker;