import { Notification } from "@/common/frontend/notification";

export default async function requestOtp(email: string) {
  const url = "/api/users/request-otp";
  const requestBody = { email };

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

  const data = await res.json();

  Notification.success(data.message);
  return data;
}
