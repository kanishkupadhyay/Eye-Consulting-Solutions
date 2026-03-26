"use client";

import React, { useState, useRef, useEffect } from "react";

interface CustomOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export default function CustomOtpInput({
  length = 6,
  value,
  onChange,
}: CustomOtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));

  // Sync controlled value prop with local state
  useEffect(() => {
    if (value.length === length) {
      setOtp(value.split(""));
    }
  }, [value, length]);

  // Focus input at index
  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputsRef.current[index]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[i] = val;
      setOtp(newOtp);
      onChange(newOtp.join(""));

      if (val && i < length - 1) {
        focusInput(i + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace") {
      if (otp[i]) {
        // Clear current input if it has a value
        const newOtp = [...otp];
        newOtp[i] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      } else if (i > 0) {
        // Move focus back and clear previous
        focusInput(i - 1);
        const newOtp = [...otp];
        newOtp[i - 1] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      focusInput(i - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      focusInput(i + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(paste)) {
      const pasteArr = paste.split("");
      const newOtp = [...otp];
      for (let i = 0; i < length; i++) {
        newOtp[i] = pasteArr[i] || "";
      }
      setOtp(newOtp);
      onChange(newOtp.join(""));
      // Focus last filled or last input
      const lastFilledIndex = pasteArr.length >= length ? length - 1 : pasteArr.length;
      focusInput(lastFilledIndex);
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="
            w-[50px] h-14 border border-gray-300 rounded-lg text-center text-lg
            outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition
          "
          ref={(el) => { inputsRef.current[i] = el; }}
          value={otp[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}