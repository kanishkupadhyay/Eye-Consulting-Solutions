"use client";

import { useState } from "react";
import Input from "../Input/Input";
import { IEmailInputProps } from "./EmailInput.Model";

export default function EmailInput({
  value,
  onChange,
  cssClasses = "",
  required = false,
  placeholder = "Enter your email",
}: IEmailInputProps) {
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!val && required) {
      setError("Email is required");
    } else if (val && !validateEmail(val)) {
      setError("Invalid email format");
    } else {
      setError("");
    }
  };

  return (
    <div>
      <Input
        label="Email address"
        type="email"
        placeholder={placeholder}
        value={value}
        cssClasses={cssClasses}
        errorMessage={error}
        onChange={(e) => {
          onChange(e);
          if (error) setError("");
        }}
        onBlur={handleBlur}
        className={error ? "border-red-500 focus:ring-red-300" : ""}
        required={required}
      />
    </div>
  );
}
