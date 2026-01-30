'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Instância direta para evitar erros de importação se o utils/client nao existir
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            alert('Erro: ' + error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo / Brand */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold uppercase tracking-tighter text-white">
                        Turbinados
                        <span className="text-red-600">.</span>
                    </h1>
                    <p className="text-xs text-white/40 tracking-widest uppercase">Acesso Restrito</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-sm backdrop-blur-sm">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-wider text-white/50 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-red-600 focus:outline-none transition-all placeholder-white/20"
                                placeholder="admin@turbinados.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-wider text-white/50 block">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-sm py-3 px-4 text-sm text-white focus:border-red-600 focus:outline-none transition-all placeholder-white/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Entrar no Sistema"
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] text-white/20 font-mono">
                        SECURE SYSTEM // GARAGE ACCESS ONLY
                    </p>
                </div>
            </div>
        </div>
    )
}
