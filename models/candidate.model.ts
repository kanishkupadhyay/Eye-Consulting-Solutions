import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: "Male" | "Female";
  currentLocation?: string;
  experienceInMonths?: number;
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
        "Please enter a valid phone number",
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

// Compound index for filtering frequently by location and experience
CandidateSchema.index({ currentLocation: 1, experienceInMonths: -1 });

// Model
const Candidate =
  mongoose.models.Candidate ||
  mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;
