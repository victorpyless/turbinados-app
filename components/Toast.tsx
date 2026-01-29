"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-[#111] border border-green-500/30 px-6 py-4 rounded-sm shadow-2xl shadow-green-500/10"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full animate-pulse"></div>
                        <Rocket className="w-5 h-5 text-green-500 relative z-10" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">SUCESSO</h4>
                        <p className="text-xs text-white/60 font-mono">{message}</p>
                    </div>

                    {/* Progress Bar Timer */}
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-[2px] bg-green-500"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
