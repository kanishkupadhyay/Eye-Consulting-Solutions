"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CandidateDetailCard from "../CandidateDetailCard/CandidateDetailCard";
import getCandidates from "@/services/frontend/get-candidates";
import { ICandidate } from "@/models/candidate.model";
import CandidateSkeleton from "./CandidateSkeleton";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { Sliders } from "lucide-react";
import Dialog from "../Dialog/Dialog";

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
  const [filterOptions, setFilterOptions] = useState({
    keywords: "",
    experience: "",
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

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Top bar with filter button */}
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold">Candidates</h2>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-md transition text-white"
          title="Filter Candidates"
        >
          <Sliders className="w-4 h-4" />
          Filter
        </button>
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
        onConfirm={() => {}}
        title="Filter Candidates"
        confirmText="Apply"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Keywords"
            className="w-full border px-3 py-2 rounded-md"
            value={filterOptions.keywords}
            onChange={(e) =>
              setFilterOptions({ ...filterOptions, keywords: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Experience (Years)"
            className="w-full border px-3 py-2 rounded-md"
            value={filterOptions.experience}
            onChange={(e) =>
              setFilterOptions({ ...filterOptions, experience: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Age"
            className="w-full border px-3 py-2 rounded-md"
            value={filterOptions.age}
            onChange={(e) =>
              setFilterOptions({ ...filterOptions, age: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Current Location"
            className="w-full border px-3 py-2 rounded-md"
            value={filterOptions.currentLocation}
            onChange={(e) =>
              setFilterOptions({ ...filterOptions, currentLocation: e.target.value })
            }
          />
          <select
            className="w-full border px-3 py-2 rounded-md"
            value={filterOptions.gender}
            onChange={(e) =>
              setFilterOptions({ ...filterOptions, gender: e.target.value })
            }
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterOptions.defenceBackground}
              onChange={(e) =>
                setFilterOptions({ ...filterOptions, defenceBackground: e.target.checked })
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