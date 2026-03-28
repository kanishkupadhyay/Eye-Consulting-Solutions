"use client";

import React, { useState } from "react";
import { IInputChipsProps } from "./InputChip.Model";

const InputChips: React.FC<IInputChipsProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  errorMessage,
  cssClasses = "",
}) => {
  const [input, setInput] = useState("");

  const addChip = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;

    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeChip = (chip: string) => {
    onChange(value.filter((c) => c !== chip));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(input);
    }

    if (e.key === "Backspace" && !input) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-500 mb-1">
          {label}
        </label>
      )}

      {/* ✅ SAME Input UI */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full bg-white border border-gray-200 rounded-lg p-4 text-sm
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
          errorMessage ? "border-red-500" : ""
        } ${cssClasses}`}
      />

      {/* ✅ Chips BELOW input */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((chip) => (
            <span
              key={chip}
              className="flex items-center border gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs"
            >
              {chip}
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="text-orange-500 hover:text-orange-700"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputChips;