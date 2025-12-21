import mongoose from "mongoose";

const bulletinSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

export default mongoose.model("Bulletin", bulletinSchema);
