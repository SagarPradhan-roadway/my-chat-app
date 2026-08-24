import { GoogleGenAI } from '@google/genai';
import Message from "../../models/Messages.js";

// Initialize the Google Gen AI client using the new unified SDK
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

export const generateReplies = async (userId, otherUserId) => {
    // 1. Fetch the latest messages between the two users
    const messages = await Message.find({
        $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
        ],
        deletedFor: { $ne: userId }
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Sort chronologically (oldest first for prompt context)
    messages.reverse();
    
    if (messages.length === 0) {
        throw new Error("No conversation history found to generate replies.");
    }
    
    // 2. Format the conversation transcript
    const transcript = messages.map(msg => {
        const role = msg.senderId.toString() === userId.toString() ? "Me" : "Other";
        return `${role}: ${msg.text || (msg.image ? "[Sent an image]" : "")}`;
    }).join("\n");
    
    // 3. Build the prompt
    const prompt = `You are a helpful chat assistant integrated into a messaging app.
Based on the following recent conversation transcript, generate exactly 3 highly relevant and natural reply suggestions that the user ("Me") could send next.

Rules:
- Generate exactly 3 suggestions.
- Keep them concise (1-2 sentences max).
- Match the tone of the conversation.
- Do not invent facts or pretend to know information not present in the chat.
- Do not include emojis unless the conversation already uses them heavily.
- Return ONLY the JSON object with the array of suggestions.

Conversation Transcript:
${transcript}`;

    // 4. Call the LLM API using Gemini 3.6 Flash for speed
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    suggestions: {
                        type: "ARRAY",
                        items: {
                            type: "STRING"
                        }
                    }
                },
                required: ["suggestions"]
            }
        }
    });

    const text = response.text;
    const data = JSON.parse(text);
    
    return data.suggestions;
};
