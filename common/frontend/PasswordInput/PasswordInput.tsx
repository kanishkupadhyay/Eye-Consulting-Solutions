"use client";

import { useState } from "react";
import { IPasswordInputProps } from "./PasswordInput.Model";
import Input from "../Input/Input";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  value,
  name,
  onChange,
  placeholder = "Enter your password",
  errorMessage,
  className = "",
  label = "Password",
}: IPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    const trimmedValue = value.trim();

    if (trimmedValue !== value) {
      onChange({
        target: { value: trimmedValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          name={name}
          label={label}
          placeholder={placeholder}
          className={`w-full p-3 border rounded-lg pr-10 ${
            errorMessage ? "border-red-500" : "border-gray-300"
          } ${className}`}
        />

        {/* Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePassword}
          className="absolute right-3 bottom-[3px] -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
        >
          {showPassword ? <Eye /> : <EyeOff />}
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
