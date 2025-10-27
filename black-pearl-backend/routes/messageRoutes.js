import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// POST new message
router.post("/", async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({ success: true, message: "Message saved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET all messages
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH mark as read/unread
router.patch("/:id", async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE message
router.delete("/:id", async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
