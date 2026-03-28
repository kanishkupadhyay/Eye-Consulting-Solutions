const CandidateSkeleton = () => {
  return (
    <div className="p-4 border border-gray-300 rounded shadow animate-pulse bg-gray-100">
      <div className="h-6 w-1/3 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
    </div>
  );
};

export default CandidateSkeleton;