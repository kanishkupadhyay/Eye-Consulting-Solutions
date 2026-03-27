'use client';

import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface SelectDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SelectDropdown = ({ label, options, value, onChange, placeholder }: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col relative" ref={dropdownRef}>
      {/* Label */}
      <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center border p-3 rounded-lg w-full text-left bg-white hover:border-orange-500 focus:outline-none transition-colors"
      >
        <span className={`${value ? "text-gray-800" : "text-gray-400"}`}>
          {value || placeholder || "Select an option"}
        </span>
        <FiChevronDown className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto top-full">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="p-3 hover:bg-orange-100 cursor-pointer transition-colors"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;