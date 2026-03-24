import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";

export interface IUpdateUserParams {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  password?: string;
}

export default async function updateUser(params: IUpdateUserParams) {
  const token = getTokenFromLocalStorage();
  const { id, ...payload } = params;

  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
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
    Notification.error(data.message || "Failed to update user");
    throw new Error(data.message || "Failed to update user");
  }

  Notification.success("User updated successfully!");
  return data;
}
