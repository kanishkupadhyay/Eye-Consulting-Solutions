"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FiTrash2, FiFileText, FiX, FiFile } from "react-icons/fi";
import { FileUploaderProps, FileWithPreview } from "./FileUploader.Model";
import { renderAsync } from "docx-preview";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const FileUploader: React.FC<FileUploaderProps> = ({
  multiple = true,
  maxFiles = 20,
  onFilesChange,
  errorMessage = "",
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(errorMessage);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null,
  );
  const [docxHtml, setDocxHtml] = useState<string>("");

  useEffect(() => {
    setError(errorMessage);
  }, [errorMessage]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      // Check max files
      if (files.length + acceptedFiles.length > maxFiles) {
        setError(
          `You can upload a maximum of ${maxFiles} file${
            maxFiles > 1 ? "s" : ""
          }.`,
        );
        return;
      }

      const validFiles: FileWithPreview[] = [];

      for (const file of acceptedFiles) {
        if (
          ![
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(file.type)
        ) {
          setError("Only PDF, DOC, and DOCX files are allowed.");
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name} is too large. Max allowed size is 2 MB.`);
          continue;
        }

        validFiles.push(
          Object.assign(file, { preview: URL.createObjectURL(file) }),
        );
      }

      if (validFiles.length === 0) return;

      setFiles((prev) => {
        const newFiles = multiple ? [...prev, ...validFiles] : validFiles;
        onFilesChange?.(newFiles);
        return newFiles;
      });
    },
    [files, maxFiles, multiple, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updatedFiles = prev.map((file, i) =>
        i === index ? { ...file, removing: true } : file,
      );
      setTimeout(() => {
        const finalFiles = updatedFiles.filter((_, i) => i !== index);
        setFiles(finalFiles);
        onFilesChange?.(finalFiles);
      }, 300);
      return updatedFiles;
    });
  };

  const removeAllFiles = () => {
    setFiles((prev) => prev.map((file) => ({ ...file, removing: true })));
    setTimeout(() => {
      setFiles([]);
      onFilesChange?.([]);
    }, 300);
  };

  // Load DOCX preview
  useEffect(() => {
    const loadDocxPreview = async (file: FileWithPreview) => {
      if (file.name?.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const container = document.createElement("div");
        await renderAsync(arrayBuffer, container);
        setDocxHtml(container.innerHTML);
      } else {
        setDocxHtml("");
      }
    };

    if (selectedFile) loadDocxPreview(selectedFile);
  }, [selectedFile]);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out
          ${isDragActive ? "border-blue-500 bg-blue-50 animate-pulse" : "border-gray-300 hover:border-orange-500"} 
          cursor-pointer ${error ? "border-red-500 bg-red-50" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 text-lg">
          {isDragActive
            ? "Drop files here..."
            : multiple
              ? `Drag & drop PDFs/DOCXs, or click to select (max ${maxFiles})`
              : "Drag & drop a PDF/DOCX, or click to select"}
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* File count */}
      {files.length > 0 && (
        <h2 className="text-xl font-medium mb-2">
          Selected file{files.length > 1 ? "s" : ""}: ({files.length})
        </h2>
      )}

      {/* Remove All Button */}
      {maxFiles !== 1 && files.length > 0 && multiple && (
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

      {/* File list */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              onClick={() => setSelectedFile(file)}
              className={`flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm transition-all duration-300 ease-in-out
                ${file.removing ? "opacity-0 scale-90" : "opacity-100 scale-100"}
                hover:shadow-md hover:border-orange-500 cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                {file.name?.endsWith(".pdf") ? (
                  <FiFile className="text-blue-500 text-2xl" />
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
                onClick={(event) => {
                  event.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] h-[90%] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <p className="font-medium">{selectedFile.name}</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-600 hover:text-red-500"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* PDF */}
            {selectedFile.name?.endsWith(".pdf") && (
              <iframe src={selectedFile.preview} className="flex-1 w-full" />
            )}

            {/* DOCX */}
            {selectedFile.name?.endsWith(".docx") && (
              <div
                className="flex-1 overflow-auto p-4 bg-gray-50 rounded"
                dangerouslySetInnerHTML={{
                  __html: docxHtml || "Loading preview...",
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
