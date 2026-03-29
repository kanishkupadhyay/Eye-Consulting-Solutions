import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";

export default async function bulkParseCandidates(params: { resumes: File[] }) {
  const token = getTokenFromLocalStorage();

  const url = "/api/resume/bulk";

  const formData = new FormData();

  // Append multiple files
  params.resumes.forEach((file) => {
    formData.append("resumes", file);
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    Notification.error(data.message || "Failed to parse resumes");
    throw new Error(data.message);
  }

  // Updated message (no DB save happening)
  Notification.success("Resumes parsed successfully!");

  return data; // contains parsed candidate info
}