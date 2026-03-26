export interface IPasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  errorMessage?: string;
  className?: string;
  label?: string;
  name?: string;
}