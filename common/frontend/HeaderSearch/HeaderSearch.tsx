"use client";

import { Search, SearchIcon } from "lucide-react";
import { useState } from "react";
import Button from "../Button/Button";

export function HeaderSearch({
  onSearch,
  onClickSearch,
}: {
  onSearch?: (val: string) => void;
  onClickSearch?: () => void;
}) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex items-center gap-2">
      {/* Search input box */}
      <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-300 flex-1">
        <Search size={16} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search candidates jobs..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="bg-transparent outline-none text-sm flex-1"
        />
      </div>

      {/* Search button outside input */}
      <Button
        disabled={!searchValue.trim()}
        onClick={() => onClickSearch?.()}
        className="flex items-center justify-center px-4 py-2"
      >
        <SearchIcon size={16} />
      </Button>
    </div>
  );
}
