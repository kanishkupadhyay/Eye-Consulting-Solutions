"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CandidateDetailCard from "../CandidateDetailCard/CandidateDetailCard";
import getCandidates from "@/services/frontend/get-candidates";
import { ICandidate } from "@/models/candidate.model";
import CandidateSkeleton from "./CandidateSkeleton";

interface CandidateWithExtras extends ICandidate {
  status?: string;
  role?: string;
  rating?: number;
}

const LIMIT = 20;

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState<CandidateWithExtras[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track loaded IDs to avoid duplicates
  const loadedIds = useRef(new Set<string>());

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCandidateRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCandidates({ page, limit: LIMIT });
        if (response.success) {
          const newCandidates: CandidateWithExtras[] = response.data
            .map((c: any) => ({
              ...c,
              createdBy: c.createdBy?._id || c.createdBy || "", // convert ObjectId to string
              status: c.status || "New",
              role: c.role || "Unknown Role",
              rating: c.rating ?? 0,
            }))
            // Filter duplicates
            .filter((c: CandidateWithExtras) => {
              if (loadedIds.current.has((c as any)._id)) {
                return false;
              }
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
    };

    fetchCandidates();
  }, [page]);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => {
        return (
          <CandidateDetailCard
            key={candidate._id as unknown as string}
            candidate={candidate}
            role={candidate.role || "Unknown Role"}
            rating={candidate.rating ?? 0}
            onViewProfile={() => console.log("View Profile", candidate.name)}
            onSchedule={() => console.log("Schedule", candidate.name)}
            onMoveStage={() => console.log("Move Stage", candidate.name)}
            status={"New"}
          />
        );
      })}

      {loading &&
        Array.from({ length: 10 }).map((_, idx) => (
          <CandidateSkeleton key={idx} />
        ))}

      {error && <div className="text-red-500 col-span-full">{error}</div>}
    </div>
  );
};

export default CandidatesPage;
