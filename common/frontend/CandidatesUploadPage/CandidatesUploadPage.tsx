"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FiTrash2, FiFileText, FiX, FiFile } from "react-icons/fi";
import Button from "../Button/Button";
import * as mammoth from "mammoth";

type FileWithPreview = File & { preview?: string; removing?: boolean };

const MAX_FILES = 50;

const CandidatesUploadPage = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null,
  );
  const [docContent, setDocContent] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      if (files.length + acceptedFiles.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} resumes.`);
        return;
      }

      const validFiles = acceptedFiles
        .filter((file) =>
          [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(file.type),
        )
        .map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) }),
        );

      if (validFiles.length !== acceptedFiles.length) {
        setError("Only PDF, DOC, and DOCX files are allowed.");
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  // Delete single file with animation
  const removeFile = (index: number) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, removing: true } : file)),
    );
    setTimeout(() => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    }, 300);
  };

  // Remove all files with animation
  const removeAllFiles = () => {
    setFiles((prev) => prev.map((file) => ({ ...file, removing: true })));
    setTimeout(() => {
      setFiles([]);
    }, 300);
  };

  const handleSubmit = () => {
    if (!files.length) {
      setError("Please upload at least one resume.");
      return;
    }
    setError(null);
    console.log("Submitting files:", files);
  };

  // Load DOCX content when selectedFile changes
  useEffect(() => {
    const loadDocx = async (file: FileWithPreview) => {
      if (file.name?.endsWith(".docx")) {
        const reader = new FileReader();
        reader.onload = async () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setDocContent(result.value);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setDocContent("");
      }
    };

    if (selectedFile) loadDocx(selectedFile);
  }, [selectedFile]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">Upload Candidate Resumes</h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out
          ${isDragActive ? "border-blue-500 bg-blue-50 animate-pulse" : "border-gray-300 hover:border-orange-500"} 
          cursor-pointer`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 text-lg transition-colors duration-300">
          {isDragActive
            ? "Drop files here..."
            : `Drag & drop PDFs/DOCs/DOCXs, or click to select (max ${MAX_FILES})`}
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* Remove All Button above File List, right-aligned */}
      {/* Remove All Icon above File List, right-aligned */}
      {files.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={removeAllFiles}
            className="text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-full"
            title="Remove All"
          >
            <FiTrash2 size={24} />
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div>
          <h2 className="text-xl font-medium mb-2">
            Selected Files ({files.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={`flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm transition-all duration-300 ease-in-out
                  ${file.removing ? "opacity-0 scale-90" : "opacity-100 scale-100"}
                  hover:shadow-md hover:border-orange-500 cursor-pointer`}
              >
                <div
                  className="flex items-center gap-3"
                  onClick={() => setSelectedFile(file)}
                >
                  {/* Conditional Icon */}
                  {file.name?.endsWith(".pdf") ? (
                    <FiFile className="text-red-500 text-2xl" />
                  ) : (
                    <FiFileText className="text-blue-500 text-2xl" />
                  )}

                  <div>
                    <p className="text-sm font-semibold text-blue-600 hover:underline">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {files.length > 0 && (
        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={!files.length}
            className="transition-transform duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500"
          >
            Submit
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] h-[90%] flex flex-col transition-transform duration-300 transform scale-95 animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b">
              <p className="font-medium">{selectedFile.name}</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-600 hover:text-red-500 transition-colors duration-200"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Conditional Preview */}
            {selectedFile.name?.endsWith(".pdf") ? (
              <iframe src={selectedFile.preview} className="flex-1 w-full" />
            ) : selectedFile.name?.endsWith(".docx") ? (
              <div className="flex-1 overflow-auto p-4 text-gray-800 whitespace-pre-wrap bg-gray-50 rounded">
                {docContent || "Loading preview..."}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Preview not available for this file type.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesUploadPage;
