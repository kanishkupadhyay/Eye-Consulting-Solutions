import { Notification } from "@/common/frontend/notification";

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export default async function getUsers(params: GetUsersParams) {
  const url = "/api/users";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText: { message: string } = await res.json();
    Notification.error(errorText.message);
    throw new Error(errorText.message);
  }

  const data = await res.json();

  return data;
}