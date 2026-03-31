import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";

export default async function verifyCandidate(params: {
  email: string;
  phone: string;
}) {
  const token = getTokenFromLocalStorage();

  const url = "/api/resume/verify-candidate";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok && res.status !== 409) {
    const errorText: { message: string } = await res.json();
    Notification.error(errorText.message);
    throw new Error(errorText.message);
  }

  const data = await res.json();

  return { data, exists: res.status === 409, message: data.message };
}
