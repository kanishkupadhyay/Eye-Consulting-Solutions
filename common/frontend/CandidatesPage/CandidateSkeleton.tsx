"use client";

const CandidateSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow max-w-sm flex flex-col justify-between h-full animate-pulse">
      {/* Top */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />

            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Status badge */}
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 w-16 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <div className="h-8 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

export default CandidateSkeleton;
