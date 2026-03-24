"use client";

import { useState } from "react";
import Input from "../Input/Input";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export default function EmailInput({
  value,
  onChange,
  required = false,
}: Props) {
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
        placeholder="Enter your email"
        value={value}
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