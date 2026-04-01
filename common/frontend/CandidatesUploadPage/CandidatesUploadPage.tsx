"use client";

import { useState, useEffect } from "react";
import FileUploader from "../FileUploader/FileUploader";
import Button from "../Button/Button";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import bulkParseCandidates from "@/services/frontend/bulk-add-cadidates";
import ParsedCandidateCard from "../ParsedCandidateCard/ParsedCandidateCard";
import SidePanel from "../SidePanel/SidePanel";
import Input from "../Input/Input";
import EmailInput from "../EmailInput/EmailInput";
import PhoneInput from "../PhoneInput/PhoneInput";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import InputChips from "../InputChip/InputChip";
import EducationList from "../EducationList/EducationList";
import ExperienceList from "../ExperienceList/ExperienceList";
import { IEducation, IExperience } from "@/models/candidate.model";
import { renderAsync } from "docx-preview";

const CandidatesUploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [education, setEducation] = useState<IEducation[]>([]);
  const [experience, setExperience] = useState<IExperience[]>([]);
  const [enableErrors, setEnableErrors] = useState(false);
  const [educationErrors, setEducationErrors] = useState<any[]>([]);
  const [experienceErrors, setExperienceErrors] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // DOCX preview HTML
  const [docxHtml, setDocxHtml] = useState<string>("");

  // --- Handle Files Change ---
  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  // --- Generate DOCX Preview ---
  useEffect(() => {
    const generateDocxPreviews = async () => {
      if (!selectedCandidate?.file) return;
      const file = selectedCandidate.file;
      if (file.name.endsWith(".docx")) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const container = document.createElement("div");
          await renderAsync(arrayBuffer, container);
          setDocxHtml(container.innerHTML);
        } catch {
          setDocxHtml("<p>Failed to load DOCX preview.</p>");
        }
      } else {
        setDocxHtml("");
      }
    };
    generateDocxPreviews();
  }, [selectedCandidate]);

  const handleParseResumes = async () => {
    if (!files.length) return;

    try {
      setLoading(true);
      const response = await bulkParseCandidates({ resumes: files });
      const enriched = response.data.map((c: any, index: number) => ({
        ...c,
        file: files[index],
        previewUrl: URL.createObjectURL(files[index]),
        gender: c.gender || "",
        skills: c.skills || [],
        education: c.education || [],
        experience: c.experience || [],
      }));
      setParsedCandidates(enriched);
    } catch (error) {
      console.error("Error parsing resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAll = async () => {
    if (!parsedCandidates.length) return;

    try {
      setUploading(true);
      alert("All candidates uploaded successfully!");
      setParsedCandidates([]);
      setFiles([]);
    } catch (error) {
      console.error("Error uploading candidates:", error);
      alert("Failed to upload candidates.");
    } finally {
      setUploading(false);
    }
  };

  const validateCandidate = () => {
    let hasError = false;
    const fErrors: { [key: string]: string } = {};
    if (!selectedCandidate?.name?.trim()) {
      fErrors.name = "Name is required";
      hasError = true;
    }
    if (!selectedCandidate?.email?.trim()) {
      fErrors.email = "Email is required";
      hasError = true;
    }
    if (!selectedCandidate?.phone?.trim()) {
      fErrors.phone = "Phone is required";
      hasError = true;
    }
    if (!selectedCandidate?.skills?.length) {
      fErrors.skills = "At least one skill is required";
      hasError = true;
    }

    const eduErrs: any[] = [];
    education.forEach((edu, i) => {
      const e: any = {};
      if (!edu.degree?.trim()) e.degree = "Degree is required";
      if (!edu.institute?.trim()) e.institute = "Institute is required";
      if (!edu.startYear) e.startYear = "Start Year is required";
      if (!edu.endYear) e.endYear = "End Year is required";
      if (edu.startYear && edu.endYear && edu.startYear > edu.endYear)
        e.endYear = "End Year must be after Start Year";
      if (Object.keys(e).length > 0) hasError = true;
      eduErrs[i] = e;
    });

    let currentJobCount = 0;
    const expErrs: any[] = [];
    experience.forEach((exp, i) => {
      const e: any = {};
      if (!exp.company?.trim()) e.company = "Company is required";
      if (!exp.role?.trim()) e.role = "Role is required";
      if (!exp.startDate) e.startDate = "Start Date is required";

      const start = exp.startDate ? new Date(exp.startDate) : null;
      const end = exp.endDate ? new Date(exp.endDate) : null;

      if (exp.currentlyWorking) {
        currentJobCount++;
        if (exp.endDate) e.endDate = "End date should not be set if currently working";
      } else {
        if (!exp.endDate) e.endDate = "End Date is required";
      }

      if (start && end && start > end) e.endDate = "End Date must be after Start Date";

      if (Object.keys(e).length > 0) hasError = true;
      expErrs[i] = e;
    });
    if (currentJobCount > 1) hasError = true;

    setEnableErrors(true);
    setFieldErrors(fErrors);
    setEducationErrors(eduErrs);
    setExperienceErrors(expErrs);

    return !hasError;
  };

  const handleSaveCandidate = () => {
    if (!selectedCandidate) return;
    if (!validateCandidate()) return;

    const updatedCandidate = {
      ...selectedCandidate,
      education,
      experience,
      previewUrl: selectedCandidate.previewUrl,
    };

    setParsedCandidates((prev) =>
      prev.map((c) => (c.email === selectedCandidate.email ? updatedCandidate : c))
    );

    setSelectedCandidate(null);
  };

  return (
    <section className="p-6">
      <Breadcrumb
        cssClasses="mb-5"
        items={[
          { name: "Candidates", href: "/candidates" },
          { name: "Bulk Upload" },
        ]}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Upload Candidate Resumes</h1>

        {!parsedCandidates.length && (
          <>
            <FileUploader multiple maxFiles={50} onFilesChange={handleFilesChange} />
            <div className="mt-4">
              <Button onClick={handleParseResumes} disabled={!files.length || loading}>
                {loading ? "Parsing..." : "Parse Resumes"}
              </Button>
            </div>
          </>
        )}

        {parsedCandidates.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {parsedCandidates.map((candidate, index) => (
                <ParsedCandidateCard
                  key={index}
                  candidate={candidate}
                  onClick={() => setSelectedCandidate(candidate)}
                />
              ))}
            </div>

            <div className="mt-6">
              <Button onClick={handleUploadAll} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload All"}
              </Button>
            </div>
          </>
        )}

        <SidePanel
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title="Candidate Details"
        >
          {selectedCandidate && (
            <div className="space-y-4">
              <Input
                label="Full Name"
                cssClasses="py-2"
                placeholder="Enter full name"
                required
                value={selectedCandidate.name || ""}
                onChange={(e) =>
                  setSelectedCandidate({ ...selectedCandidate, name: e.target.value })
                }
                errorMessage={enableErrors ? fieldErrors.name : ""}
              />

              <EmailInput
                cssClasses="py-2"
                required
                placeholder="Enter email"
                value={selectedCandidate.email || ""}
                onChange={(e) =>
                  setSelectedCandidate({ ...selectedCandidate, email: e.target.value })
                }
              />

              <PhoneInput
                cssClasses="py-2"
                value={selectedCandidate.phone || ""}
                required
                onChange={(val) =>
                  setSelectedCandidate({ ...selectedCandidate, phone: val })
                }
                error={enableErrors ? fieldErrors.phone : ""}
              />

              <SelectDropdown
                label="Gender"
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]}
                value={selectedCandidate.gender || ""}
                onChange={(val) =>
                  setSelectedCandidate({ ...selectedCandidate, gender: val })
                }
                placeholder="Select Gender"
              />

              <InputChips
                label="Skills"
                value={selectedCandidate.skills || []}
                required
                onChange={(val) =>
                  setSelectedCandidate({ ...selectedCandidate, skills: val })
                }
                placeholder="Type skill and press Enter"
                errorMessage={enableErrors ? fieldErrors.skills : ""}
              />

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

              {/* --- Resume Preview --- */}
              <div className="h-[400px] border rounded overflow-hidden">
                {selectedCandidate.file.name.endsWith(".pdf") && (
                  <iframe
                    src={selectedCandidate.previewUrl}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                )}

                {selectedCandidate.file.name.endsWith(".docx") && (
                  <div
                    className="w-full h-full overflow-auto p-2 bg-gray-50"
                    dangerouslySetInnerHTML={{
                      __html: docxHtml || "Loading preview...",
                    }}
                  />
                )}

                {selectedCandidate.file.name.endsWith(".doc") && (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                      selectedCandidate.previewUrl
                    )}&embedded=true`}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                )}
              </div>

              <div className="mt-4">
                <Button onClick={handleSaveCandidate}>Save Changes</Button>
              </div>
            </div>
          )}
        </SidePanel>
      </div>
    </section>
  );
};

export default CandidatesUploadPage;