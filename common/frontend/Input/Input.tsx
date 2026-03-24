import React from "react";
import { IInputProps } from "./Input.Model";

const Input = ({ label, onBlur, ...props }: IInputProps) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Trim whitespace
    const trimmedValue = e.target.value.trim();
    e.target.value = trimmedValue;

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-500 mb-1">{label}</label>
      )}

      <input
        {...props}
        onBlur={handleBlur}
        className={`${props.errorMessage ? "border-red-500" : ""} w-full bg-white border border-gray-200 rounded-lg p-4 text-sm 
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
        shadow-sm ${props.className || ""}`}
      />

      {props.errorMessage && (
        <p className="text-red-500 text-xs mt-1">{props.errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
