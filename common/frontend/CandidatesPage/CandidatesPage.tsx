"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import CandidateDetailCard from "../CandidateDetailCard/CandidateDetailCard";
import getCandidates from "@/services/frontend/get-candidates";
import { ICandidate } from "@/models/candidate.model";
import CandidateSkeleton from "./CandidateSkeleton";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { CrossIcon, Sliders } from "lucide-react";
import Dialog from "../Dialog/Dialog";
import NumberInput from "../NumberInput/NumberInput";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../Button/Button";
import getCitiesByState from "@/services/frontend/get-cities-by-state";
import { useAuth } from "@/context/AuthContext";

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
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  const { indianStates } = useAuth();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    experienceYears: string;
    experienceMonths: string;
    age: string;
    state: { id: string; name: string } | null;
    city: { id: string; name: string } | null;
    gender: string;
    defenceBackground: boolean;
  }>({
    experienceYears: "",
    experienceMonths: "",
    age: "",
    state: null,
    city: null,
    gender: "",
    defenceBackground: false,
  });

  const loadedIds = useRef(new Set<string>());
  const observer = useRef<IntersectionObserver | null>(null);

  // ✅ LAST ITEM REF (FIX)
  const lastCandidateRef = useCallback(
    (node: HTMLDivElement | null) => {
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

  const router = useRouter();
  const searchParams = useSearchParams();

  // Update filterOptions from URL whenever searchParams changes
  useEffect(() => {
    const updatedFilters = {
      experienceYears: searchParams.get("experienceYears") || "",
      experienceMonths: searchParams.get("experienceMonths") || "",
      age: searchParams.get("age") || "",
      state:
        indianStates?.find(
          (state) => state.name === searchParams.get("state"),
        ) || null,
      city:
        cities?.find((city) => city.name === searchParams.get("city")) || null,
      gender: searchParams.get("gender") || "",
      defenceBackground: searchParams.get("defenceBackground") === "true",
    };

    setFilterOptions(updatedFilters);

    // Reset pagination when filters change
    setCandidates([]);
    setPage(1);
    setHasMore(true);
    loadedIds.current.clear();

    // Directly fetch candidates after URL update
    (async () => {
      setLoading(true);
      try {
        const response = await getCandidates({
          page: 1,
          limit: LIMIT,
          gender: updatedFilters.gender as "Male" | "Female",
          state: updatedFilters.state?.id || "",
          city: updatedFilters.city?.id || "",
        });

        if (response.success) {
          const newCandidates: CandidateWithExtras[] = response.data.map(
            (c: any) => ({
              ...c,
              createdBy: c.createdBy?._id || c.createdBy || "",
              role: c.role || "Unknown Role",
              rating: c.rating ?? 0,
            }),
          );

          setCandidates(newCandidates);
          setHasMore(newCandidates.length < (response.total || 0));
        } else {
          setError("Failed to load candidates");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  // Fetch more candidates
  const fetchCandidates = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getCandidates({
        page,
        limit: LIMIT,
        gender: filterOptions.gender as "Male" | "Female",
        state: filterOptions.state?.id || "",
        city: filterOptions.city?.id || "",
      });

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

        setCandidates((prev) => {
          const updated = [...prev, ...newCandidates];
          setHasMore(updated.length < (response.total || 0));
          return updated;
        });
      } else {
        setError("Failed to load candidates");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, filterOptions, hasMore, loading]);

  // ✅ FIX: Only fetch if page > 1 (no duplicate first fetch)
  useEffect(() => {
    if (page === 1) return;
    fetchCandidates();
  }, [page]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (filterOptions.experienceYears)
      params.set("experienceYears", filterOptions.experienceYears);
    if (filterOptions.experienceMonths)
      params.set("experienceMonths", filterOptions.experienceMonths);
    if (filterOptions.age) params.set("age", filterOptions.age);
    if (filterOptions.state) params.set("state", filterOptions.state?.name);
    if (filterOptions.city) params.set("city", filterOptions.city?.name);
    if (filterOptions.gender) params.set("gender", filterOptions.gender);
    if (filterOptions.defenceBackground)
      params.set("defenceBackground", "true");

    router.replace(`/candidates?${params.toString()}`, { scroll: false });
    setIsFilterOpen(false);
  };

  useEffect(() => {
    if (isFilterOpen) {
      const fetchCities = async () => {
        if (!filterOptions.state) {
          setCities([]);
          return;
        }
        try {
          const res = await getCitiesByState(filterOptions.state?.id);
          setCities(res);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };

      fetchCities();
    }
  }, [filterOptions.state, isFilterOpen]);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold">Candidates</h2>
        <div className="flex w-full justify-end gap-[20px]">
          <Button
            onClick={() => setIsFilterOpen(true)}
            className="max-w-[120px] !py-2"
            title="Filter Candidates"
          >
            <Sliders className="w-4 h-4" />
            Filter
          </Button>

          {Object.entries(filterOptions).some(([_, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "boolean") return value;
            return value !== "";
          }) && (
            <Button
              onClick={() => {
                // Clear all filters
                setFilterOptions({
                  experienceYears: "",
                  experienceMonths: "",
                  age: "",
                  state: null,
                  city: null,
                  gender: "",
                  defenceBackground: false,
                });

                // Remove filters from URL
                router.replace("/candidates", { scroll: false });
              }}
              className="max-w-[150px] !py-2 bg-red-500 hover:bg-red-600 text-white"
              title="Clear Filters"
            >
              <CrossIcon className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {candidates.length === 0 && !loading && !error ? (
        <div className="text-gray-500 text-center col-span-full">
          No candidates have been added yet
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <h6>
            Total <span className="text-orange-500">({candidates.length})</span>
          </h6>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, index) => {
              if (index === candidates.length - 1) {
                return (
                  <div
                    ref={lastCandidateRef}
                    key={`${candidate._id as unknown as string}-${index}`}
                  >
                    <CandidateDetailCard candidate={candidate} />
                  </div>
                );
              }

              return (
                <CandidateDetailCard
                  key={`${candidate._id as unknown as string}-${index}`}
                  candidate={candidate}
                />
              );
            })}

            {loading &&
              Array.from({ length: 12 }).map((_, idx) => (
                <CandidateSkeleton key={idx} />
              ))}

            {error && <div className="text-red-500 col-span-full">{error}</div>}
          </div>
        </div>
      )}

      <Dialog
        isOpen={isFilterOpen}
        onCancel={() => setIsFilterOpen(false)}
        onConfirm={handleApplyFilters}
        title="Filter Candidates"
        confirmText="Apply"
        cancelText="Cancel"
      >
        <div className="space-y-4">
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

          <SelectDropdown
            label="State"
            searchable={true}
            options={indianStates?.map((state) => ({
              label: state.name,
              value: state.id,
            }))}
            value={filterOptions.state?.id || ""}
            onChange={(val) => {
              setFilterOptions({
                ...filterOptions,
                state: indianStates.find((state) => state.id === val) || null,
                city: null, // Reset city when state changes
              }); // reset city
            }}
            placeholder="Select State"
          />

          <SelectDropdown
            label="City"
            containerClasses="!mb-0"
            searchable={true}
            options={cities?.map((city) => ({
              label: city.name,
              value: city.id,
            }))}
            value={filterOptions.city?.id || ""}
            onChange={(val) =>
              setFilterOptions({
                ...filterOptions,
                city: cities.find((city) => city.id === val) || null,
              })
            }
            placeholder={
              filterOptions.state ? "Select City" : "Select State first"
            }
            disabled={!filterOptions.state}
          />
          {!filterOptions.state && (
            <p className="text-orange-500 text-xs mt-1">
              Please select state first{" "}
            </p>
          )}

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
