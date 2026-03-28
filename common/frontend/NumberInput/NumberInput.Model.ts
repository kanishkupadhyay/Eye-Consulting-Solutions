export interface NumberInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  cssClasses?: string;
  errorMessage?: string;
}
