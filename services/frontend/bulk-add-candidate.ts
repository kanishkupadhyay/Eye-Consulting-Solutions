import { Notification } from "@/common/frontend/notification";
import { getTokenFromLocalStorage } from "@/common/frontend/utils";
import { IEducation, IExperience } from "@/models/candidate.model";

interface IAddCandidateParams {
  name: string;
  email: string;
  phone: string;
  age?: number;
  experienceYears?: number;
  experienceMonths?: number;
  experience: IExperience[];
  skills?: string[];
  resume: File;
  state: string;
  city: string;
  education: IEducation[];
  gender?: string;
}

export default async function addCandidatesBulk(
  candidates: IAddCandidateParams[]
) {
  const token = getTokenFromLocalStorage();
  const url = "/api/resume/bulk";

  const formData = new FormData();

  const metadata = candidates.map((c) => ({
    name: c.name,
    email: c.email,
    phone: c.phone,
    age: c.age,
    experienceYears: c.experienceYears,
    experienceMonths: c.experienceMonths,
    skills: c.skills,
    state: c.state,
    city: c.city,
    gender: c.gender,
    education: c.education.map((e) => ({
      ...e,
      startYear: Number(e.startYear),
      endYear: Number(e.endYear),
    })),
    experience: c.experience.map((exp) => ({
      ...exp,
      startDate: new Date(exp.startDate).toISOString(),
      endDate: exp.currentlyWorking
        ? null
        : exp.endDate
        ? new Date(exp.endDate).toISOString()
        : null,
    })),
  }));

  formData.append("resumes", JSON.stringify(metadata));

  // ✅ ALL FILES SAME KEY
  candidates.forEach((c) => {
    formData.append("files", c.resume);
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    Notification.success("All candidates uploaded successfully!");
    return data;
  } catch (error: any) {
    console.error("Bulk Candidate Upload Error:", error);
    Notification.error(error.message || "Something went wrong");
    throw error;
  }
}