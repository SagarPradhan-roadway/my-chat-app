import { generateReplies } from "../services/ai/smartReplyService.js";

export const getSmartReplies = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const userId = req.user._id;

        if (!process.env.AI_API_KEY) {
            return res.status(500).json({ success: false, message: "AI API Key is not configured on the server." });
        }

        const suggestions = await generateReplies(userId, otherUserId);
        
        res.json({ success: true, suggestions });
    } catch (error) {
        console.error("AI Smart Reply Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to generate suggestions" });
    }
};
