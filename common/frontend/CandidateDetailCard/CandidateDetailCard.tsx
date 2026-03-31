"use client";
import React from "react";
import {
  CandidateDetailCardProps,
  statusColors,
} from "./CandidateDetailCard.Model";
import Link from "next/link";
import {
  getComputedCandidateExperience,
  getResumeStatus,
  getUniqueColor,
} from "../utils";
import { Download } from "lucide-react";

const CandidateDetailCard: React.FC<CandidateDetailCardProps> = ({
  candidate,
}) => {
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow max-w-sm flex flex-col justify-between h-full">
      {/* Top content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg w-12 h-12 flex items-center justify-center font-bold text-white text-lg"
              style={{ backgroundColor: getUniqueColor(candidate.name) }}
            >
              {getInitials(candidate.name)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{candidate.name}</h3>
              <p className="text-gray-500 text-sm">
                {getComputedCandidateExperience(candidate.experienceInMonths)}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              statusColors[getResumeStatus(candidate.createdAt)]
            }`}
          >
            {getResumeStatus(candidate.createdAt)}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 6).map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-gray-200 capitalize text-gray-700 text-xs px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 6 && (
            <span className="bg-gray-200 capitalize text-gray-700 text-xs px-3 py-1 rounded-full">
              +{candidate.skills.length - 6} other
            </span>
          )}
        </div>
      </div>

      {/* Buttons at the bottom */}
      <div className="flex justify-between mt-4">
        <Link href={`/candidates/${candidate._id}`}>
          <button className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-100">
            View Profile
          </button>
        </Link>

        <a
          href={candidate.resumeUrl}
          download={true}
          target="_blank"
          className="bg-orange-600 flex justify-center items-center text-white rounded px-4 py-2 text-sm hover:bg-orange-700"
        >
          <Download className="w-4 h-4 mr-1" />
          Resume
        </a>
      </div>
    </div>
  );
};

export default CandidateDetailCard;
