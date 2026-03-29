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

const CandidatesUploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFilesChange = (selectedFiles: File[]) => setFiles(selectedFiles);

  const handleParseResumes = async () => {
    if (!files.length) {
      alert("Please upload at least one resume.");
      return;
    }
    try {
      setLoading(true);
      const response = await bulkParseCandidates({ resumes: files });
      const enriched = response.data.map((c: any, index: number) => ({
        ...c,
        file: files[index],
        previewUrl: URL.createObjectURL(files[index]),
        gender: c.gender || "",
        skills: c.skills || [], // ✅ ensure skills array exists
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
      // await uploadCandidatesToDB(parsedCandidates);
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

  useEffect(() => {
    return () => parsedCandidates.forEach(c => URL.revokeObjectURL(c.previewUrl));
  }, [parsedCandidates]);

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

        {/* STEP 1: Upload & Parse */}
        {!parsedCandidates.length && (
          <>
            <FileUploader
              multiple
              maxFiles={50}
              onFilesChange={handleFilesChange}
            />
            <div className="mt-4">
              <Button onClick={handleParseResumes} disabled={loading}>
                {loading ? "Parsing..." : "Parse Resumes"}
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: Card View */}
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

        {/* STEP 3: Side Panel */}
        <SidePanel
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title="Candidate Details"
        >
          {selectedCandidate && (
            <div className="space-y-4">
              <Input
                label="Name"
                cssClasses="py-2"
                value={selectedCandidate.name || ""}
                onChange={(e) =>
                  setSelectedCandidate({ ...selectedCandidate, name: e.target.value })
                }
              />

              <EmailInput
                cssClasses="py-2"
                value={selectedCandidate.email || ""}
                onChange={(e) =>
                  setSelectedCandidate({ ...selectedCandidate, email: e.target.value })
                }
              />

              <PhoneInput
                cssClasses="py-2"
                value={selectedCandidate.phone || ""}
                onChange={(val) =>
                  setSelectedCandidate({ ...selectedCandidate, phone: val })
                }
              />

              <SelectDropdown
                label="Gender"
                options={["Male", "Female", "Other"]}
                value={selectedCandidate.gender || ""}
                onChange={(val) =>
                  setSelectedCandidate({ ...selectedCandidate, gender: val })
                }
                placeholder="Select Gender"
              />

              {/* ✅ Skills Input Chips */}
              <InputChips
                label="Skills"
                value={selectedCandidate.skills || []}
                onChange={(val) =>
                  setSelectedCandidate({ ...selectedCandidate, skills: val })
                }
                placeholder="Type skill and press Enter"
              />

              <div className="h-[400px] border rounded overflow-hidden">
                <iframe
                  src={selectedCandidate.previewUrl}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </SidePanel>
      </div>
    </section>
  );
};

export default CandidatesUploadPage;