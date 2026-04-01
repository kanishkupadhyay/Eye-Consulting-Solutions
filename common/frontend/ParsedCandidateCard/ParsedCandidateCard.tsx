"use client";
import React from "react";
import { Trash2 } from "lucide-react";

const ParsedCandidateCard = ({ candidate, onClick, onDelete }: any) => {
  const getInitials = (name: string) => {
    if (!name) return "NA";
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (
      names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer relative bg-white/70 backdrop-blur-md border ${
        candidate.hasError ? "border-red-500" : "border-gray-200"
      } rounded-2xl p-5 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]`}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent card click
          if (onDelete) onDelete(candidate);
        }}
        className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center text-white bg-red-500 rounded-full hover:bg-red-600 transition"
        title="Delete Candidate"
      >
        <Trash2 size={16} />
      </button>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />

      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-md">
          {getInitials(candidate.name)}
        </div>
        <div className="flex flex-col truncate">
          <h3 className="font-semibold text-lg text-gray-800 truncate max-w-[180px]">
            {candidate.name || "Unknown"}
          </h3>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">
            {candidate.email || "No email"}
          </p>
        </div>
        <span
          className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${
            candidate.hasError
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {candidate.hasError ? "Error" : "Parsed"}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-3 min-h-[24px] relative z-10">
        {candidate.skills?.length > 0 ? (
          candidate.skills.slice(0, 5).map((skill: string) => (
            <span
              key={skill}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize transition group-hover:bg-gray-200"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">No skills added</span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-400 relative z-10">
        <div className="flex flex-col">
          <span>{candidate.phone || "No phone"}</span>
          {candidate.hasError && (
            <span className="text-red-500 text-xs italic mt-0.5">
              Form has errors
            </span>
          )}
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition">
          Click to view →
        </span>
      </div>
    </div>
  );
};

export default ParsedCandidateCard;