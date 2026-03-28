"use client";

import { useEffect, useState } from "react";
import { ICandidate } from "@/models/candidate.model";
import getCandidateById from "@/services/frontend/get-candidate";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import NotFound from "../NotFound/NotFount";
import { getUniqueColor } from "../utils";

interface CandidateDetailPageProps {
  candidateId: string;
}

const getInitials = (name: string) => {
  const names = name.split(" ");
  const initials = names.map((n) => n[0]?.toUpperCase() || "");
  return initials.slice(0, 2).join("");
};

// Fixed Skeleton Loader
const CandidateSkeleton = () => {
  return (
    <section className="p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-5 bg-gray-300 w-1/3 rounded" />

        {/* Header Skeleton */}
        <div className="flex flex-col items-center md:items-start md:flex-row gap-6 bg-white p-6 rounded-md shadow-md">
          <div className="w-24 h-24 rounded-full bg-gray-300" />
          <div className="flex-1 flex flex-col gap-3 w-full text-center md:text-left">
            <div className="h-6 bg-gray-300 w-1/3 rounded" />
            <div className="h-4 bg-gray-200 w-1/4 rounded" />
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-6 w-20 bg-gray-200 rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Skills Skeleton */}
        <div className="bg-white p-6 rounded-md shadow-md">
          <div className="h-5 bg-gray-300 w-24 mb-4 rounded" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-6 w-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-md shadow-md">
          <div className="border-b border-gray-200 flex">
            <div className="flex-1 h-10 bg-gray-200" />
            <div className="flex-1 h-10 bg-gray-200" />
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-4 bg-gray-200 rounded w-full" />
            ))}
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
              response.data.createdBy?._id || response.data.createdBy || "",
          });
        }
      } catch (err: any) {
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
        {/* Candidate Header */}
        <div className="flex flex-col items-center md:items-start md:flex-row gap-6 bg-white p-6 rounded-md shadow-md">
          <div
            className="w-24 h-24 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white text-3xl font-bold"
            style={{ backgroundColor: getUniqueColor(candidate.name) }}
          >
            {getInitials(candidate.name)}
          </div>

          <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
            <h1 className="text-3xl font-bold">{candidate.name}</h1>
            <p className="text-gray-500">{candidate.currentLocation || "-"}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold">
                {candidate.email}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold">
                {candidate.phone}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold">
                Age: {candidate.age || "-"}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold">
                Gender: {candidate.gender || "-"}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold">
                Experience: {years} yr {months} mo
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {candidate.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-xl text-center font-semibold text-sm shadow-md hover:scale-105 transform transition-all"
                >
                  {skill
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-md shadow-md">
          <div className="border-b border-gray-200 flex">
            <button
              className={`flex-1 text-center py-3 font-medium transition ${
                activeTab === "details"
                  ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`flex-1 text-center py-3 font-medium transition ${
                activeTab === "resume"
                  ? "border-b-4 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("resume")}
            >
              Resume
            </button>
          </div>

          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-4 text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                <p>
                  <strong>Defense Background Check:</strong>{" "}
                  {candidate.defenseBackgroundCheck ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(candidate.updatedAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Current Location:</strong>{" "}
                  {candidate.currentLocation || "-"}
                </p>
                <p>
                  <strong>Experience:</strong> {years} yr {months} mo
                </p>
                <p>
                  <strong>Skills Count:</strong> {candidate.skills.length}
                </p>
              </div>
            )}

            {activeTab === "resume" && (
              <div className="relative">
                {candidate.resumeUrl ? (
                  <iframe
                    src={candidate.resumeUrl}
                    className="w-full h-[600px] border rounded-md"
                    title="Candidate Resume"
                  />
                ) : (
                  <div className="text-gray-500 text-center py-20">
                    Resume not available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateDetailPage;
