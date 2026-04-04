"use client";

import React, { useState } from "react";
import Input from "../Input/Input";
import { IPhoneInputProps } from "./PhoneInput.Model";

export default function PhoneInput({
  value = "",
  onChange,
  error,
  maxLength = 10,
  cssClasses = "",
  required = false,
  hasWarning = false,
}: IPhoneInputProps) {
  const [internalValue, setInternalValue] = useState("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numericValue = e.target.value.replace(/\D/g, "");
    if (numericValue.length > maxLength) numericValue = numericValue.slice(0, maxLength);
    setInternalValue(numericValue);
    onChange(numericValue);
  };

  // Compute display value: prefer parent value cleaned, fallback to internal typing
  const displayValue = value
    ? value.replace(/\D/g, "").slice(0, maxLength)
    : internalValue;

  return (
    <Input
      type="text"
      label="Phone Number"
      placeholder="Enter your phone number"
      value={displayValue}
      required={required}
      errorMessage={error}
      cssClasses={cssClasses}
      hasWarning={hasWarning}
      onChange={handleChange}
      className={error ? "border-red-500 focus:ring-red-300" : ""}
    />
  );
}
