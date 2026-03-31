"use client";

import { useEffect, useState } from "react";
import { ICandidate } from "@/models/candidate.model";
import getCandidateById from "@/services/frontend/get-candidate";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import NotFound from "../NotFound/NotFound";
import { getUniqueColor } from "../utils";
import ExpandableCard from "../ExpandableCard/ExpandableCard";

interface CandidateDetailPageProps {
  candidateId: string;
}

const getInitials = (name: string) => {
  const names = name.split(" ");
  const initials = names.map((n) => n[0]?.toUpperCase() || "");
  return initials.slice(0, 2).join("");
};

const CandidateSkeleton = () => {
  return (
    <section className="p-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-5 w-40 bg-gray-300 rounded" />

        <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-md shadow-md">
          <div className="w-24 h-24 rounded-full bg-gray-300" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/5 bg-gray-300 rounded" />
            <div className="h-5 w-1/4 bg-gray-200 rounded" />
            <div className="flex flex-wrap gap-3">
              <div className="h-6 w-24 bg-gray-300 rounded-full" />
              <div className="h-6 w-24 bg-gray-300 rounded-full" />
              <div className="h-6 w-28 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CandidateDetailPage = ({ candidateId }: CandidateDetailPageProps) => {
  const [candidate, setCandidate] = useState<ICandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "resume">("details");

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const response = await getCandidateById(candidateId);
        if (response.success) {
          setCandidate({
            ...response.data,
            createdBy:
              response.data.createdBy?._id ||
              response.data.createdBy ||
              "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  if (loading) return <CandidateSkeleton />;
  if (!candidate) return <NotFound title={"Candidate"} />;

  const years = Math.floor((candidate.experienceInMonths || 0) / 12);
  const months = (candidate.experienceInMonths || 0) % 12;

  return (
    <section className="p-6">
      <Breadcrumb
        cssClasses="mb-5"
        items={[
          { name: "Candidates", href: "/candidates" },
          { name: candidate.name },
        ]}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-md shadow-md">
          <div
            className="w-24 h-24 flex items-center justify-center rounded-full text-white text-3xl font-bold"
            style={{ backgroundColor: getUniqueColor(candidate.name) }}
          >
            {getInitials(candidate.name)}
          </div>

          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{candidate.name}</h1>

            {/* 🔥 Updated Experience + Location Row */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>💼 {years}y {months}m</span>
              <span>•</span>
              <span>📍 {candidate.currentLocation || "N/A"}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                {candidate.email}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                {candidate.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-md shadow-md">
          <div className="flex border-b border-gray-300">
            <button
              className={`flex-1 py-3 ${
                activeTab === "details"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`flex-1 py-3 ${
                activeTab === "resume"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : ""
              }`}
              onClick={() => setActiveTab("resume")}
            >
              Resume
            </button>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === "details" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p>Age: {candidate.age || "-"}</p>
                  <p>Gender: {candidate.gender || "-"}</p>
                  <p>
                    Defense Check:{" "}
                    {candidate.defenseBackgroundCheck ? "Yes" : "No"}
                  </p>
                  <p>
                    Created:{" "}
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <ExpandableCard title="Experience">
                  <div className="space-y-4">
                    {[...candidate.experience]
                      .sort(
                        (a, b) =>
                          new Date(b.startDate).getTime() -
                          new Date(a.startDate).getTime()
                      )
                      .map((exp, i) => (
                        <div
                          key={i}
                          className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 hover:shadow-lg transition"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">
                              {exp.role || "Role"}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {new Date(exp.startDate).toLocaleDateString()} -{" "}
                              {exp.currentlyWorking
                                ? "Present"
                                : exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {exp.company}
                          </p>
                          {exp.description && (
                            <p className="mt-2 text-gray-600 text-sm">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </ExpandableCard>

                <ExpandableCard title="Education">
                  <div className="space-y-4">
                    {candidate.education.map((edu, i) => (
                      <div
                        key={i}
                        className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 via-green-100 to-green-50 hover:shadow-lg transition"
                      >
                        <h3 className="font-semibold text-gray-800">
                          {edu.degree}
                          {edu.fieldOfStudy && ` - ${edu.fieldOfStudy}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {edu.institute}
                        </p>
                        <p className="text-xs text-gray-500">
                          {edu.startYear} - {edu.endYear}
                        </p>
                        {edu.grade && (
                          <p className="text-sm text-gray-700">
                            Grade: {edu.grade}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ExpandableCard>
              </>
            )}

            {activeTab === "resume" && (
              <iframe
                src={candidate.resumeUrl}
                className="w-full h-[600px]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateDetailPage;