"use client";

type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export default function DataTable<T>({
  data,
  columns,
  page,
  totalPages,
  onPageChange,
  loading,
}: DataTableProps<T>) {
  const skeletonRows = 5;

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-6 py-4 text-sm font-semibold text-gray-700"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              // 🔥 Skeleton Loader
              [...Array(skeletonRows)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition"
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm text-gray-600">
                      {col.render
                        ? col.render(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="text-center py-10 text-gray-400"
                  colSpan={columns.length}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
             className={`px-3 py-1.5 border rounded-md text-sm disabled:opacity-40 ${page === 1 ? "!cursor-not-allowed" : ""}`}
          >
            Prev
          </button>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
             className={`px-3 py-1.5 border rounded-md text-sm disabled:opacity-40 ${page === 1 ? "!cursor-not-allowed" : ""}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}