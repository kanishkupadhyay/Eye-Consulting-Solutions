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
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = (options || []).find(
    (opt) => opt.value === value
  );

  // ✅ Filter + sort (best match on top)
  const filteredOptions =
    searchable && searchText
      ? [...(options || [])]
          .map((opt) => {
            const label = opt.label.toLowerCase();
            const search = searchText.toLowerCase();

            let score = 0;
            if (label.startsWith(search)) score = 3;
            else if (label.includes(search)) score = 2;

            return { ...opt, score };
          })
          .filter((opt) => opt.score > 0)
          .sort((a, b) => b.score - a.score)
      : options || [];

  // ✅ First match for ghost text
  const firstMatch =
    searchable && searchText
      ? (options || []).find((opt) =>
          opt.label.toLowerCase().startsWith(searchText.toLowerCase())
        )
      : null;

  const suggestion =
    firstMatch && searchText
      ? firstMatch.label.slice(searchText.length)
      : "";

  return (
    <div
      className={`flex flex-col relative ${containerClasses}`}
      ref={dropdownRef}
    >
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
          bg-white ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:border-orange-500"
          } 
          focus:outline-none transition-colors ${
            errorMessage ? "border-red-500" : ""
          } ${cssClasses}`}
        disabled={disabled}
      >
        <span
          className={`${
            selectedOption ? "text-gray-800" : "text-gray-400"
          } text-[14px]`}
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
            <div className="relative">
              {/* Ghost autocomplete */}
              <div className="absolute top-0 left-0 w-full p-2 text-gray-400 pointer-events-none">
                {searchText}
                <span className="text-gray-300">{suggestion}</span>
              </div>

              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full p-2 border-b border-gray-200 focus:outline-none bg-transparent relative"
              />
            </div>
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
