"use client";

import { useState, useEffect, useCallback } from "react";
import FileUploader from "../FileUploader/FileUploader";
import Button from "../Button/Button";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import bulkParseCandidates from "@/services/frontend/bulk-parse-cadidates";
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
import addCandidatesBulk from "@/services/frontend/bulk-add-candidate";
import { Notification } from "../notification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";

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
  const router = useRouter();
  const { setCandidateCount } = useAuth();

  const [docxHtml, setDocxHtml] = useState<string>("");

  useEffect(() => {
    const generateDocxPreviews = async () => {
      const previews: Record<string, string> = {};
      for (const file of files) {
        if (file.name.endsWith(".docx")) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const container = document.createElement("div");
            await renderAsync(arrayBuffer, container);
            previews[file.name] = container.innerHTML;
          } catch {
            previews[file.name] = "<p>Failed to load preview</p>";
          }
        }
      }
    };
    if (files.length) generateDocxPreviews();
  }, [files]);

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const checkCandidateErrors = (candidate: any) => {
    if (!candidate.name?.trim()) return true;
    if (!candidate.email?.trim()) return true;
    if (!candidate.phone?.trim()) return true;
    if (!candidate.skills?.length) return true;
    if (!candidate.currentLocation?.trim()) return true;
    return false;
  };

  const handleParseResumes = async () => {
    if (!files.length) return;

    try {
      setLoading(true);
      const response = await bulkParseCandidates({ resumes: files });
      const enriched = response.data.map((c: any, index: number) => ({
        ...c,
        id: index + 1,
        file: files[index],
        previewUrl: URL.createObjectURL(files[index]),
        gender: c.gender || "",
        skills: c.skills || [],
        education: c.education || [],
        experience: c.experience || [],
      }));

      const withErrorFlag = enriched.map((c: any) => ({
        ...c,
        hasError: checkCandidateErrors(c),
      }));

      setEnableErrors(true);
      setParsedCandidates(withErrorFlag);
      validateCandidate();
    } catch (error) {
      console.error("Error parsing resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAll = async () => {
    if (!parsedCandidates.length) return;

    const invalidCandidates = parsedCandidates.filter((c) => c.hasError);
    if (invalidCandidates.length) {
      Notification.error(
        "Please fix errors in all candidates before uploading.",
      );
      return;
    }

    try {
      setUploading(true);

      const candidatesToUpload = parsedCandidates.map((c) => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        age: c.age,
        experienceYears: c.experienceYears,
        experienceMonths: c.experienceMonths,
        experience: c.experience,
        skills: c.skills,
        keywords: c.keywords,
        resume: c.file,
        currentLocation: c.currentLocation,
        education: c.education,
        ...(c.gender && { gender: c.gender }),
      }));

      const response = await addCandidatesBulk(candidatesToUpload);

      console.log("Bulk upload response:", response);
      if (response.success) {
        setCandidateCount();
        router.push("/candidates");
        setParsedCandidates([]);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error uploading candidates:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      parsedCandidates.forEach((c) => {
        if (c.previewUrl) URL.revokeObjectURL(c.previewUrl);
      });
    };
  }, [parsedCandidates]);

  useEffect(() => {
    if (selectedCandidate) {
      setEducation(selectedCandidate.education || []);
      setExperience(selectedCandidate.experience || []);
      setEnableErrors(false);
      setEducationErrors([]);
      setExperienceErrors([]);
      setFieldErrors({});
    }
  }, [selectedCandidate]);

  // ✅ FIXED PREVIEW LOGIC
  useEffect(() => {
    const loadPreview = async () => {
      if (!selectedCandidate?.file) return;

      const file = selectedCandidate.file;

      // 🔥 regenerate preview URL every time (fix PDF break)
      const freshPreviewUrl = URL.createObjectURL(file);

      setSelectedCandidate((prev: any) => ({
        ...prev,
        previewUrl: freshPreviewUrl,
      }));

      if (file.name.endsWith(".docx")) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const container = document.createElement("div");
          await renderAsync(arrayBuffer, container);
          setDocxHtml(container.innerHTML);
        } catch {
          setDocxHtml("Failed to load DOCX preview.");
        }
      } else {
        setDocxHtml("");
      }
    };

    loadPreview();

    return () => {
      if (selectedCandidate?.previewUrl) {
        URL.revokeObjectURL(selectedCandidate.previewUrl);
      }
    };
  }, [selectedCandidate?.file]);

  const validateCandidate = useCallback(() => {
    let hasError = false;
    const fErrors: { [key: string]: string } = {};
    if (!selectedCandidate?.name?.trim()) {
      fErrors.name = "Full Name is required";
      hasError = true;
    }
    if (!selectedCandidate?.currentLocation?.trim()) {
      fErrors.currentLocation = "Current Location is required";
      hasError = true;
    }
    if (!selectedCandidate?.email?.trim()) {
      fErrors.email = "Email is required";
      hasError = true;
    }
    if (!selectedCandidate?.currentLocation?.trim()) {
      fErrors.currentLocation = "Current Location is required";
      hasError = true;
    }
    if (selectedCandidate?.phone) {
      selectedCandidate.phone =
        selectedCandidate.phone.trim().replace(/\D/g, "").slice(0, 10) || "";
    }
    if (!selectedCandidate?.phone) {
      fErrors.phone = "Phone is required";
      hasError = true;
    } else if (
      selectedCandidate?.phone.length &&
      selectedCandidate?.phone.length !== 10
    ) {
      fErrors.phone = "Phone number should be 10 digits";
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
        if (exp.endDate)
          e.endDate = "End date should not be set if currently working";
      } else {
        if (!exp.endDate) e.endDate = "End Date is required";
      }

      if (start && end && start > end)
        e.endDate = "End Date must be after Start Date";

      if (Object.keys(e).length > 0) hasError = true;
      expErrs[i] = e;
    });
    if (currentJobCount > 1) hasError = true;

    setEnableErrors(true);
    setEducationErrors(eduErrs);
    setExperienceErrors(expErrs);
    setFieldErrors(fErrors);

    return !hasError;
  }, [selectedCandidate, education, experience]);

  const handleSaveCandidate = () => {
    if (!selectedCandidate) return;
    if (!validateCandidate()) {
      setParsedCandidates((prev) =>
        prev.map((c) =>
          c.id === selectedCandidate.id ? { ...c, hasError: true } : c,
        ),
      );
      return;
    }

    const updatedCandidate = {
      ...selectedCandidate,
      education,
      experience,
      previewUrl: selectedCandidate.previewUrl,
      hasError: false,
    };
    setParsedCandidates((prev) =>
      prev.map((c) => (c.id === selectedCandidate.id ? updatedCandidate : c)),
    );

    setSelectedCandidate(null);
  };

  useEffect(() => {
    if (selectedCandidate) {
      setEnableErrors(true);
      validateCandidate();
    }
  }, [selectedCandidate, validateCandidate]);

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
        {parsedCandidates.length ? (
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 text-gray-800 font-semibold hover:bg-orange-100 hover:text-orange-500 transition-all shadow-sm"
            onClick={() => {
              setParsedCandidates([]);
              setFiles([]);
            }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back
          </button>
        ) : null}
        <h1 className="text-3xl font-semibold">Upload Candidate Resumes</h1>

        {!parsedCandidates.length && (
          <>
            <FileUploader
              multiple
              maxFiles={50}
              onFilesChange={handleFilesChange}
            />
            <div className="mt-4">
              <Button
                onClick={handleParseResumes}
                disabled={!files.length || loading}
                loading={loading}
                loadingText="Parsing... please wait"
              >
                Parse Resume
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
                  index={index}
                  onDelete={(c: any) => {
                    setParsedCandidates((prev) =>
                      prev.filter((p) => p.id !== c.id),
                    );

                    // Close side panel if deleted candidate is open
                    if (selectedCandidate?.id === c.id) {
                      setSelectedCandidate(null);
                    }
                  }}
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
                  setSelectedCandidate({
                    ...selectedCandidate,
                    name: e.target.value,
                  })
                }
                errorMessage={enableErrors ? fieldErrors.name : ""}
              />

              <EmailInput
                cssClasses="py-2"
                required
                placeholder="Enter email"
                value={selectedCandidate.email || ""}
                onChange={(e) =>
                  setSelectedCandidate({
                    ...selectedCandidate,
                    email: e.target.value,
                  })
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
              <Input
                label="Age"
                cssClasses="py-2"
                type="number"
                placeholder="Enter age"
                value={selectedCandidate.age || ""}
                onChange={(e) =>
                  setSelectedCandidate({
                    ...selectedCandidate,
                    age: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              {/* --- Current Location Input --- */}
              <Input
                label="Current Location"
                cssClasses="py-2"
                placeholder="Enter current location"
                required
                errorMessage={enableErrors ? fieldErrors.currentLocation : ""}
                value={selectedCandidate.currentLocation || ""}
                onChange={(e) =>
                  setSelectedCandidate({
                    ...selectedCandidate,
                    currentLocation: e.target.value,
                  })
                }
              />

              <InputChips
                label="Skills"
                value={selectedCandidate.skills || []}
                required
                cssClasses="py-2"
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
                    src={selectedCandidate?.previewUrl}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                )}

                {selectedCandidate?.file?.name.endsWith(".docx") && (
                  <div
                    className="w-full h-full overflow-auto p-2 bg-gray-50"
                    dangerouslySetInnerHTML={{
                      __html: docxHtml || "Loading preview...",
                    }}
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
