export interface IInputChipsProps {
  label?: string;
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  errorMessage?: string;
  cssClasses?: string;
}
