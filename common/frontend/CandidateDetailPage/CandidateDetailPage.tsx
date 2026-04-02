"use client";

import { useEffect, useState } from "react";
import { ICandidate } from "@/models/candidate.model";
import getCandidateById from "@/services/frontend/get-candidate";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import NotFound from "../NotFound/NotFound";
import { getUniqueColor } from "../utils";
import ExpandableCard from "../ExpandableCard/ExpandableCard";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaEnvelope,
  FaGraduationCap,
  FaPhoneAlt,
  FaShieldAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail, MdContentCopy, MdCheck } from "react-icons/md";
import { Notification } from "../notification";

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
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        {/* Breadcrumb */}
        <div className="h-4 w-40 bg-gray-200 rounded" />

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg shadow-sm">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-200" />

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />

            {/* Contact row */}
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="h-8 w-40 bg-gray-200 rounded-md" />
              <div className="h-8 w-32 bg-gray-200 rounded-md" />
              <div className="h-8 w-32 bg-gray-200 rounded-md" />
              <div className="h-8 w-36 bg-gray-200 rounded-md" />
            </div>

            <div className="h-4 w-1/3 bg-gray-100 rounded mt-2" />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-md shadow-md space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-20 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-md shadow-md">
          <div className="flex border-b border-gray-200">
            <div className="flex-1 h-10 bg-gray-100" />
            <div className="flex-1 h-10 bg-gray-50" />
          </div>

          <div className="p-6 space-y-6">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>

            {/* Experience Skeleton */}
            <div className="space-y-6">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-1/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Education Skeleton */}
            <div className="space-y-6">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-3 w-1/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Resume */}
            <div className="space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="w-full h-[500px] bg-gray-200 rounded-md" />
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
  const [copied, setCopied] = useState(false);

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

  const handlePhoneCopy = (): void => {
    navigator.clipboard.writeText(candidate.phone);
    if (!copied) {
      Notification.success("Phone number copied to clipboard!");
    }
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

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
        <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg shadow-sm">
          {/* Avatar */}
          <div
            className="w-20 h-20 flex items-center justify-center rounded-full text-white text-2xl font-semibold"
            style={{ backgroundColor: getUniqueColor(candidate.name) }}
          >
            {getInitials(candidate.name)}
          </div>

          {/* Right Content */}
          <div className="flex-1 space-y-3">
            {/* Name */}
            <h1 className="text-2xl font-semibold">{candidate.name}</h1>

            {/* Experience + Location */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>
                💼 {years}y {months}m
              </span>
              <span>•</span>
              <span>
                📍{" "}
                {`${candidate.city?.name}, ${candidate.state?.name}` || "N/A"}
              </span>
              <span>🎂 {candidate.age || "N/A"} yrs</span>
              <span>•</span>

              <span>👤 {candidate.gender || "N/A"}</span>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col gap-2">
              {/* Top Row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Phone Badge */}
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-md">
                  <FaPhoneAlt className="animate-bounce text-green-600 text-xs" />
                  <span className="text-green-700 text-sm font-medium">
                    {candidate.phone}
                  </span>
                  <button
                    onClick={handlePhoneCopy}
                    className="text-gray-400 hover:text-gray-600 transition-all duration-200"
                  >
                    {copied ? (
                      <MdCheck size={16} className="text-green-600" />
                    ) : (
                      <MdContentCopy size={14} />
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <a href={`tel:${candidate.phone}`}>
                    <button className="flex items-center gap-[10px] border border-gray-300 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
                      <FaPhoneAlt
                        size={12}
                        className="animate-bounce text-teal-500"
                      />
                      Call candidate
                    </button>
                  </a>

                  {/* Email Button */}
                  <a href={`mailto:${candidate.email}`}>
                    <button className="flex items-center gap-[10px] border border-gray-300 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
                      <FaEnvelope size={12} className="text-purple-500" />
                      Email candidate
                    </button>
                  </a>

                  <a
                    href={`https://wa.me/${candidate.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="flex items-center gap-[10px] border border-gray-300 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50">
                      <FaWhatsapp size={16} className="text-green-600" />
                      WhatsApp
                    </button>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdEmail size={16} />
                <span>{candidate.email}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="font-semibold mb-3">Key Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-500 text-white px-3 py-1 capitalize rounded-full text-sm"
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
                  ? "border-b-2 border-[#156eb7] text-[#156eb7]"
                  : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`flex-1 py-3 ${
                activeTab === "resume"
                  ? "border-b-2 border-[#156eb7] text-[#156eb7]"
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
                  {/* Defense Check */}
                  <div className="flex items-center gap-2">
                    <FaShieldAlt
                      size={14}
                      className={`
                        ${
                          candidate.defenseBackgroundCheck
                            ? "text-green-600"
                            : "text-red-500"
                        } animate-pulse
                      `}
                    />
                    <p className="text-gray-700">
                      <span className="font-medium">Defense Check:</span>{" "}
                      {candidate.defenseBackgroundCheck ? "Yes" : "No"}
                    </p>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt size={14} className="text-blue-500" />
                    <p className="text-gray-700">
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {candidate.experience && candidate.experience.length > 0 && (
                  <ExpandableCard title="Experience">
                    <div className="relative pl-8 space-y-8">
                      {/* Vertical Line */}
                      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200"></div>

                      {[...candidate.experience]
                        .sort(
                          (a, b) =>
                            new Date(b.startDate).getTime() -
                            new Date(a.startDate).getTime(),
                        )
                        .map((exp, i) => (
                          <div
                            key={i}
                            className="relative flex items-start gap-4"
                          >
                            {/* Icon */}
                            <div className="absolute left-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md border border-white">
                              <FaBriefcase
                                className="text-blue-600"
                                size={14}
                              />
                            </div>

                            {/* Content */}
                            <div className="ml-10">
                              <h3 className="font-semibold text-gray-800">
                                {exp.role || "Role"}
                              </h3>

                              <p className="text-sm text-gray-600">
                                {exp.company}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(exp.startDate).toLocaleDateString()} -{" "}
                                {exp.currentlyWorking
                                  ? "Present"
                                  : exp.endDate
                                    ? new Date(exp.endDate).toLocaleDateString()
                                    : "-"}
                              </p>

                              {exp.description && (
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ExpandableCard>
                )}
                {candidate.education && candidate.education.length > 0 && (
                  <ExpandableCard title="Education">
                    <div className="space-y-6">
                      {candidate.education.map((edu, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          {/* Icon Box */}
                          <div className="bg-yellow-100 p-3 rounded-md">
                            <FaGraduationCap
                              className="text-yellow-700"
                              size={18}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            {/* Degree */}
                            <h3 className="font-semibold text-gray-800 leading-snug">
                              {edu.degree}
                              {edu.fieldOfStudy && ` - ${edu.fieldOfStudy}`}
                            </h3>

                            {/* Institute */}
                            <p className="text-sm text-gray-600">
                              {edu.institute || "University/Other"}
                            </p>

                            {/* Year */}
                            <p className="text-xs text-gray-500 mt-1">
                              {edu.startYear} - {edu.endYear}
                            </p>

                            {/* Grade (optional) */}
                            {edu.grade && (
                              <p className="text-sm text-gray-700 mt-1">
                                Grade: {edu.grade}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ExpandableCard>
                )}
                <h4 className="text-sm font-semibold text-[#156eb7] tracking-wide uppercase">
                  Resume
                </h4>
                <iframe
                  src={candidate.resumeUrl}
                  className="w-full h-[1000px]"
                />
              </>
            )}

            {activeTab === "resume" && (
              <iframe src={candidate.resumeUrl} className="w-full h-[1000px]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateDetailPage;
