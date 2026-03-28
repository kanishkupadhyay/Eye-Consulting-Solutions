import { IGetCandidatesRequest } from "@/common/backend/candidate.interface";
import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";

export interface IGetCandidatesParams extends IGetCandidatesRequest {
  sort?: { [key: string]: 1 | -1 };
}

export default async function getCandidates(params: IGetCandidatesParams) {
  const token = getTokenFromLocalStorage();
  if (!token) throw new Error("Authorization token not found");

  const url = "/api/candidates";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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