import React from "react";
import {
  CandidateDetailCardProps,
  statusColors,
} from "./CandidateDetailCard.Model";
import Link from "next/link";
import { getUniqueColor } from "../utils";

const CandidateDetailCard: React.FC<CandidateDetailCardProps> = ({
  candidate,
  status,
  role = "Unknown Role",
  rating = 4, // default 4 stars
  onViewProfile,
  onSchedule,
  onMoveStage,
}) => {
  // Get initials from name
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  };

  // Format createdAt date to "Applied: Nov 25"
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return d.toLocaleDateString(undefined, options);
  };

  // Render star rating (out of 5)
  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 inline-block ${
            i <= count ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.287 3.965c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L2.045 9.392c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.965z" />
        </svg>,
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow space-y-4 max-w-sm">
      {/* Header: Avatar + Name + Role + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="rounded-lg w-12 h-12 flex items-center justify-center font-bold text-white text-lg bg-indigo-600"
            style={{ backgroundColor: getUniqueColor(candidate.name) }}
          >
            {getInitials(candidate.name)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{candidate.name}</h3>
            <p className="text-gray-500 text-sm">{role}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            statusColors[status]
          }`}
        >
          {status}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {candidate.skills.map((skill: string) => (
          <span
            key={skill}
            className="bg-gray-200 capitalize text-gray-700 text-xs px-3 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Applied date and rating */}
      <div className="flex items-center justify-between text-gray-500 text-sm">
        <p>Applied: {formatDate(candidate.createdAt)}</p>
        <div className="flex">{renderStars(rating)}</div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Link href={`/candidates/${candidate._id}`}>
          <button className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-100">
            View Profile
          </button>
        </Link>
        <button
          onClick={onSchedule}
          className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-100"
        >
          Schedule
        </button>
        <button
          onClick={onMoveStage}
          className="bg-orange-600 text-white rounded px-4 py-2 text-sm hover:bg-orange-700"
        >
          Move Stage
        </button>
      </div>
    </div>
  );
};

export default CandidateDetailCard;
