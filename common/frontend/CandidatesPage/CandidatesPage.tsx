"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import CandidateDetailCard from "../CandidateDetailCard/CandidateDetailCard";
import getCandidates from "@/services/frontend/get-candidates";
import { ICandidate } from "@/models/candidate.model";
import CandidateSkeleton from "./CandidateSkeleton";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { CrossIcon, Sliders } from "lucide-react";
import Dialog from "../Dialog/Dialog";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../Button/Button";
import getCitiesByState from "@/services/frontend/get-cities-by-state";
import { useAuth } from "@/context/AuthContext";
import RangeSlider from "../RangeSlider/RangeSlider";

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
    experience: { min: number; max: number } | null;
    age: string;
    state: { id: string; name: string } | null;
    city: { id: string; name: string } | null;
    gender: string;
    defenseBackgroundCheck: boolean;
  }>({
    experience: null,
    age: "",
    state: null,
    city: null,
    gender: "",
    defenseBackgroundCheck: false,
  });
  const [draftFilterOptions, setDraftFilterOptions] = useState(filterOptions);

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
      experience: searchParams.get("experienceMin")
        ? {
            min: Number(searchParams.get("experienceMin")),
            max: Number(searchParams.get("experienceMax")),
          }
        : null,
      age: searchParams.get("age") || "",
      state:
        indianStates?.find(
          (state) => state.name === searchParams.get("state"),
        ) || null,
      city:
        cities?.find((city) => city.name === searchParams.get("city")) || null,
      gender: searchParams.get("gender") || "",
      defenseBackgroundCheck:
        searchParams.get("defenseBackgroundCheck") === "true",
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
          defenseBackgroundCheck: updatedFilters.defenseBackgroundCheck,
          experience: updatedFilters.experience
            ? {
                min: updatedFilters.experience.min,
                max: updatedFilters.experience.max,
              }
            : undefined,
          age: updatedFilters.age
            ? {
                min: Number(updatedFilters.age.split("-")[0]),
                max: Number(updatedFilters.age.split("-")[1]),
              }
            : undefined,
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
        defenseBackgroundCheck: filterOptions.defenseBackgroundCheck,
        experience: filterOptions.experience
          ? {
              min: filterOptions.experience.min,
              max: filterOptions.experience.max,
            }
          : undefined,
        age: filterOptions.age
          ? {
              min: Number(filterOptions.age.split("-")[0]),
              max: Number(filterOptions.age.split("-")[1]),
            }
          : undefined,
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

    if (draftFilterOptions.experience) {
      params.set("experienceMin", draftFilterOptions.experience.min.toString());
      params.set("experienceMax", draftFilterOptions.experience.max.toString());
    }
    if (draftFilterOptions.age) params.set("age", draftFilterOptions.age);
    if (draftFilterOptions.state)
      params.set("state", draftFilterOptions.state?.name);
    if (draftFilterOptions.city)
      params.set("city", draftFilterOptions.city?.name);
    if (draftFilterOptions.gender)
      params.set("gender", draftFilterOptions.gender);
    if (draftFilterOptions.defenseBackgroundCheck)
      params.set("defenseBackgroundCheck", "true");

    router.replace(`/candidates?${params.toString()}`, { scroll: false });
    setIsFilterOpen(false);
  };

  useEffect(() => {
    if (isFilterOpen) {
      const fetchCities = async () => {
        if (!draftFilterOptions.state) {
          setCities([]);
          return;
        }
        try {
          const res = await getCitiesByState(draftFilterOptions.state?.id);
          setCities(res);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };

      fetchCities();
    }
  }, [draftFilterOptions.state, isFilterOpen]);

  const hasActiveFilters = useMemo(() => {
    const keys = [
      "experienceMin",
      "experienceMax",
      "age",
      "state",
      "city",
      "gender",
      "defenseBackgroundCheck",
    ];

    return keys.some((key) => searchParams.get(key));
  }, [searchParams]);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold">Candidates</h2>
        <div className="flex w-full justify-end gap-[20px]">
          <Button
            onClick={() => {
              setDraftFilterOptions(filterOptions);
              setIsFilterOpen(true);
            }}
            className="max-w-[120px] !py-2"
            title="Filter Candidates"
          >
            <Sliders className="w-4 h-4" />
            Filter
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={() => {
                // Clear all filters
                setFilterOptions({
                  experience: null,
                  age: "",
                  state: null,
                  city: null,
                  gender: "",
                  defenseBackgroundCheck: false,
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
          No candidates have been found.
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
          <RangeSlider
            label="Age"
            value={
              draftFilterOptions.age
                ? [
                    Number(draftFilterOptions.age.split("-")[0]),
                    Number(draftFilterOptions.age.split("-")[1]),
                  ]
                : undefined // <-- do not use [0,0]
            }
            min={18}
            max={65}
            step={1}
            onChange={(val) =>
              setDraftFilterOptions({
                ...draftFilterOptions,
                age: val ? `${val[0]}-${val[1]}` : "", // optional
              })
            }
          />

          <RangeSlider
            label="Experience (Years)"
            value={
              draftFilterOptions.experience
                ? [
                    Number(draftFilterOptions.experience.min),
                    Number(draftFilterOptions.experience.max),
                  ]
                : undefined
            }
            min={0}
            max={40}
            step={1}
            onChange={(val) =>
              setDraftFilterOptions({
                ...draftFilterOptions,
                experience: val ? { min: val[0], max: val[1] } : null,
              })
            }
          />

          <SelectDropdown
            label="State"
            searchable={true}
            options={indianStates?.map((state) => ({
              label: state.name,
              value: state.id,
            }))}
            value={draftFilterOptions.state?.id || ""}
            onChange={(val) => {
              setDraftFilterOptions({
                ...draftFilterOptions,
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
            value={draftFilterOptions.city?.id || ""}
            onChange={(val) =>
              setDraftFilterOptions({
                ...draftFilterOptions,
                city: cities.find((city) => city.id === val) || null,
              })
            }
            placeholder={
              draftFilterOptions.state ? "Select City" : "Select State first"
            }
            disabled={!draftFilterOptions.state}
          />
          {!draftFilterOptions.state && (
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
            value={draftFilterOptions.gender}
            onChange={(val) =>
              setDraftFilterOptions({ ...draftFilterOptions, gender: val })
            }
          />

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={draftFilterOptions.defenseBackgroundCheck}
              onChange={(e) =>
                setDraftFilterOptions({
                  ...draftFilterOptions,
                  defenseBackgroundCheck: e.target.checked,
                })
              }
            />
            Defense Background
          </label>
        </div>
      </Dialog>
    </div>
  );
};

export default CandidatesPage;
