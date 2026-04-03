"use client";

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
  cssClasses?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  errorMessage?: string;
  containerClasses?: string;
}

const SelectDropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  cssClasses = "",
  containerClasses = "",
  disabled = false,
  searchable = false,
  required = false,
  errorMessage = "",
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchText(""); // reset search when closed
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search text
  const filteredOptions =
    searchable && searchText
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchText.toLowerCase()),
        )
      : options;

  return (
    <div className={`flex flex-col relative ${containerClasses}`} ref={dropdownRef}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-500">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex justify-between items-center border border-gray-200 py-2 px-4 shadow-sm rounded-lg w-full text-left
          bg-white ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:border-orange-500"} 
          focus:outline-none transition-colors ${errorMessage ? "border-red-500" : ""} ${cssClasses}`}
        disabled={disabled}
      >
        <span
          className={`${selectedOption ? "text-gray-800" : "text-gray-400"} text-[14px]`}
        >
          {selectedOption?.label || placeholder || "Select an option"}
        </span>
        <FiChevronDown className="text-gray-500" />
      </button>
      {errorMessage && (
        <span className="text-red-500 text-sm mt-1">{errorMessage}</span>
      )}

      {isOpen && !disabled && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto top-full">
          {searchable && (
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full p-2 border-b border-gray-200 focus:outline-none"
            />
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchText("");
                }}
                className="p-3 hover:bg-orange-100 cursor-pointer transition-colors"
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-400">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
