"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Login() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            // Success
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Falha na autenticação");
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden font-sans">

            {/* Background Texture (Optional) */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

            {/* Login Card (Visionary: Minimalist Dark) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm"
            >
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            TURBINADOS<span className="text-red-600">.</span>
                        </h1>
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em]">
                            Gestão de Produção Automotiva
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Error Alert */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-xs flex items-center gap-2"
                            >
                                <AlertTriangle size={14} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">
                                    Email Corporativo
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-zinc-300 transition-colors" size={16} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded py-3 pl-10 pr-4 placeholder-zinc-700 focus:border-red-600 focus:outline-none focus:bg-zinc-900 transition-all"
                                        placeholder="admin@turbinados.com.br"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">
                                    Senha de Acesso
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-zinc-300 transition-colors" size={16} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded py-3 pl-10 pr-4 placeholder-zinc-700 focus:border-red-600 focus:outline-none focus:bg-zinc-900 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Autenticando..." : "Entrar"}
                            {!isLoading && <ChevronRight size={14} />}
                        </button>

                    </form>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] text-zinc-700 font-mono tracking-wide">
                        Restrito para equipe autorizada
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
