'use client';

import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface Option {
  label: string;
  value: string;
}

interface SelectDropdownProps {
  label?: string;
  options: Option[];
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

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="flex flex-col relative" ref={dropdownRef}>
      {/* Top Label */}
      {label && <label className="mb-1 text-sm font-medium text-gray-500">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center border border-gray-200 py-2 px-4 shadow-sm rounded-lg w-full text-left bg-white hover:border-orange-500 focus:outline-none transition-colors"
      >
        <span className={`${selectedOption ? "text-gray-800" : "text-gray-400"} text-[14px]`}>
          {selectedOption?.label || placeholder || "Select an option"}
        </span>
        <FiChevronDown className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto top-full">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="p-3 hover:bg-orange-100 cursor-pointer transition-colors"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;