import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";

export default async function getUserById(id: string) {
  const token = getTokenFromLocalStorage();
  if (!token) throw new Error("Authorization token not found");

  const url = `/api/users/${id}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText: { message: string } = await res.json();
    Notification.error(errorText.message);
    throw new Error(errorText.message);
  }

  const data = await res.json();
  return data;
}
