import mongoose, { Schema, Document } from "mongoose";

export interface IState extends Document {
  name: string;
}

const StateSchema: Schema<IState> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const State =
  mongoose.models.State || mongoose.model<IState>("State", StateSchema);
export default State;
