"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, Zap } from "lucide-react";
import Image from "next/image";

export default function Login() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate Auth Check (Engineer)
        setTimeout(() => {
            document.cookie = "turbinados_auth=true; path=/";
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <main className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
            {/* Background (Visionary: Dark Studio Car) */}
            <div className="absolute inset-0 z-0">
                {/* Placeholder for Car Image - using a dark abstract placeholder for now that fits the vibe */}
                <Image
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2600&auto=format&fit=crop"
                    alt="Garage Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Login Card (Visionary: Glassmorphism) */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 sm:p-10"
            >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-sm border border-white/10 shadow-2xl" />

                <div className="relative z-20 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 bg-turbinados-red rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,59,48,0.5)] animate-pulse">
                                <Zap className="text-white fill-white" size={24} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">TURBINADOS</h1>
                        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Gateway Access v1.0</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Email (Terminal Style) */}
                        <div className="space-y-1 group">
                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest group-focus-within:text-turbinados-red transition-colors flex items-center gap-2">
                                <Mail size={12} /> Email
                            </label>
                            <input
                                type="email"
                                defaultValue="admin@turbinados.com.br"
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:border-turbinados-red focus:outline-none transition-all font-mono"
                                placeholder="user@system.com"
                            />
                        </div>

                        {/* Password (Terminal Style) */}
                        <div className="space-y-1 group">
                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest group-focus-within:text-turbinados-red transition-colors flex items-center gap-2">
                                <Lock size={12} /> Senha
                            </label>
                            <input
                                type="password"
                                defaultValue="123456"
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:border-turbinados-red focus:outline-none transition-all font-mono"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Strategist: Remember Me */}
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-turbinados-red"></div>
                            </label>
                            <span className="text-xs text-white/60">Manter conectado</span>
                        </div>

                        {/* Button (Xenon Effect) */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden rounded-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? "Autenticando..." : "Acessar Sistema"}
                                {!isLoading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>

                    </form>
                </div>
            </motion.div>

            {/* Footer Info */}
            <div className="absolute bottom-6 text-[10px] font-mono text-white/20 uppercase tracking-widest text-center w-full">
                System Secured by Supabase • 2026
            </div>
        </main>
    );
}
