import ResultErrorMessage from "@/common/backend/error.message";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEducation {
  degree: string;
  fieldOfStudy?: string;
  institute: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
}

export interface IExperience {
  startDate: string;
  endDate: string | null;
  company: string;
  role: string;
  currentlyWorking?: boolean;
  description?: string;
}

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: "Male" | "Female";
  currentLocation?: string;
  experienceInMonths?: number;
  education: IEducation[];
  experience: IExperience[];
  skills: string[];
  keywords: string[];
  defenseBackgroundCheck?: boolean;
  resumeUrl: string;
  resumeText?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema<ICandidate> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/,
        ResultErrorMessage.PhoneNumberIsInvalid,
      ],
    },
    age: {
      type: Number,
      min: 18,
      max: 65,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      index: true,
    },
    currentLocation: {
      type: String,
      trim: true,
      index: true,
    },
    experienceInMonths: {
      type: Number,
      min: 0,
      index: true,
    },
    education: {
      type: [
        {
          degree: { type: String, required: true },
          fieldOfStudy: { type: String },
          institute: { type: String, required: true },
          startYear: { type: Number, required: true },
          endYear: { type: Number, required: true },
          grade: { type: String },
        },
      ],
      default: [],
    },

    /* =========================
       Experience
    ========================= */
    experience: {
      type: [
        {
          company: { type: String, required: true },
          role: { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate: { type: Date },
          currentlyWorking: { type: Boolean, default: false },
          description: { type: String },
        },
      ],
      default: [],
    },

    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    defenseBackgroundCheck: {
      type: Boolean,
      default: false,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Text index for searching
CandidateSchema.index({
  name: "text",
  skills: "text",
  keywords: "text",
  resumeText: "text",
});

// Compound index
CandidateSchema.index({ currentLocation: 1, experienceInMonths: -1 });

// Experience search
CandidateSchema.index({ "experience.company": 1 });

// Auto delete after 2 years
CandidateSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 * 2 },
);

const Candidate =
  mongoose.models.Candidate ||
  mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;
