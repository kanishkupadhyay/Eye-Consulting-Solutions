import { IAvatarProps } from "./Avatar.Model";

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
};

export default function Avatar({
  firstName,
  lastName,
  size = 40,
}: IAvatarProps) {
  const initials = getInitials(firstName, lastName);

  return (
    <div
      className="rounded-full bg-blue-500 flex items-center justify-center font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
