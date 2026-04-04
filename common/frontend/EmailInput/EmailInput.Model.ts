export interface IEmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  cssClasses?: string;
  placeholder?: string;
  hasWarning?: boolean;
}
