"use client";

import FileUploader from "../FileUploader/FileUploader";
import Button from "../Button/Button";
import Breadcrumb from "../Breadcrumb/Breadcrumb";

const CandidatesUploadPage = () => {
  const handleFilesChange = (files: any) => {
    console.log("Selected files:", files);
  };

  const handleSubmit = (files: any) => {
    if (!files.length) {
      alert("Please upload at least one resume.");
      return;
    }
    console.log("Submitting files:", files);
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
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Upload Candidate Resumes</h1>

        {/* Use reusable FileUploader */}
        <FileUploader
          multiple={true} // set false for Add Candidate page
          maxFiles={50}
          onFilesChange={handleFilesChange}
        />

        {/* Example Submit button */}
        <div className="mt-4">
          <Button
            onClick={
              () => handleSubmit([]) // Replace [] with your files state if needed
            }
            className="transition-transform duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
          >
            Submit
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CandidatesUploadPage;
