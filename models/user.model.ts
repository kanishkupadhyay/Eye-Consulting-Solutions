import mongoose from "mongoose";
import ResultErrorMessage from "@/common/backend/error.message";
import { createHashPassword } from "@/common/backend/utils";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      // required: true,
      default: "+91",
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      minlength: [10, ResultErrorMessage.PhoneNumberIsInvalid],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await createHashPassword(this.password);
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
