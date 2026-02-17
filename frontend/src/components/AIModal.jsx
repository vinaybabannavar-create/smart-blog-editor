import { useState, useRef, useEffect } from 'react';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { generateAI } from '../services/api';

export default function AIModal({ isOpen, onClose, onInsert }) {
    if (!isOpen) return null;

    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hi! I'm your AI writing assistant. I can help you draft content, brainstorm ideas, or analyze images. How can I help you today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSend = async () => {
        if (!prompt.trim() && !selectedImage) return;

        const newUserMsg = { role: 'user', content: prompt, image: imagePreview };
        setMessages(prev => [...prev, newUserMsg]);
        setPrompt("");
        setImagePreview(null); // Clear preview from input area, but keep file for sending
        setIsLoading(true);

        try {
            // Create a temporary AI message for streaming
            setMessages(prev => [...prev, { role: 'ai', content: "", isStreaming: true }]);

            const responseStream = await generateAI(newUserMsg.content, selectedImage);

            if (!responseStream) throw new Error("No response body");

            const reader = responseStream.getReader();
            const decoder = new TextDecoder();
            let aiText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiText += chunk;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg.role === 'ai' && lastMsg.isStreaming) {
                        lastMsg.content = aiText;
                    }
                    return newMsgs;
                });
            }

            // Finalize message
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                lastMsg.isStreaming = false;
                return newMsgs;
            });

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
            setSelectedImage(null); // Reset image after sending
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5">
                {/* Header */}
                <div className="h-14 border-b border-[#ececeb] flex items-center justify-between px-4 bg-[#fbfbfa]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            <SparklesIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-[#37352f]">AI Copilot</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[#efefee] rounded-md transition-colors text-[#787774]">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#fff]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-[#efefee] text-[#37352f]'}`}>
                                {msg.role === 'ai' ? <SparklesIcon className="w-4 h-4" /> : 'You'}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-[#f7f6f3] text-[#37352f]' : 'bg-indigo-600 text-white'}`}>
                                {msg.image && (
                                    <img src={msg.image} alt="User upload" className="max-w-full h-auto rounded-lg mb-2 border border-white/20" />
                                )}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                {msg.role === 'ai' && !msg.isStreaming && (
                                    <div className="mt-3 pt-3 border-t border-[#ececeb]/50">
                                        <button
                                            onClick={() => { onInsert(msg.content); onClose(); }}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                                        >
                                            <PaperAirplaneIcon className="w-3 h-3 rotate-90" /> Insert to Editor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-[#ececeb] bg-[#fbfbfa]">
                    {imagePreview && (
                        <div className="relative inline-block mb-2">
                            <img src={imagePreview} alt="Preview" className="h-16 w-auto rounded-lg border border-[#ececeb] shadow-sm" />
                            <button onClick={clearImage} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow border border-[#ececeb] hover:bg-red-50 hover:text-red-500">
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-end gap-2 bg-white p-2 rounded-xl border border-[#ececeb] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
                        <label className="p-2 hover:bg-[#efefee] rounded-lg cursor-pointer text-[#787774] transition-colors">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                            <PhotoIcon className="w-5 h-5" />
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask AI to write, edit, or analyze image..."
                            className="flex-grow max-h-32 bg-transparent border-none outline-none text-sm py-2 px-1 resize-none"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || (!prompt.trim() && !selectedImage)}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
