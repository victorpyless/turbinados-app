"use client";

import { motion } from "framer-motion";
import { X, Car, FileText, ExternalLink, Save, Link as LinkIcon, Flame, Loader2 } from "lucide-react";
import { Project } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

interface ProjectDrawerProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Project>) => void;
}

export default function ProjectDrawer({ project, isOpen, onClose, onSave }: ProjectDrawerProps) {
    const [notes, setNotes] = useState(project?.notes || "");
    const [driveLink, setDriveLink] = useState(project?.driveLink || "");
    const [priority, setPriority] = useState(project?.priority || false);
    const [isSavingPriority, setIsSavingPriority] = useState(false);

    // Reset state when project changes
    useEffect(() => {
        if (project) {
            setNotes(project.notes || "");
            setDriveLink(project.driveLink || "");
            setPriority(project.priority || false);
        }
    }, [project]);

    if (!project) return null;

    const handleSave = () => {
        onSave({ notes, driveLink, priority });
    };

    const handlePrioritySave = async (newPriority: boolean) => {
        setIsSavingPriority(true);
        // Direct Persistence
        const { error } = await supabase
            .from('projects')
            .update({ priority: newPriority })
            .eq('id', project.id);

        if (error) {
            console.error("Error saving priority:", error);
            // Revert on error if needed, but for now just logging
        } else {
            // Update Parent UI immediately
            onSave({ priority: newPriority });
        }
        setIsSavingPriority(false);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? "pointer-events-auto" : "pointer-events-none"
                    }`}
            />

            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isOpen ? 0 : "100%" }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-black/95 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
                    <div className="space-y-4">
                        <span className="px-2 py-1 bg-white/10 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-white/80 rounded-sm">
                            ID: {project.id.substring(0, 8)}
                        </span>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white leading-tight uppercase tracking-tight">
                                {project.title}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${project.isDelayed ? "bg-turbinados-red animate-pulse" : "bg-green-500"}`} />
                                <span className="text-xs font-mono text-white/50 uppercase">
                                    Status: <span className="text-white">{project.status}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Visionary: Priority Toggle */}
                        <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/10">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 ${priority ? 'text-turbinados-red' : 'text-neutral-500'}`}>
                                {isSavingPriority ? 'Salvando...' : (priority ? 'Prioridade Alta' : 'Normal')}
                            </span>
                            <button
                                disabled={isSavingPriority}
                                onClick={() => {
                                    const newPriority = !priority;
                                    setPriority(newPriority);
                                    handlePrioritySave(newPriority);
                                }}
                                className={`relative w-10 h-6 rounded-full transition-all duration-300 ${priority ? "bg-turbinados-red shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-neutral-800"} ${isSavingPriority ? "opacity-50 cursor-wait" : ""}`}
                            >
                                <motion.div
                                    layout
                                    className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white flex items-center justify-center p-0.5"
                                    animate={{ x: priority ? 16 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                    {isSavingPriority ? (
                                        <Loader2 size={10} className="text-black animate-spin" />
                                    ) : (
                                        priority && <Flame size={10} className="text-red-600 fill-red-600" />
                                    )}
                                </motion.div>
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-turbinados-red/80">
                            <Car size={16} />
                            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">Dados do Veículo</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-4 rounded-sm border border-white/5">
                                <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Modelo</span>
                                <div className="text-sm font-bold text-white uppercase">{project.carModel}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-sm border border-white/5">
                                <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Data</span>
                                <div className="text-sm font-bold text-white uppercase">{project.date}</div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-400/80">
                            <FileText size={16} />
                            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">Arquivos do Projeto</h3>
                        </div>

                        {/* Strategist: Only show Open button if link exists */}
                        {driveLink && (
                            <a
                                href={driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full group flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 rounded-sm transition-all mb-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-sm">
                                        <ExternalLink size={16} className="text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">ABRIR PASTA</div>
                                        <div className="text-[10px] text-white/40 font-mono">Acessar Arquivos Externos</div>
                                    </div>
                                </div>
                            </a>
                        )}

                        {/* Edit Link Input */}
                        <div className="relative group">
                            <div className="absolute top-3 left-3 text-white/20 group-focus-within:text-blue-400 transition-colors">
                                <LinkIcon size={14} />
                            </div>
                            <input
                                type="text"
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                                placeholder="Cole o link da pasta aqui..."
                                className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none transition-all font-mono"
                            />
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-yellow-500/80">
                            <Save size={16} />
                            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">Briefing & Notas</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-40 bg-white/5 border border-white/10 focus:border-yellow-500/30 rounded-sm p-4 text-sm text-white/80 placeholder-white/20 resize-none font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/10 transition-all leading-relaxed"
                                placeholder="Escreva detalhes sobre o projeto, roteiro ou observações para o editor..."
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] text-white/20 font-mono">
                                {notes.length} chars
                            </div>
                        </div>
                    </section>

                </div>

                <div className="p-6 border-t border-white/10 bg-[#0f0f0f] flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-turbinados-red hover:text-white transition-all rounded-sm flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        Salvar Alterações
                    </button>
                </div>

            </motion.div>
        </>
    );
}
