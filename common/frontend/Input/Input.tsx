"use client";
import React from "react";
import { IInputProps } from "./Input.Model";

interface IExtendedInputProps extends IInputProps {
  multiline?: boolean;
}

const Input = ({
  label,
  cssClasses = "",
  value,
  required = false,
  hasWarning = false,
  multiline = false,
  onChange,
  onBlur,
  ...props
}: IExtendedInputProps) => {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;

  // Use a union type for ChangeEvent
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) onChange(e as any); // cast to any to bypass strict typing
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const trimmedValue = e.target.value.trim().replace(emojiRegex, "");
    if (onChange) {
      onChange({
        ...e,
        target: { ...e.target, value: trimmedValue },
      } as any);
    }

    if (onBlur) {
      onBlur(e as any);
    }
  };

  const baseClasses = `${cssClasses} ${
    props.errorMessage
      ? "border-red-500"
      : hasWarning
        ? "border-yellow-500"
        : ""
  } w-full bg-white border border-gray-200 rounded-lg p-4 text-sm
     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
       props.className || ""
     }`;

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-500 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {multiline ? (
        <textarea
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={baseClasses}
        />
      ) : (
        <input
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={baseClasses}
        />
      )}

      {props.errorMessage && (
        <p className="text-red-500 text-xs mt-1">{props.errorMessage}</p>
      )}
    </div>
  );
};

export default Input;