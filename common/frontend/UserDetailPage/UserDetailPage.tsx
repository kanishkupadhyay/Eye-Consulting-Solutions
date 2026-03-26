"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/common/frontend/Input/Input";
import Button from "../Button/Button";
import { ArrowLeft, UserX } from "lucide-react";
import Dialog from "../Dialog/Dialog";
import updateUser from "@/services/frontend/update-users";
import deleteUser from "@/services/frontend/delete-user";
import { formatDateNumeric } from "../utils";
import getUserById from "@/services/frontend/get-user";
import PasswordInput from "../PasswordInput/PasswordInput";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  lastLogin?: string;
};

const NotFound = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-gray-600">User not found</p>
      <Button onClick={() => (window.location.href = "/dashboard")}>
        Go Back
      </Button>
    </div>
  </div>
);

const UserDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [enableErrors, setEnableErrors] = useState(false);
  const [errorConfig, setErrorConfig] = useState<{
    firstName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});

  const getError = (field: keyof typeof errorConfig) => {
    if (!enableErrors) return "";
    return errorConfig[field] || "";
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getUserById(id as string);

        if (!data || data.status === 404) {
          setForm(null);
        } else if (data.success) {
          setForm({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
            password: "",
            lastLogin: data.data.lastLogin,
          });
        }
      } catch (err) {
        console.error(err);
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm((prev) => prev && { ...prev, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors: {
      firstName?: string;
      email?: string;
      phone?: string;
      password?: string;
    } = {};
    if (!form?.firstName) errors.firstName = "First name is required";
    if (!form?.email) errors.email = "Email is required";
    if (!form?.phone) errors.phone = "Phone is required";
    if (form?.password && form.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    setErrorConfig(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    setEnableErrors(true);
    if (!validateForm() || !form || !id) return;

    try {
      setUpdating(true);
      await updateUser({
        id: id as string,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        password: form.password,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setUpdating(true);
      await deleteUser(id as string);
      setShowDeleteModal(false);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!form) return <NotFound />;

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <button
            className="flex items-center justify-center gap-[2px] text-gray-800 hover:text-orange-500 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" stroke="currentColor" /> Back
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Edit User</h1>
          <span className="text-xs text-gray-400">User ID: {id}</span>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              errorMessage={getError("firstName")}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              value={form.email}
              disabled
              className="bg-gray-100 cursor-not-allowed"
              errorMessage={getError("email")}
            />
            <div className="flex flex-col justify-center">
              <label className="text-sm font-medium text-gray-700">
                Last Login
              </label>
              <p className="mt-1 text-[#156eb7]">
                {form.lastLogin ? formatDateNumeric(form.lastLogin) : "Never"}
              </p>
            </div>
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              errorMessage={getError("phone")}
            />
            <PasswordInput
              label="New Password"
              value={form.password || ""}
              name="password"
              errorMessage={getError("password")}
              onChange={handleChange}
              placeholder="Leave blank to keep unchanged"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-gray-100 gap-[4px]">
            <Button
              onClick={() => setShowDeleteModal(true)}
              disabled={updating}
              className="bg-red-500 hover:bg-red-600 !w-auto text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserX className="w-4 h-4" /> Delete
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating}
              loading={updating}
              className="bg-orange-500 hover:bg-orange-600 !w-auto text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update User
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        confirmText="Delete"
        cancelText="Cancel"
        loading={updating}
      >
        <p className="text-gray-600">
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
      </Dialog>
    </div>
  );
};

export default UserDetailPage;
