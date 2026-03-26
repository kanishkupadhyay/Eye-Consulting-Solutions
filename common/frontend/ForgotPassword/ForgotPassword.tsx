"use client";

import { useState } from "react";
import Button from "../Button/Button";

export default function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    alert("Reset link sent!");
  };

  return (
    <div className="space-y-5">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-3 border rounded-lg"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button onClick={handleSubmit} loading={loading}>
        Send Otp
      </Button>

      <p className="text-sm text-center text-gray-600">
        Remember your password?
        <span
          onClick={onBack}
          className="ml-2 text-orange-500 font-semibold cursor-pointer hover:underline"
        >
          Back to Login
        </span>
      </p>
    </div>
  );
}
