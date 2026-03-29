'use client';
import React from "react";

const ParsedCandidateCard = ({ candidate, onClick }: any) => {
  const getInitials = (name: string) => {
    if (!name) return "NA";
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (
      names[0].charAt(0).toUpperCase() +
      names[1].charAt(0).toUpperCase()
    );
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer relative bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-md">
            {getInitials(candidate.name)}
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              {candidate.name || "Unknown"}
            </h3>
            <p className="text-xs text-gray-500">
              {candidate.email || "No email"}
            </p>
          </div>
        </div>

        {/* Parsed badge */}
        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600 font-medium">
          Parsed
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-4 relative z-10">
        {candidate.skills?.slice(0, 5).map((skill: string) => (
          <span
            key={skill}
            className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize transition group-hover:bg-gray-200"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 relative z-10">
        <span>{candidate.phone || "No phone"}</span>

        <span className="opacity-0 group-hover:opacity-100 transition">
          Click to view →
        </span>
      </div>
    </div>
  );
};

export default ParsedCandidateCard;