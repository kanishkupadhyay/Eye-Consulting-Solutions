import { Notification } from "@/common/frontend/notification";

export default async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
) {
  const url = "/api/users/register";
  const requestBody = { email, password, firstName, lastName, phone };

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

  Notification.success("User created Successfully!!");
  return res.json();
}
