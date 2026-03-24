"use client";

import React from "react";
import Input from "../Input/Input";
import { IPhoneInputProps } from "./PhoneInput.Model";

export default function PhoneInput({
  value,
  onChange,
  error,
  maxLength = 10,
}: IPhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numericValue = e.target.value.replace(/\D/g, "");
    if (numericValue.length > maxLength) {
      numericValue = numericValue.slice(0, maxLength);
    }
    onChange(numericValue);
  };

  return (
    <Input
      type="text"
      label="Phone Number"
      placeholder="Enter your phone number"
      value={value}
      errorMessage={error}
      onChange={handleChange}
      className={error ? "border-red-500 focus:ring-red-300" : ""}
    />
  );
}
