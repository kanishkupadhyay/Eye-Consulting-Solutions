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
  errors?: ExperienceError[];
}

const emptyExperience: IExperience = {
  company: "",
  role: "",
  startDate: new Date().toString(),
  endDate: null,
  currentlyWorking: false,
  description: "",
};

const ExperienceList: React.FC<Props> = ({ value, onChange, errors = [] }) => {
  const handleChange = (
    index: number,
    field: keyof IExperience,
    val: IExperience[keyof IExperience],
  ) => {
    let updated = [...value];

    // ✅ Only one currently working allowed
    if (field === "currentlyWorking" && val === true) {
      updated = updated.map((item, i) => ({
        ...item,
        currentlyWorking: i === index,
        endDate: i === index ? null : item.endDate,
      }));
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }

    onChange(updated);
  };

  const addItem = () => onChange([...value, { ...emptyExperience }]);

  const removeItem = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const hasCurrent = value.some((e) => e.currentlyWorking);

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
          <h3 className="text-lg font-medium mb-2">
            Experience - {index + 1}
          </h3>

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

          {/* ✅ Currently Working Checkbox */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={exp.currentlyWorking || false}
              disabled={hasCurrent && !exp.currentlyWorking}
              onChange={(e) =>
                handleChange(index, "currentlyWorking", e.target.checked)
              }
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-600">
              Currently Working
            </label>
          </div>

          <div className="flex gap-3">
            <Input
              label="Start Date *"
              type="date"
              cssClasses="py-2"
              value={formatDate(exp.startDate)}
              onChange={(e) =>
                handleChange(
                  index,
                  "startDate",
                  new Date(e.target.value).toString(),
                )
              }
              errorMessage={errors[index]?.startDate || ""}
            />

            {/* ✅ Hide End Date if currently working */}
            {!exp.currentlyWorking && (
              <Input
                label="End Date *"
                type="date"
                cssClasses="py-2"
                value={formatDate(exp.endDate)}
                onChange={(e) =>
                  handleChange(
                    index,
                    "endDate",
                    new Date(e.target.value).toString(),
                  )
                }
                errorMessage={errors[index]?.endDate || ""}
              />
            )}
          </div>

          <Input
            label="Description"
            placeholder="Describe role and responsibilities"
            value={exp.description || ""}
            cssClasses="py-2"
            onChange={(e) =>
              handleChange(index, "description", e.target.value)
            }
          />
        </div>
      ))}

      <Button type="button" className="!w-auto p-[10px]" onClick={addItem}>
        <PlusCircle /> Add Experience
      </Button>
    </div>
  );
};

export default ExperienceList;
