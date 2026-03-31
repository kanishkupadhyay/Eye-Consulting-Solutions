"use client";

import React from "react";
import { IEducation } from "@/models/candidate.model";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { PlusCircle } from "lucide-react";
import { FiTrash2 } from "react-icons/fi";
import YearPicker from "../YearPicker/YearPicker";

interface EducationError {
  degree?: string;
  institute?: string;
  startYear?: string;
  endYear?: string;
}

interface Props {
  value: IEducation[];
  onChange: (val: IEducation[]) => void;
  errors?: EducationError[]; // ✅ Added error prop
}

const emptyEducation: IEducation = {
  degree: "",
  fieldOfStudy: "",
  institute: "",
  startYear: undefined,
  endYear: undefined,
  grade: "",
};

const EducationList: React.FC<Props> = ({ value, onChange, errors = [] }) => {
  const handleChange = (
    index: number,
    field: keyof IEducation,
    val: IEducation[keyof IEducation],
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const addItem = () => onChange([...value, { ...emptyEducation }]);
  const removeItem = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <label className="mb-1 text-sm font-medium text-gray-500">
        Education <span className="text-red-500">*</span>
      </label>

      {value.length === 0 && (
        <p className="text-gray-500 text-sm">No education added yet.</p>
      )}

      {value.map((edu, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-md p-4 space-y-3 relative"
        >
          {/* Section Title */}
          <h3 className="text-lg font-medium mb-2">Education - {index + 1}</h3>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-red-600 text-sm font-medium hover:underline"
          >
            <FiTrash2 size={20} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Degree *"
              placeholder="Enter degree"
              value={edu.degree}
              cssClasses="py-2"
              onChange={(e) => handleChange(index, "degree", e.target.value)}
              errorMessage={errors[index]?.degree || ""}
            />

            <Input
              label="Field of Study"
              placeholder="Enter field of study"
              value={edu.fieldOfStudy || ""}
              cssClasses="py-2"
              onChange={(e) =>
                handleChange(index, "fieldOfStudy", e.target.value)
              }
            />
          </div>

          <Input
            label="Institute *"
            placeholder="Enter institute name"
            value={edu.institute}
            cssClasses="py-2"
            onChange={(e) => handleChange(index, "institute", e.target.value)}
            errorMessage={errors[index]?.institute || ""}
          />

          <div className="flex gap-3">
            <YearPicker
              label="Start Year"
              value={edu.startYear}
              onChange={(year) => handleChange(index, "startYear", year)}
              placeholder="Select Start Year"
              minYear={1950}
              maxYear={new Date().getFullYear() + 5}
              errorMessage={errors[index]?.startYear || ""}
            />

            <YearPicker
              label="End Year"
              value={edu.endYear}
              onChange={(year) => handleChange(index, "endYear", year)}
              placeholder="Select End Year"
              minYear={1950}
              maxYear={new Date().getFullYear() + 5}
              errorMessage={errors[index]?.endYear || ""}
            />
          </div>

          <Input
            label="Grade (e.g. 8.5 CGPA / 85%)"
            placeholder="Enter grade"
            cssClasses="py-2"
            value={edu.grade || ""}
            onChange={(e) => handleChange(index, "grade", e.target.value)}
          />
        </div>
      ))}

      {/* Add button */}
      <Button type="button" className="!w-auto p-[10px]" onClick={addItem}>
        <PlusCircle /> Add Education
      </Button>
    </div>
  );
};

export default EducationList;
