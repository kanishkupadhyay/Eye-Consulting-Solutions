import { Notification } from "@/common/frontend/notification";

export default async function deleteUser(userId: string) {
  const res = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!res.ok) {
    const errorText: { message: string } = await res.json();
    Notification.error(
      errorText.message || "Something went wrong while updating user",
    );
    throw new Error(errorText.message);
  }

  const data = await res.json();

  if (!data.success) {
    Notification.error(data.message || "Failed to delete user");
    throw new Error(data.message || "Failed to delete user");
  }

  Notification.success("User delete successfully!");
  return data;
}
