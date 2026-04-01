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
  keywords?: string[];
  resume: File;
  currentLocation: string;
  education: IEducation[];
  gender?: string;
}

export default async function addCandidatesBulk(candidates: IAddCandidateParams[]) {
  const token = getTokenFromLocalStorage();
  const url = "/api/resume/bulk";

  const formData = new FormData();

  // Prepare JSON array for metadata
  const candidatesMetadata = candidates.map((c, index) => {
    return {
      ...c,
      education: c.education.map(e => ({
        ...e,
        startYear: Number(e.startYear),
        endYear: Number(e.endYear),
      })),
      experience: c.experience.map(exp => ({
        ...exp,
        startDate: new Date(exp.startDate).toISOString(),
        endDate: exp.currentlyWorking
          ? null
          : exp.endDate
          ? new Date(exp.endDate).toISOString()
          : null,
      })),
      // This is the key the backend will look for
      resumeFile: `resumeFile-${index}`,
    };
  });

  // Append JSON array as a string
  formData.append("resumes", JSON.stringify(candidatesMetadata));

  // Append each resume file with a key backend expects
  candidates.forEach((c, index) => {
    const cleanFile = new File(
      [c.resume],
      c.resume.name.replace(/[^\w.\-]/g, "_"),
      { type: c.resume.type }
    );
    formData.append(`resumeFile-${index}`, cleanFile);
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const errorText: { message: string } = await res.json();
      Notification.error(errorText.message);
      throw new Error(errorText.message);
    }

    Notification.success("All candidates uploaded successfully!");
    return await res.json();
  } catch (error: any) {
    console.error("Bulk Candidate Upload Error:", error);
    throw error;
  }
}