export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  cssClasses?: string;
  required?: boolean;
  hasWarning?: boolean;
}
