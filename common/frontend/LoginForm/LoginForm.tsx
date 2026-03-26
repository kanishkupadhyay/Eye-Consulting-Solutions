"use client";

import { useState } from "react";
import EmailInput from "../EmailInput/EmailInput";
import loginUser from "@/services/frontend/login";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import PasswordInput from "../PasswordInput/PasswordInput";

type LoginFormProps = {
  onForgotPassword: () => void;
};

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [enableErrors, setEnableErrors] = useState<boolean>(false);
  const [errorConfig, setErrorConfig] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEnableErrors(true);

    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await loginUser(formData.email, formData.password);

      localStorage.setItem("authToken", response?.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response?.data?.user));

      const isAdmin = response?.data?.user?.isAdmin;
      window.dispatchEvent(new Event("authChange"));

      router.push(isAdmin ? "/dashboard" : "/");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    setFormData((prev) => ({
      ...prev,
      email: prev.email.trim(),
      password: prev.password.trim(),
    }));

    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = "Email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (!errors.password?.length && formData.password.length < 8) {
      errors.password = "Password length must be at least 8 characters";
    }

    setErrorConfig(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <EmailInput
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <div>
        <PasswordInput
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          errorMessage={
            enableErrors && errorConfig.password ? errorConfig.password : ""
          }
          placeholder="Enter your password"
          className="w-full p-3 border rounded-lg"
        />

        <div className="text-right mt-2">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:underline hover:text-blue-700 transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </div>

      <Button loading={isLoading}>Sign In →</Button>
    </form>
  );
}
