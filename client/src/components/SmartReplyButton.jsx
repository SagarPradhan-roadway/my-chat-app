import React, { useState, useContext } from 'react';
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const SmartReplyButton = ({ selectedUserId, onSelectSuggestion }) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const handleGenerate = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setSuggestions([]);

        try {
            const { data } = await axios.post(`/api/ai/smart-replies/${selectedUserId}`);
            
            if (data.success && data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions);
            } else {
                toast.error("Could not generate suggestions right now.");
            }
        } catch (error) {
            console.error("AI Generate Error:", error);
            const errMsg = error.response?.data?.message || "Failed to generate suggestions.";
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-start gap-2 mb-2">
            {suggestions.length > 0 ? (
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-xs text-[#8C7B6E] ml-2">✨ AI Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button 
                                key={index}
                                onClick={() => {
                                    onSelectSuggestion(suggestion);
                                    setSuggestions([]); // Clear after selection
                                }}
                                className="text-sm bg-[#D5BDAF] hover:bg-[#C2A58B] text-[#3C1F0D] border border-[#C2A58B] rounded-xl px-3 py-2 text-left transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                        <button 
                            onClick={() => setSuggestions([])}
                            className="text-xs text-[#8C7B6E] hover:text-[#3C1F0D] px-2"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[#C2A58B] transition-colors ${
                        isLoading ? 'bg-[#E3D5CA] text-[#8C7B6E] cursor-not-allowed' : 'bg-[#E3D5CA] hover:bg-[#D5BDAF] text-[#3C1F0D]'
                    }`}
                >
                    ✨ {isLoading ? "Generating..." : "Smart Replies"}
                </button>
            )}
        </div>
    );
};

export default SmartReplyButton;
