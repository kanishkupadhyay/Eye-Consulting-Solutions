export interface IDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}
