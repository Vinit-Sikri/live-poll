import mongoose, { Document, Schema } from "mongoose";

export interface IPoll extends Document {
  question: string;
  options: string[];
  correctOptionIndex: number;
  startTime: Date;
  duration: number;
  isActive: boolean;
}

const PollSchema: Schema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPoll>("Poll", PollSchema);