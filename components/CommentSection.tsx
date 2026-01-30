"use client";

import { useState, useRef, useEffect, useOptimistic, useTransition } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Comment, addComment } from "@/app/actions/comments";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSectionProps {
    projectId: string;
    initialComments: Comment[];
    currentUserEmail?: string;
}

export default function CommentSection({ projectId, initialComments, currentUserEmail }: CommentSectionProps) {
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPending, startTransition] = useTransition();

    // Optimistic UI
    const [optimisticComments, addOptimisticComment] = useOptimistic(
        initialComments,
        (state: Comment[], newComment: Comment) => [...state, newComment]
    );

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [optimisticComments]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const content = inputValue;

        // Create temporary comment for optimistic update
        const tempComment: Comment = {
            id: Math.random().toString(), // Temporary ID
            content: content,
            created_at: new Date().toISOString(),
            project_id: projectId,
            user_id: "me", // Placeholder
            user_email: currentUserEmail || "me@turbinados.com",
            user: currentUserEmail ? { email: currentUserEmail } : undefined
        };

        startTransition(() => {
            addOptimisticComment(tempComment);
        });

        // Server Action
        const response = await addComment(projectId, content);

        if (response?.error) {
            alert(response.error);
            return;
        }

        // Only clear if success
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400/80">
                <MessageSquare size={16} />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">Comentários da Equipe</h3>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-sm flex flex-col h-80">
                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                >
                    {optimisticComments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-2">
                            <MessageSquare size={24} />
                            <span className="text-xs font-mono uppercase">Nenhum comentário ainda</span>
                        </div>
                    ) : (
                        optimisticComments.map((comment) => {
                            const email = comment.user?.email || comment.user_email;
                            const isMe = email === currentUserEmail;
                            return (
                                <div
                                    key={comment.id}
                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                >
                                    <span className="text-[10px] text-zinc-500 mb-1 px-1">
                                        {email?.split('@')[0]}
                                    </span>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${isMe
                                            ? "bg-red-900/40 border border-red-700/50 text-white rounded-tr-none"
                                            : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-none"
                                            }`}
                                    >
                                        {comment.content}
                                    </motion.div>
                                    <span className="text-[9px] text-zinc-600 mt-1 px-1 font-mono">
                                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escreva um comentário..."
                        disabled={isPending}
                        className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-all placeholder-white/20 font-mono disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isPending}
                        className={`p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/40 rounded hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 self-end ${isPending ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}
