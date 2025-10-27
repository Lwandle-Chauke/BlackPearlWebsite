import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// POST new feedback
router.post("/", async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ success: true, message: "Feedback submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET all feedback
router.get("/", async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE feedback
router.delete("/:id", async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Feedback deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
