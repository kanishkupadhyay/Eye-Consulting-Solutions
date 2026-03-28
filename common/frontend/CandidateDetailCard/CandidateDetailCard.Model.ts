export interface ICandidate {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: "Male" | "Female";
  currentLocation?: string;
  experienceInMonths?: number;
  skills: string[];
  keywords: string[];
  defenseBackgroundCheck?: boolean;
  resumeUrl: string;
  resumeText?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status types for badge
export type StatusType = "New" | "Offer" | "Interview" | "Screening" | "Hired";

export const statusColors: Record<StatusType, string> = {
  New: "bg-purple-200 text-purple-700",
  Offer: "bg-green-200 text-green-700",
  Interview: "bg-blue-200 text-blue-700",
  Screening: "bg-yellow-200 text-yellow-700",
  Hired: "bg-teal-200 text-teal-700",
};

export interface CandidateDetailCardProps {
  candidate: ICandidate;
  status: StatusType;
  role?: string; // optional job title or role
  rating?: number; // optional rating (out of 5)
  onViewProfile?: () => void;
  onSchedule?: () => void;
  onMoveStage?: () => void;
}
