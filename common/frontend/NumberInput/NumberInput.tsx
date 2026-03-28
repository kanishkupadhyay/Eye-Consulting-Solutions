"use client";

import React from "react";
import { NumberInputProps } from "./NumberInput.Model";

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  min,
  max,
  cssClasses = "",
  errorMessage = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // allow only digits

    if (val !== "") {
      const num = Number(val);

      if (min !== undefined && num < min) return;
      if (max !== undefined && num > max) return;
    }

    onChange(val);
  };

  return (
    <div className="flex flex-col w-full">
      <label className="block text-sm text-gray-500 mb-1">{label}</label>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${cssClasses} ${
          errorMessage ? "border-red-500" : ""
        } w-full bg-white border border-gray-200 rounded-lg p-4 text-sm
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
          cssClasses || ""
        }`}
      />

      {errorMessage && (
        <span className="text-red-500 text-sm mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default NumberInput;
