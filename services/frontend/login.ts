import { Notification } from "@/common/frontend/notification";

export default async function loginUser(email: string, password: string) {
  const url = '/api/users/login';
  const requestBody = { email, password };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText: { message: string } = await res.json();
    Notification.error(errorText.message);
    throw new Error(errorText.message);
  }

  Notification.success("Logged in Successfully!!");
  return res.json();
}
