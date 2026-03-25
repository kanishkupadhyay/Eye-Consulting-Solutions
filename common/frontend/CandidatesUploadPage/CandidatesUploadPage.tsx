"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "../Button/Button";

type FileWithPreview = File & {
  preview?: string;
};

const MAX_FILES = 50;

const CandidatesUploadPage = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      if (files.length + acceptedFiles.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} resumes.`);
        return;
      }

      const validFiles = acceptedFiles
        .filter((file) => file.type === "application/pdf")
        .map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );

      if (validFiles.length !== acceptedFiles.length) {
        setError("Only PDF files are allowed.");
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!files.length) {
      setError("Please upload at least one resume.");
      return;
    }

    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    console.log("Submitting files:", files);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl">Upload Candidates Resumes</h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition 
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"} hover:border-orange-500`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">Drop the resumes here...</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop resumes here, or click to select files (PDF only, max {MAX_FILES})
          </p>
        )}
      </div>

      {/* Error */}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-medium">Selected Files ({files.length})</h2>

          <ul className="divide-y border rounded-md">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex justify-between items-center p-3"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <p className="text-sm font-medium text-blue-600 hover:underline">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!files.length}
      >
        Submit
      </Button>

      {/* PDF Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] rounded-lg shadow-lg flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500"
              >
                Close
              </button>
            </div>

            {/* PDF Viewer */}
            <iframe
              src={selectedFile.preview}
              className="flex-1 w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesUploadPage;