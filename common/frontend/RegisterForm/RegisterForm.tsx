"use client";

import { useState } from "react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import createUser from "@/services/frontend/register";
import PasswordInput from "../PasswordInput/PasswordInput";
import PhoneInput from "../PhoneInput/PhoneInput";

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

    if (!errors.password?.length && formData.password.length < 8) {
      errors.password = "Password length must be at least 8 characters";
    }

    if (
      !errors.confirmPassword?.length &&
      formData.confirmPassword.length < 8
    ) {
      errors.confirmPassword = "Passwords do not match";
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

    if (formData.phone.length && formData.phone.length < 10) {
      errors.phone = "Phone number must be at least 10 digits";
    }

    setErrorConfig(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        type="text"
        label="First Name"
        placeholder="Enter first name"
        value={formData.firstName}
        errorMessage={
          enableErrors && errorConfig.firstName ? errorConfig.firstName : ""
        }
        onChange={(e) => {
          setFormData({ ...formData, firstName: e.target.value });
          setErrorConfig((prev) => ({ ...prev, firstName: "" }));
        }}
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="text"
        label="Last Name"
        placeholder="Enter last name"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        className="w-full p-3 border rounded-lg"
      />

      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
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
      <PasswordInput
        value={formData.password}
        onChange={(e) => {
          setFormData({ ...formData, password: e.target.value });
          setErrorConfig((prev) => ({ ...prev, password: "" }));
        }}
        errorMessage={
          enableErrors && errorConfig.password ? errorConfig.password : ""
        }
        placeholder="Enter your password"
        className="w-full p-3 border rounded-lg"
      />
      <PasswordInput
        value={formData.confirmPassword}
        label="Confirm Password"
        onChange={(e) => {
          setFormData({ ...formData, confirmPassword: e.target.value });
          setErrorConfig((prev) => ({ ...prev, confirmPassword: "" }));
        }}
        errorMessage={
          enableErrors && errorConfig.confirmPassword
            ? errorConfig.confirmPassword
            : ""
        }
        placeholder="Confirm your password"
        className="w-full p-3 border rounded-lg"
      />

      <PhoneInput
        value={formData.phone}
        onChange={(value) => setFormData({ ...formData, phone: value })}
        error={enableErrors ? errorConfig.phone : ""}
      />

      <Button loading={isLoading}>Create Account 🚀</Button>
    </form>
  );
}
