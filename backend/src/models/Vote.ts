import mongoose, { Document, Schema } from "mongoose";

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  studentId: string;
  optionIndex: number;
}

const VoteSchema: Schema = new Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    optionIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent double voting
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IVote>("Vote", VoteSchema);