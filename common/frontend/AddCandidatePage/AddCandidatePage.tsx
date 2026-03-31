"use client";

import { useState, useEffect } from "react";
import Input from "../Input/Input";
import PhoneInput from "../PhoneInput/PhoneInput";
import EmailInput from "../EmailInput/EmailInput";
import Button from "../Button/Button";
import NumberInput from "../NumberInput/NumberInput";
import { useRouter } from "next/navigation";
import * as mammoth from "mammoth";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import FileUploader from "../FileUploader/FileUploader";
import InputChips from "../InputChip/InputChip";
import addCandidate from "@/services/frontend/add-candidate";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import EducationList from "../EducationList/EducationList";
import ExperienceList from "../ExperienceList/ExperienceList";
import { IEducation, IExperience } from "@/models/candidate.model";

type FileWithPreview = File & { preview?: string };

const AddCandidatePage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    currentLocation: "",
    experienceYears: "1",
    experienceMonths: "0",
    skills: [] as string[],
    keywords: [] as string[],
  });

  const [education, setEducation] = useState<IEducation[]>([]);
  const [educationErrors, setEducationErrors] = useState<
    {
      degree?: string;
      institute?: string;
      startYear?: string;
      endYear?: string;
    }[]
  >([]);

  const [experience, setExperience] = useState<IExperience[]>([]);
  const [experienceErrors, setExperienceErrors] = useState<
    { company?: string; role?: string; startDate?: string; endDate?: string }[]
  >([]);

  const [resume, setResume] = useState<FileWithPreview | null>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [enableErrors, setEnableErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDocx = async (file: FileWithPreview) => {
      if (file.name?.endsWith(".docx")) {
        const reader = new FileReader();
        reader.onload = async () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setResumeContent(result.value);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setResumeContent("");
      }
    };

    if (resume) loadDocx(resume);
  }, [resume]);

  const validateForm = () => {
    const errors: string[] = [];
    const eduErrors: typeof educationErrors = [];
    const expErrors: typeof experienceErrors = [];

    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phone.trim()) errors.push("Phone is required");
    if (!formData.currentLocation.trim())
      errors.push("Current location is required");
    if (!resume) errors.push("Resume is required");
    if (formData.skills.length === 0)
      errors.push("At least one skill is required");

    if (
      formData.age &&
      (Number(formData.age) < 18 || Number(formData.age) > 65)
    )
      errors.push("Age must be between 18 and 65");

    // Education validation
    if (education.length === 0) {
      errors.push("At least one education entry is required");
    }
    education.forEach((edu, index) => {
      const e: (typeof educationErrors)[0] = {};
      if (!edu.degree.trim()) e.degree = "Degree is required";
      if (!edu.institute.trim()) e.institute = "Institute is required";
      if (edu.startYear === undefined || edu.startYear === null)
        e.startYear = "Start Year is required";
      if (edu.endYear === undefined || edu.endYear === null)
        e.endYear = "End Year is required";
      if (
        edu.startYear !== undefined &&
        edu.endYear !== undefined &&
        edu.startYear > edu.endYear
      )
        e.endYear = "End Year must be after Start Year";
      eduErrors[index] = e;
    });

    // Experience validation
    if (experience.length === 0) {
      errors.push("At least one experience entry is required");
    }
    experience.forEach((exp, index) => {
      const e: (typeof experienceErrors)[0] = {};
      if (!exp.company.trim()) e.company = "Company is required";
      if (!exp.role.trim()) e.role = "Role is required";
      if (!exp.startDate) e.startDate = "Start Date is required";
      if (exp.startDate && exp.endDate && exp.startDate > exp.endDate)
        e.endDate = "End Date must be after Start Date";
      expErrors[index] = e;
    });

    setEnableErrors(true);
    setEducationErrors(eduErrors);
    setExperienceErrors(expErrors);

    return (
      errors.length === 0 &&
      eduErrors.every((e) => Object.keys(e).length === 0) &&
      expErrors.every((e) => Object.keys(e).length === 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !resume) return;

    setIsSubmitting(true);

    try {
      await addCandidate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        experienceYears: formData.experienceYears
          ? Number(formData.experienceYears)
          : undefined,
        experienceMonths: formData.experienceMonths
          ? Number(formData.experienceMonths)
          : undefined,
        skills: formData.skills,
        keywords: formData.keywords,
        education,
        experience,
        resume: resume,
        currentLocation: formData.currentLocation,
        gender: formData.gender,
      });

      router.push("/candidates");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-6">
      <Breadcrumb
        cssClasses="mb-5"
        items={[
          { name: "Candidates", href: "/candidates" },
          { name: "Add Candidate" },
        ]}
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Add Candidate</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Candidate Info */}
          <Input
            label="Full Name"
            placeholder="Enter full name"
            cssClasses="py-2"
            required={true}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            errorMessage={enableErrors && !formData.name ? "Name is required" : ""}
          />

          <EmailInput
            cssClasses="py-2"
            required={true}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <PhoneInput
            value={formData.phone}
            cssClasses="py-2"
            required={true}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            error={
              enableErrors && !formData.phone
                ? "Phone is required"
                : formData.phone.length && formData.phone.length < 10
                ? "Phone must be at least 10 digits"
                : ""
            }
          />

          <NumberInput
            label="Age"
            placeholder="Enter age"
            cssClasses="py-2"
            value={formData.age}
            onChange={(val) => setFormData({ ...formData, age: val })}
            errorMessage={
              enableErrors &&
              formData.age !== "" &&
              (Number(formData.age) < 18 || Number(formData.age) > 65)
                ? "Age must be between 18 and 65"
                : ""
            }
          />

          <SelectDropdown
            label="Gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
            value={formData.gender}
            onChange={(val) => setFormData({ ...formData, gender: val })}
            placeholder="Select Gender"
          />

          <Input
            label="Current Location"
            required={true}
            placeholder="Enter location"
            cssClasses="py-2"
            errorMessage={
              enableErrors && !formData.currentLocation
                ? "Current location is required"
                : ""
            }
            value={formData.currentLocation}
            onChange={(e) =>
              setFormData({ ...formData, currentLocation: e.target.value })
            }
          />

          <div className="flex gap-4">
            <NumberInput
              label="Experience (Years)"
              placeholder="0"
              cssClasses="py-2"
              value={formData.experienceYears}
              onChange={(val) =>
                setFormData({ ...formData, experienceYears: val })
              }
              errorMessage={
                enableErrors &&
                (formData.experienceYears === "" ||
                  Number(formData.experienceYears) < 0 ||
                  Number(formData.experienceYears) > 50)
                  ? "Years must be between 0 and 50"
                  : ""
              }
            />

            <NumberInput
              label="Experience (Months)"
              placeholder="0"
              cssClasses="py-2"
              value={formData.experienceMonths}
              onChange={(val) =>
                setFormData({ ...formData, experienceMonths: val })
              }
              errorMessage={
                enableErrors &&
                (formData.experienceMonths === "" ||
                  Number(formData.experienceMonths) < 0 ||
                  Number(formData.experienceMonths) > 11)
                  ? "Months must be between 0 and 11"
                  : ""
              }
            />
          </div>

          {/* Education & Experience Sections */}
          <EducationList
            value={education}
            onChange={setEducation}
            errors={enableErrors ? educationErrors : []}
          />
          <ExperienceList
            value={experience}
            onChange={setExperience}
            errors={enableErrors ? experienceErrors : []}
          />

          {/* Skills & Keywords */}
          <InputChips
            label="Skills"
            placeholder="Type and press Enter"
            value={formData.skills}
            errorMessage={
              enableErrors && formData.skills.length === 0
                ? "At least one skill is required"
                : ""
            }
            cssClasses="py-2"
            onChange={(val) => setFormData({ ...formData, skills: val })}
          />

          <InputChips
            label="Keywords"
            cssClasses="py-2"
            placeholder="Type and press Enter"
            value={formData.keywords}
            onChange={(val) => setFormData({ ...formData, keywords: val })}
          />

          <FileUploader
            onFilesChange={([file]) => setResume(file)}
            errorMessage={enableErrors && !resume ? "Resume is required" : ""}
          />

          <Button loading={isSubmitting}>Add Candidate</Button>
        </form>

        {resume && resume.name.endsWith(".docx") && (
          <div className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-wrap text-gray-800">
            {resumeContent || "Loading preview..."}
          </div>
        )}
      </div>
    </section>
  );
};

export default AddCandidatePage;