import mongoose, { Schema, Document } from "mongoose";

export interface ICity extends Document {
  name: string;
  state: mongoose.Types.ObjectId; // Reference to State
}

const CitySchema: Schema<ICity> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
});

const City = mongoose.models.City || mongoose.model<ICity>("City", CitySchema);
export default City;