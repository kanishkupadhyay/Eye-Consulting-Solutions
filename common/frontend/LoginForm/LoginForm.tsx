"use client";

import { useState } from "react";
import Input from "../Input/Input";
import EmailInput from "../EmailInput/EmailInput";
import loginUser from "@/services/frontend/login";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";

export default function LoginForm() {
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
    if (!isValid) return; // ⛔ stop here if invalid

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
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = "Email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (formData.password.length < 8) {
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

      <Input
        type="password"
        errorMessage={
          enableErrors && errorConfig.password ? errorConfig.password : ""
        }
        placeholder="Enter your password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full p-3 border rounded-lg"
      />
      <Button loading={isLoading}>Sign In →</Button>
    </form>
  );
}
