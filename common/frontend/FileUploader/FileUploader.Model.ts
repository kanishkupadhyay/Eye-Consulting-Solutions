export type FileWithPreview = File & { preview?: string; removing?: boolean };

export interface FileUploaderProps {
  multiple?: boolean;
  maxFiles?: number;
  onFilesChange?: (files: FileWithPreview[]) => void;
  errorMessage?: string;
}