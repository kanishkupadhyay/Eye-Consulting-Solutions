import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";

interface IAddCandidateParams {
  name: string;
  email: string;
  phone: string;
  age?: number;
  experienceYears?: number;
  experienceMonths?: number;
  skills?: string[];
  keywords?: string[];
  resume: File;
  currentLocation: string;
}

export default async function addCandidate(params: IAddCandidateParams) {
  const token = getTokenFromLocalStorage();

  const url = "/api/resume/upload";

  const formData = new FormData();

  formData.append("resume", params.resume);
  formData.append("name", params.name);
  formData.append("email", params.email);
  formData.append("phone", params.phone);
  formData.append("currentLocation", params.currentLocation);
  if (params.age !== undefined) formData.append("age", params.age.toString());
  if (params.experienceYears !== undefined)
    formData.append("experienceYears", params.experienceYears.toString());
  if (params.experienceMonths !== undefined)
    formData.append("experienceMonths", params.experienceMonths.toString());
  if (params.skills) formData.append("skills", JSON.stringify(params.skills));
  if (params.keywords)
    formData.append("keywords", JSON.stringify(params.keywords));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText: { message: string } = await res.json();
    Notification.error(errorText.message);
    throw new Error(errorText.message);
  }
  Notification.success("Candidate added successfully!");

  return await res.json();
}
