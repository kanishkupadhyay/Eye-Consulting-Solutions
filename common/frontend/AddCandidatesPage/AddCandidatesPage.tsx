"use client";

import { useState, useEffect } from "react";
import Input from "../Input/Input";
import PhoneInput from "../PhoneInput/PhoneInput";
import EmailInput from "../EmailInput/EmailInput";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";
import * as mammoth from "mammoth";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import FileUploader from "../FileUploader/FileUploader";

type FileWithPreview = File & { preview?: string };

const AddCandidatesPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    currentLocation: "",
    experienceYears: "",
    experienceMonths: "",
    skills: "",
    keywords: "",
  });

  const [resume, setResume] = useState<FileWithPreview | null>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [error, setError] = useState("");
  const [enableErrors, setEnableErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load DOCX content for preview
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
    setError("");

    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phone.trim()) errors.push("Phone is required");
    if (!resume) errors.push("Resume is required");

    if (
      formData.age &&
      (Number(formData.age) < 18 || Number(formData.age) > 65)
    )
      errors.push("Age must be between 18 and 65");

    const years = Number(formData.experienceYears || 0);
    const months = Number(formData.experienceMonths || 0);
    if (isNaN(years) || years < 0 || years > 50)
      errors.push("Experience years must be between 0 and 50");
    if (isNaN(months) || months < 0 || months > 11)
      errors.push("Experience months must be between 0 and 11");

    setEnableErrors(true);

    if (errors.length) {
      setError(errors.join(", "));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Call API to submit candidate data
      console.log({
        ...formData,
        resume,
        skills: formData.skills.split(",").map((s) => s.trim()),
        keywords: formData.keywords.split(",").map((k) => k.trim()),
      });
      router.push("/candidates"); // redirect after submit
    } catch (err) {
      console.error(err);
      setError("Failed to submit candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">Add Candidate</h1>
      {error && <p className="text-red-500 font-medium">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          errorMessage={
            enableErrors && !formData.name ? "Name is required" : ""
          }
        />

        <EmailInput
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <PhoneInput
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
          error={enableErrors && !formData.phone ? "Phone is required" : ""}
        />

        <Input
          type="number"
          label="Age"
          placeholder="Enter age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        />

        <SelectDropdown
          label="Gender"
          options={["Male", "Female", "Other"]}
          value={formData.gender}
          onChange={(val) => setFormData({ ...formData, gender: val })}
          placeholder="Select Gender"
        />

        <Input
          label="Current Location"
          placeholder="Enter location"
          value={formData.currentLocation}
          onChange={(e) =>
            setFormData({ ...formData, currentLocation: e.target.value })
          }
        />

        {/* Experience split into Years and Months */}
        <div className="flex gap-4">
          <Input
            type="text"
            label="Experience (Years)"
            placeholder="0"
            value={formData.experienceYears}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val === "" || Number(val) <= 50)
                setFormData({ ...formData, experienceYears: val });
            }}
            errorMessage={
              enableErrors &&
              (formData.experienceYears === "" ||
                Number(formData.experienceYears) < 0 ||
                Number(formData.experienceYears) > 50)
                ? "Years must be between 0 and 50"
                : ""
            }
          />

          <Input
            type="text"
            label="Experience (Months)"
            placeholder="0"
            value={formData.experienceMonths}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val === "" || Number(val) <= 11)
                setFormData({ ...formData, experienceMonths: val });
            }}
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

        <Input
          label="Skills (comma separated)"
          placeholder="e.g. JavaScript, React"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
        />

        <Input
          label="Keywords (comma separated)"
          placeholder="e.g. developer, engineer"
          value={formData.keywords}
          onChange={(e) =>
            setFormData({ ...formData, keywords: e.target.value })
          }
        />

        {/* Resume Upload using FileUploader component */}
        <FileUploader onFilesChange={([file]) => setResume(file)} />

        <Button loading={isSubmitting}>Add Candidate</Button>
      </form>

      {/* Preview DOCX content */}
      {resume && resume.name.endsWith(".docx") && (
        <div className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-wrap text-gray-800">
          {resumeContent || "Loading preview..."}
        </div>
      )}
    </div>
  );
};

export default AddCandidatesPage;
