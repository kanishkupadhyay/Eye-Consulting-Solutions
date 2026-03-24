import React from "react";
import { IInputProps } from "./Input.Model";

const Input = ({ label, value, onChange, onBlur, ...props }: IInputProps) => {
  // Regex to remove emojis using Unicode property escapes
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(emojiRegex, "");

    if (onChange) {
      onChange({
        ...e,
        target: { ...e.target, value: sanitizedValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const trimmedValue = e.target.value.trim();

    if (onChange) {
      onChange({
        ...e,
        target: { ...e.target, value: trimmedValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div>
      {label && <label className="block text-sm text-gray-500 mb-1">{label}</label>}

      <input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${
          props.errorMessage ? "border-red-500" : ""
        } w-full bg-white border border-gray-200 rounded-lg p-4 text-sm
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
            props.className || ""
          }`}
      />

      {props.errorMessage && (
        <p className="text-red-500 text-xs mt-1">{props.errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
