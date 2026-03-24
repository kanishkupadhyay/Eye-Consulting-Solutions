"use client";

import { useState } from "react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import createUser from "@/services/frontend/register";

export default function RegisterForm({
  isRegisteredSuccessfully,
}: {
  isRegisteredSuccessfully: (status: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [enableErrors, setEnableErrors] = useState(false);

  const [errorConfig, setErrorConfig] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEnableErrors(true);

    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await createUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone,
      );

      if (response.success) {
        isRegisteredSuccessfully(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: typeof errorConfig = {};

    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone) {
      errors.phone = "Phone number is required";
    }

    setErrorConfig(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        errorMessage={
          enableErrors && errorConfig.firstName
            ? errorConfig.firstName
            : ""
        }
        onChange={(e) => {
          setFormData({ ...formData, firstName: e.target.value });
          setErrorConfig((prev) => ({ ...prev, firstName: "" }));
        }}
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) =>
          setFormData({ ...formData, lastName: e.target.value })
        }
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        errorMessage={
          enableErrors && errorConfig.email ? errorConfig.email : ""
        }
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          setErrorConfig((prev) => ({ ...prev, email: "" }));
        }}
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="password"
        placeholder="Password"
        value={formData.password}
        errorMessage={
          enableErrors && errorConfig.password
            ? errorConfig.password
            : ""
        }
        onChange={(e) => {
          setFormData({ ...formData, password: e.target.value });
          setErrorConfig((prev) => ({ ...prev, password: "" }));
        }}
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        errorMessage={
          enableErrors && errorConfig.confirmPassword
            ? errorConfig.confirmPassword
            : ""
        }
        onChange={(e) => {
          setFormData({ ...formData, confirmPassword: e.target.value });
          setErrorConfig((prev) => ({ ...prev, confirmPassword: "" }));
        }}
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="text"
        placeholder="Phone Number"
        value={formData.phone}
        errorMessage={
          enableErrors && errorConfig.phone ? errorConfig.phone : ""
        }
        onChange={(e) => {
          setFormData({ ...formData, phone: e.target.value });
          setErrorConfig((prev) => ({ ...prev, phone: "" }));
        }}
        className="w-full p-3 border rounded-lg"
      />

      <Button loading={isLoading}>Create Account 🚀</Button>
    </form>
  );
}