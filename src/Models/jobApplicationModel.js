import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    gender: { type: String, default: "NA" },
    skills: {
      type: [String],
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["shortlisted", "rejected", "view", "viewed"],
      default: "view",
    },
    resume: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
