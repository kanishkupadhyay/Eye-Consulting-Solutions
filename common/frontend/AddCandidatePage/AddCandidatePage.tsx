"use client";

import { useState, useEffect } from "react";
import Input from "../Input/Input";
import PhoneInput from "../PhoneInput/PhoneInput";
import EmailInput from "../EmailInput/EmailInput";
import Button from "../Button/Button";
import NumberInput from "../NumberInput/NumberInput";
import { useRouter } from "next/navigation";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import FileUploader from "../FileUploader/FileUploader";
import InputChips from "../InputChip/InputChip";
import addCandidate from "@/services/frontend/add-candidate";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import EducationList from "../EducationList/EducationList";
import ExperienceList from "../ExperienceList/ExperienceList";
import { IEducation, IExperience } from "@/models/candidate.model";
import verifyCandidate from "@/services/frontend/verify-candidate";
import Dialog from "../Dialog/Dialog";
import { useAuth } from "@/context/AuthContext";
import { IStateListResponse } from "@/common/backend/state.interfaces";
import getCitiesByState from "@/services/frontend/get-cities-by-state";
import mammoth from "mammoth";

type FileWithPreview = File & { preview?: string };

const AddCandidatePage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    state: "",
    city: "",
    experienceYears: "1",
    experienceMonths: "0",
    skills: [] as string[],
  });
  const [cities, setCities] = useState<IStateListResponse[]>([]);

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
  const { setCandidateCount, indianStates } = useAuth();

  // --- Dialog states ---
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [pendingCandidateData, setPendingCandidateData] = useState<any>(null);

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

  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }
      try {
        const res = await getCitiesByState(formData.state); // pass state ObjectId
        setCities(res);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, [formData.state]);

  const validateForm = () => {
    const errors: string[] = [];
    const eduErrors: typeof educationErrors = [];
    const expErrors: typeof experienceErrors = [];

    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phone.trim()) errors.push("Phone is required");
    if (!formData.state.trim()) errors.push("State is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!resume) errors.push("Resume is required");
    if (formData.skills.length === 0)
      errors.push("At least one skill is required");

    if (
      formData.age &&
      (Number(formData.age) < 18 || Number(formData.age) > 65)
    )
      errors.push("Age must be between 18 and 65");

    // --- Education validation ---
    if (education.length > 0) {
      education.forEach((edu, index) => {
        const e: (typeof educationErrors)[0] = {};
        const isEmpty =
          !edu.degree?.trim() &&
          !edu.institute?.trim() &&
          !edu.startYear &&
          !edu.endYear;

        if (isEmpty) {
          eduErrors[index] = {};
          return;
        }

        if (!edu.degree?.trim()) e.degree = "Degree is required";
        if (!edu.institute?.trim()) e.institute = "Institute is required";
        if (edu.startYear === undefined || edu.startYear === null)
          e.startYear = "Start Year is required";
        if (edu.endYear === undefined || edu.endYear === null)
          e.endYear = "End Year is required";

        if (
          edu.startYear !== undefined &&
          edu.endYear !== undefined &&
          edu.startYear > edu.endYear
        ) {
          e.endYear = "End Year must be after Start Year";
        }

        eduErrors[index] = e;
      });
    }

    // --- Experience validation ---
    let currentlyWorkingCount = 0;
    if (experience.length > 0) {
      experience.forEach((exp, index) => {
        const e: (typeof experienceErrors)[0] = {};
        const isEmpty =
          !exp.company?.trim() &&
          !exp.role?.trim() &&
          !exp.startDate &&
          !exp.endDate;

        if (isEmpty) {
          expErrors[index] = {};
          return;
        }

        if (!exp.company?.trim()) e.company = "Company is required";
        if (!exp.role?.trim()) e.role = "Role is required";
        if (!exp.startDate) e.startDate = "Start Date is required";

        const start = exp.startDate ? new Date(exp.startDate) : null;
        const end = exp.endDate ? new Date(exp.endDate) : null;

        if (exp.currentlyWorking) {
          currentlyWorkingCount++;
          if (exp.endDate)
            e.endDate = "End date should not be set if currently working";
        } else {
          if (!exp.endDate) e.endDate = "End Date is required";
        }

        if (start && end && start > end)
          e.endDate = "End Date must be after Start Date";

        expErrors[index] = e;
      });
    }

    if (currentlyWorkingCount > 1) {
      alert("Only one experience can be marked as your current job");
      return false;
    }

    setEnableErrors(true);
    setEducationErrors(eduErrors);
    setExperienceErrors(expErrors);

    return (
      errors.length === 0 &&
      eduErrors.every((e) => Object.keys(e).length === 0) &&
      expErrors.every((e) => Object.keys(e).length === 0) &&
      resume !== null
    );
  };

  // --- Submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const candidateData = {
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
      education,
      experience,
      resume: resume as File,
      state: formData.state,
      city: formData.city,
      gender: formData.gender,
    };

    try {
      // --- Verify candidate ---
      const verifyResult = await verifyCandidate({
        email: formData.email,
        phone: formData.phone,
      });

      if (verifyResult.exists) {
        setVerifyMessage(verifyResult.message);
        setPendingCandidateData(candidateData);
        setIsOverrideDialogOpen(true);
      } else {
        await addCandidate(candidateData);
        setCandidateCount();
        router.push("/candidates");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Override confirm ---
  const handleOverrideConfirm = async () => {
    if (!pendingCandidateData) return;

    setIsSubmitting(true);
    try {
      await addCandidate(pendingCandidateData);
      setIsOverrideDialogOpen(false);
      router.push("/candidates");
    } catch (err: any) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              cssClasses="py-2"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              errorMessage={
                enableErrors && !formData.name ? "Name is required" : ""
              }
            />
            <EmailInput
              cssClasses="py-2"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <PhoneInput
              value={formData.phone}
              cssClasses="py-2"
              required
              onChange={(value) => setFormData({ ...formData, phone: value })}
              error={
                enableErrors && !formData.phone
                  ? "Phone is required"
                  : formData.phone.length && formData.phone.length < 10
                    ? "Phone must be at least 10 digits"
                    : ""
              }
            />
            <SelectDropdown
              label="Age"
              options={Array.from({ length: 48 }, (_, i) => {
                const age = i + 18;
                return { label: age.toString(), value: age.toString() };
              })}
              value={formData.age}
              onChange={(val) => setFormData({ ...formData, age: val })}
              placeholder="Select Age"
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
            <SelectDropdown
              label="State"
              required={true}
              searchable={true}
              errorMessage={
                enableErrors && !formData.state ? "State is required" : ""
              }
              options={indianStates?.map((state) => ({
                label: state.name,
                value: state.id,
              }))}
              value={formData.state}
              onChange={(val) => {
                setFormData({ ...formData, state: val, city: "" }); // reset city
              }}
              placeholder="Select State"
            />
            {formData.state && (
              <SelectDropdown
                label="City"
                required={true}
                searchable={true}
                errorMessage={
                  enableErrors && !formData.city ? "City is required" : ""
                }
                options={cities?.map((city) => ({
                  label: city.name,
                  value: city.id,
                }))}
                value={formData.city}
                onChange={(val) => setFormData({ ...formData, city: val })}
                placeholder={
                  formData.state ? "Select City" : "Select State first"
                }
                disabled={!formData.state} // disable until state selected
              />
            )}

            {/* Experience (Years) */}

            <SelectDropdown
              label="Experience (Years)"
              options={Array.from({ length: 48 }, (_, i) => {
                const experience = i + 0;
                return {
                  label: experience.toString(),
                  value: experience.toString(),
                };
              })}
              value={formData.experienceYears}
              onChange={(val) =>
                setFormData({ ...formData, experienceYears: val })
              }
              placeholder="Select Experience (Years)"
              errorMessage={
                enableErrors &&
                formData.experienceYears !== "" &&
                (Number(formData.experienceYears) < 0 ||
                  Number(formData.experienceYears) > 47)
                  ? "Experience must be between 0 and 47 years"
                  : ""
              }
            />

            {/* Experience (Months) */}

            <SelectDropdown
              label="Experience (Months)"
              options={Array.from({ length: 12 }, (_, i) => {
                const experience = i + 0;
                return {
                  label: experience.toString(),
                  value: experience.toString(),
                };
              })}
              value={formData.experienceMonths}
              onChange={(val) =>
                setFormData({ ...formData, experienceMonths: val })
              }
              placeholder="Select Experience (Months)"
              errorMessage={
                enableErrors &&
                formData.experienceMonths !== "" &&
                (Number(formData.experienceMonths) < 0 ||
                  Number(formData.experienceMonths) > 11)
                  ? "Experience must be between 0 and 11 months"
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

          {/* Skills */}
          <InputChips
            label="Skills"
            required
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

          <FileUploader
            maxFiles={1}
            onFilesChange={([file]) => setResume(file)}
            errorMessage={enableErrors && !resume ? "Resume is required" : ""}
          />

          <Button loading={isSubmitting}>Add Candidate</Button>
        </form>
      </div>

      {/* --- Override Dialog --- */}
      <Dialog
        isOpen={isOverrideDialogOpen}
        onCancel={() => setIsOverrideDialogOpen(false)}
        onConfirm={handleOverrideConfirm}
        title="Candidate Already Exists"
        confirmText="Override"
        cancelText="Cancel"
        loading={isSubmitting}
      >
        <p>{verifyMessage}</p>
        <p className="mt-2 text-gray-500">
          Do you want to override and add the candidate anyway?
        </p>
      </Dialog>
    </section>
  );
};

export default AddCandidatePage;
