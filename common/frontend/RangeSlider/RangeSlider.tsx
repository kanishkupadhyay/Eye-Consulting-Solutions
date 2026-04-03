"use client";

import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";
import Input from "../Input/Input";

interface RangeSliderProps {
  label: string;
  value?: [number, number]; // optional
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: [number, number]) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}) => {
  // Validate incoming value against min/max bounds
  const isValidValue =
    value &&
    value.length === 2 &&
    value[0] >= min &&
    value[1] <= max &&
    value[0] <= value[1];

  // Use safe fallback if value is undefined or invalid
  const safeValue: [number, number] = isValidValue ? value! : [min, min];

  const [range, setRange] = useState<[number, number]>(safeValue);

  useEffect(() => {
    setRange(isValidValue ? value! : [min, min]);
  }, [value, min, max, isValidValue]);

  // Active if range is different from default min-min
  const isActive = range[0] !== min || range[1] !== min;

  return (
    <div className="py-2">
      <label className="block text-sm text-gray-500 mb-1">{label}</label>

      <div className="flex items-center gap-4 mb-2">
        <Input
          type="number"
          className="py-2"
          value={range[0]}
          disabled={true}
          min={min}
          max={range[1]}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), range[1]);
            setRange([val, range[1]]);
            onChange([val, range[1]]);
          }}
        />
        <span>-</span>
        <Input
          type="number"
          className="py-2"
          value={range[1]}
          disabled={true}
          min={range[0]}
          max={max}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), range[0]);
            setRange([range[0], val]);
            onChange([range[0], val]);
          }}
        />
      </div>

      <Range
        step={step}
        min={min}
        max={max}
        values={range}
        onChange={(values) => {
          setRange(values as [number, number]);
          onChange(values as [number, number]);
        }}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="h-2 w-full rounded-lg"
            style={{
              ...props.style,
              background: getTrackBackground({
                values: range,
                colors: isActive
                  ? ["#ccc", "#f97316", "#ccc"]
                  : ["#eee", "#eee", "#eee"],
                min,
                max,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            className={`h-5 w-5 rounded-full shadow ${
              isActive ? "bg-orange-500" : "bg-gray-400"
            }`}
          />
        )}
      />
    </div>
  );
};

export default RangeSlider;
