import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: if feedback is from a logged-in user
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);
