import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
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
      enum: ["Male", "Female", "Other"],
    },
    currentLocation: {
      type: String,
      trim: true,
      index: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    defenceBackgroundCheck: {
      type: Boolean,
      default: false,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);
export default Candidate;