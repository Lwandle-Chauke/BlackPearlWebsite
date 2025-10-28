import express from "express";
import Message from "../models/Message.js";
import emailService from "../services/emailService.js"; // Import email service

const router = express.Router();

// POST new message
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const newMessage = new Message({
            name,
            email,
            subject,
            message,
            read: false,
            createdAt: new Date()
        });

        const savedMessage = await newMessage.save();
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: savedMessage
        });

    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save message'
        });
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
            { read: req.body.read },
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

// POST admin reply to a message
router.post("/:id/reply", async (req, res) => {
    try {
        const { replyContent } = req.body;
        const messageId = req.params.id;

        const originalMessage = await Message.findById(messageId);

        if (!originalMessage) {
            return res.status(404).json({ success: false, error: "Original message not found" });
        }

        await emailService.sendAdminReplyEmail(
            originalMessage.email,
            originalMessage.subject,
            replyContent
        );

        // Optionally, mark the original message as replied or update its status
        // For now, we'll just mark it as read if it wasn't already
        if (!originalMessage.read) {
            originalMessage.read = true;
            await originalMessage.save();
        }

        res.status(200).json({ success: true, message: "Admin reply sent successfully" });

    } catch (error) {
        console.error('Error sending admin reply:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send admin reply'
        });
    }
});

export default router;
