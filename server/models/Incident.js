import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },
    description: String,
    lat: Number,
    lng: Number,
    status: {
      type: String,
      enum: ["PENDING", "UNDER_INVESTIGATION", "RESOLVED"],
      default: "PENDING"
    },
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM"
    },
    image: String, // Base64 encoded image string
    alertedDepartments: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);
