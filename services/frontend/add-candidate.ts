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
  currentLocation: string;
  education: IEducation[];
  gender?: string;
}

export default async function addCandidate(params: IAddCandidateParams) {
  const token = getTokenFromLocalStorage();
  const url = "/api/resume/upload";

  const formData = new FormData();

  // 🔹 Clean file name to avoid illegal characters
  const cleanFile = new File(
    [params.resume],
    params.resume.name.replace(/[^\w.\-]/g, "_"),
    { type: params.resume.type },
  );
  formData.append("resume", cleanFile);

  formData.append("name", params.name.trim());
  formData.append("email", params.email.trim());
  formData.append("phone", params.phone.trim());
  formData.append("currentLocation", params.currentLocation.trim());

  if (params.age !== undefined) formData.append("age", params.age.toString());
  if (params.experienceYears !== undefined)
    formData.append("experienceYears", params.experienceYears.toString());
  if (params.experienceMonths !== undefined)
    formData.append("experienceMonths", params.experienceMonths.toString());
  if (params.skills) formData.append("skills", JSON.stringify(params.skills));
  if (params.gender) formData.append("gender", params.gender);

  // 🔹 Ensure education years are numbers
  const cleanEducation = params.education.map((edu) => ({
    ...edu,
    startYear: Number(edu.startYear),
    endYear: Number(edu.endYear),
    degree: edu.degree.trim(),
    institute: edu.institute.trim(),
    fieldOfStudy: edu.fieldOfStudy?.trim() || "",
    grade: edu.grade?.trim() || "",
  }));
  formData.append("education", JSON.stringify(cleanEducation));

  // 🔹 Ensure experience dates are ISO strings and required fields are trimmed
  const cleanExperience = params.experience.map((exp) => ({
    company: exp.company.trim(),
    role: exp.role.trim(),
    startDate: new Date(exp.startDate).toISOString(),
    endDate: exp.currentlyWorking
      ? null
      : exp.endDate
        ? new Date(exp.endDate).toISOString()
        : null,
    currentlyWorking: !!exp.currentlyWorking,
    description: exp.description?.trim() || "",
  }));

  formData.append("experience", JSON.stringify(cleanExperience));

  try {
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
  } catch (error: any) {
    console.error("Add Candidate Error:", error);
    throw error;
  }
}
