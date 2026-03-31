"use client";

import React from "react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { PlusCircle } from "lucide-react";
import { FiTrash2 } from "react-icons/fi";
import { IExperience } from "@/models/candidate.model";

interface ExperienceError {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

interface Props {
  value: IExperience[];
  onChange: (val: IExperience[]) => void;
  errors?: ExperienceError[]; // ✅ Added errors prop
}

const emptyExperience: IExperience = {
  company: "",
  role: "",
  startDate: new Date(),
  endDate: new Date(),
  description: "",
};

const ExperienceList: React.FC<Props> = ({ value, onChange, errors = [] }) => {
  const handleChange = (
    index: number,
    field: keyof IExperience,
    val: IExperience[keyof IExperience]
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const addItem = () => onChange([...value, { ...emptyExperience }]);
  const removeItem = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const formatDate = (date?: Date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  return (
    <div className="space-y-4">
      <label className="mb-1 text-sm font-medium text-gray-500">
        Work Experience
      </label>

      {value.length === 0 && (
        <p className="text-gray-500 text-sm">No experience added yet.</p>
      )}

      {value.map((exp, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-md p-4 space-y-3 relative"
        >
          {/* Section title */}
          <h3 className="text-lg font-medium mb-2">Experience - {index + 1}</h3>

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
              label="Company *"
              placeholder="Enter company name"
              value={exp.company}
              cssClasses="py-2"
              onChange={(e) => handleChange(index, "company", e.target.value)}
              errorMessage={errors[index]?.company || ""}
            />

            <Input
              label="Role *"
              placeholder="Enter role"
              value={exp.role}
              cssClasses="py-2"
              onChange={(e) => handleChange(index, "role", e.target.value)}
              errorMessage={errors[index]?.role || ""}
            />
          </div>

          <div className="flex gap-3">
            <Input
              label="Start Date *"
              type="date"
              placeholder="Select start date"
              cssClasses="py-2"
              value={formatDate(exp.startDate)}
              onChange={(e) =>
                handleChange(index, "startDate", new Date(e.target.value))
              }
              errorMessage={errors[index]?.startDate || ""}
            />

            <Input
              label="End Date"
              type="date"
              placeholder="Select end date"
              cssClasses="py-2"
              value={formatDate(exp.endDate)}
              onChange={(e) =>
                handleChange(index, "endDate", new Date(e.target.value))
              }
              errorMessage={errors[index]?.endDate || ""}
            />
          </div>

          <Input
            label="Description"
            placeholder="Describe role and responsibilities"
            value={exp.description || ""}
            cssClasses="py-2"
            onChange={(e) => handleChange(index, "description", e.target.value)}
          />
        </div>
      ))}

      {/* Add button */}
      <Button type="button" className="!w-auto p-[10px]" onClick={addItem}>
        <PlusCircle /> Add Experience
      </Button>
    </div>
  );
};

export default ExperienceList;