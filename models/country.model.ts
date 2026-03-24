import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  dialCode: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  currencyCode: {
    type: String,
    required: true,
  },
  flagUrl: {
    type: String,
    required: true,
  },
});

export const Country =
  mongoose.models.Country || mongoose.model("Country", countrySchema);
