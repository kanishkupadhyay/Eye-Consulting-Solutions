"use client";

import { useState } from "react";
import Button from "../Button/Button";
import EmailInput from "../EmailInput/EmailInput";
import requestOtp from "@/services/frontend/request-otp";
import validateOtp from "@/services/frontend/verify-otp";
import CustomOtpInput from "../OtpInput/OtpInput";
import PasswordInput from "../PasswordInput/PasswordInput";
import { Notification } from "../notification";
import resetPassword from "@/services/frontend/reset-password";

export default function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await requestOtp(email);
      if (response.success) {
        setStep("verify");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await validateOtp(email, otp);
      if (response.success) {
        setResetToken(response.resetPasswordToken);
        setStep("reset");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Notification.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(newPassword, resetToken);
      if (response.success) {
        onBack();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Request OTP */}
      {step === "request" && (
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button loading={loading}>Send OTP</Button>

          <p className="text-sm text-center text-gray-600">
            Remember your password?
            <span
              onClick={onBack}
              className="ml-2 text-orange-500 font-semibold cursor-pointer hover:underline"
            >
              Back to Login
            </span>
          </p>
        </form>
      )}

      {/* Step 2: Verify OTP */}
      {step === "verify" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <p className="text-gray-500 text-sm text-center">
            Enter OTP sent to your email
          </p>

          <CustomOtpInput value={otp} onChange={setOtp} length={6} />

          <Button loading={loading}>Verify OTP</Button>

          <p className="text-sm text-center text-gray-600">
            Didn&apos;t receive OTP?
            <span
              onClick={() => setStep("request")}
              className="ml-2 text-orange-500 font-semibold cursor-pointer hover:underline"
            >
              Resend
            </span>
          </p>
        </form>
      )}

      {/* Step 3: Reset Password */}
      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <PasswordInput
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button loading={loading}>Reset Password</Button>
        </form>
      )}
    </div>
  );
}
