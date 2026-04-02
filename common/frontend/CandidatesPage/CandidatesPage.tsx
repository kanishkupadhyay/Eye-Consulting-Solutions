"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CandidateDetailCard from "../CandidateDetailCard/CandidateDetailCard";
import getCandidates from "@/services/frontend/get-candidates";
import { ICandidate } from "@/models/candidate.model";
import CandidateSkeleton from "./CandidateSkeleton";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Sliders } from "lucide-react";
import Dialog from "../Dialog/Dialog";
import NumberInput from "../NumberInput/NumberInput";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import Input from "../Input/Input";
import InputChips from "../InputChip/InputChip";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../Button/Button";

interface CandidateWithExtras extends ICandidate {
  status?: string;
  role?: string;
  rating?: number;
}

const breadcrumbItems = [{ name: "Candidates", href: "/candidates" }];
const LIMIT = 20;

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState<CandidateWithExtras[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    skills: string[];
    experienceYears: string;
    experienceMonths: string;
    age: string;
    currentLocation: string;
    gender: string;
    defenceBackground: boolean;
  }>({
    skills: [],
    experienceYears: "",
    experienceMonths: "",
    age: "",
    currentLocation: "",
    gender: "",
    defenceBackground: false,
  });

  const loadedIds = useRef(new Set<string>());
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getCandidates({ page, limit: LIMIT });
      if (response.success) {
        const newCandidates: CandidateWithExtras[] = response.data
          .map((c: any) => ({
            ...c,
            createdBy: c.createdBy?._id || c.createdBy || "",
            role: c.role || "Unknown Role",
            rating: c.rating ?? 0,
          }))
          .filter((c: CandidateWithExtras) => {
            if (loadedIds.current.has((c as any)._id)) return false;
            loadedIds.current.add((c as any)._id);
            return true;
          });

        setCandidates((prev) => [...prev, ...newCandidates]);
        setHasMore(newCandidates.length === LIMIT);
      } else {
        setError("Failed to load candidates");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    if (bottomRef.current) observer.current.observe(bottomRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore]);

  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    setFilterOptions((prev) => ({
      ...prev,
      skills: searchParams.get("skills")?.split(",") || [],
      experienceYears: searchParams.get("experienceYears") || "",
      experienceMonths: searchParams.get("experienceMonths") || "",
      age: searchParams.get("age") || "",
      currentLocation: searchParams.get("currentLocation") || "",
      gender: searchParams.get("gender") || "",
      defenceBackground: searchParams.get("defenceBackground") === "true",
    }));
  }, []);

  const handleApplyFilters = () => {
    // Build query params from filterOptions
    const params = new URLSearchParams();

    if (filterOptions.skills.length > 0) {
      params.set("skills", filterOptions.skills.join(","));
    }
    if (filterOptions.experienceYears) {
      params.set("experienceYears", filterOptions.experienceYears);
    }
    if (filterOptions.experienceMonths) {
      params.set("experienceMonths", filterOptions.experienceMonths);
    }
    if (filterOptions.age) {
      params.set("age", filterOptions.age);
    }
    if (filterOptions.currentLocation) {
      params.set("currentLocation", filterOptions.currentLocation);
    }
    if (filterOptions.gender) {
      params.set("gender", filterOptions.gender);
    }
    if (filterOptions.defenceBackground) {
      params.set("defenceBackground", "true");
    }

    // Update URL without page reload
    router.replace(`/candidates?${params.toString()}`, { scroll: false });

    setIsFilterOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Top bar with filter button */}
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold">Candidates</h2>
        <Button
          onClick={() => setIsFilterOpen(true)}
          className="max-w-[86px] !py-2"
          title="Filter Candidates"
        >
          <Sliders className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Candidates Grid */}
      {candidates.length === 0 && !loading && !error ? (
        <div className="text-gray-500 text-center col-span-full">
          No candidates have been added yet
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateDetailCard
                key={candidate._id as unknown as string}
                candidate={candidate}
              />
            ))}

            {loading &&
              Array.from({ length: 12 }).map((_, idx) => (
                <CandidateSkeleton key={idx} />
              ))}

            {error && <div className="text-red-500 col-span-full">{error}</div>}
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-1"></div>

      {/* Filter Dialog */}
      <Dialog
        isOpen={isFilterOpen}
        onCancel={() => setIsFilterOpen(false)}
        onConfirm={handleApplyFilters}
        title="Filter Candidates"
        confirmText="Apply"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <InputChips
            label="Skills"
            cssClasses="py-2"
            placeholder="Add a skill and press Enter"
            value={filterOptions.skills}
            onChange={(val) =>
              setFilterOptions({
                ...filterOptions,
                skills: [...val],
              })
            }
          />

          <SelectDropdown
            label="Experience (Years)"
            placeholder="Select Years"
            options={[...Array(40).keys()].map((num) => ({
              label: (num + 1).toString(),
              value: (num + 1).toString(),
            }))}
            value={filterOptions.experienceYears}
            onChange={(val) =>
              setFilterOptions({ ...filterOptions, experienceYears: val })
            }
          />

          <SelectDropdown
            label="Experience (Months)"
            placeholder="Select Months"
            options={[...Array(12).keys()].map((num) => ({
              label: (num + 1).toString(),
              value: (num + 1).toString(),
            }))}
            value={filterOptions.experienceMonths}
            onChange={(val) =>
              setFilterOptions({ ...filterOptions, experienceMonths: val })
            }
          />

          <NumberInput
            label="Age"
            cssClasses="py-2"
            placeholder="Enter Age"
            value={filterOptions.age}
            onChange={(val) => setFilterOptions({ ...filterOptions, age: val })}
          />
          <Input
            type="text"
            label="Current Location"
            placeholder="Enter Current Location"
            className="w-full border px-3 py-2 rounded-md"
            value={filterOptions.currentLocation}
            onChange={(e) =>
              setFilterOptions({
                ...filterOptions,
                currentLocation: e.target.value,
              })
            }
          />
          <SelectDropdown
            label="Gender"
            placeholder="Select Gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
            value={filterOptions.gender}
            onChange={(val) =>
              setFilterOptions({ ...filterOptions, gender: val })
            }
          />

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterOptions.defenceBackground}
              onChange={(e) =>
                setFilterOptions({
                  ...filterOptions,
                  defenceBackground: e.target.checked,
                })
              }
            />
            Defence Background
          </label>
        </div>
      </Dialog>
    </div>
  );
};

export default CandidatesPage;
