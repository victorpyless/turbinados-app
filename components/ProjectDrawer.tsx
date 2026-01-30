"use client";

import { motion } from "framer-motion";
import { X, Car, FileText, ExternalLink, Save, Link as LinkIcon, Flame, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Project } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { generateIdeas, BrainstormData } from "@/app/actions/brainstorm";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/app/actions/projects";
import { Camera, Trash } from "lucide-react";

interface ProjectDrawerProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Project>) => void;
}

export default function ProjectDrawer({ project, isOpen, onClose, onSave }: ProjectDrawerProps) {
    // State
    const router = useRouter();
    const [notes, setNotes] = useState(project?.notes || "");
    const [driveLink, setDriveLink] = useState(project?.driveLink || "");
    const [priority, setPriority] = useState(project?.priority || false);
    const [isSavingPriority, setIsSavingPriority] = useState(false);

    // Upload & Delete State
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !project) return;

        const file = e.target.files[0];
        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${project.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('project-covers')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-covers')
                .getPublicUrl(filePath);

            // 3. Update DB
            const { error: dbError } = await supabase
                .from('projects')
                .update({ thumbnail_url: publicUrl })
                .eq('id', project.id);

            if (dbError) throw dbError;

            // 4. Refresh & Notify
            onSave({ thumbnailUrl: publicUrl }); // Optimistic / Parent update
            router.refresh();

        } catch (error) {
            console.error("Upload error:", error);
            alert("Erro ao enviar imagem.");
        } finally {
            setIsUploading(false);
        }
    };

    // Delete Handler
    const handleDelete = async () => {
        if (!confirm("Tem certeza? Esta ação é irreversível 🚨")) return;
        if (!project) return;

        setIsDeleting(true);
        const result = await deleteProject(project.id);

        if (result.success) {
            onClose();
            router.refresh();
        } else {
            alert(result.error);
            setIsDeleting(false);
        }
    };

    // Brainstorm AI Logic
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [aiIdeas, setAiIdeas] = useState<BrainstormData | null>(null); // Updated Type
    const [copiedIndex, setCopiedIndex] = useState<{ type: 'title' | 'prompt', index: number } | null>(null);

    const handleGenerateIdeas = async () => {
        if (!project?.carModel) return;
        setIsGeneratingIdeas(true);
        setAiIdeas(null); // Reset previous ideas

        try {
            const result = await generateIdeas(project.carModel);

            if (result.success && result.data) {
                setAiIdeas(result.data);
            } else {
                alert(result.error || "Erro desconhecido ao gerar ideias.");
            }
        } catch (err) {
            console.error("Frontend Error:", err);
            alert("Erro crítico ao conectar com o servidor.");
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const copyToClipboard = (text: string, type: 'title' | 'prompt', index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex({ type, index });
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Reset state when project changes
    useEffect(() => {
        if (project) {
            setNotes(project.notes || "");
            setDriveLink(project.driveLink || "");
            setPriority(project.priority || false);
            setAiIdeas(null); // Reset AI ideas
        }
    }, [project]);

    if (!project) return null;

    const handleSave = () => {
        onSave({ notes, driveLink, priority });
        router.refresh();
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
            router.refresh();
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
                className="fixed top-0 right-0 z-50 h-full w-full sm:max-w-xl overflow-y-auto bg-black/95 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
                    <div className="space-y-4">
                        {/* Cover Image Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-md flex items-center justify-center cursor-pointer hover:border-white/30 transition-all overflow-hidden group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />

                            {project.thumbnailUrl ? (
                                <>
                                    <img src={project.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-all" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                </>
                            ) : null}

                            <div className="flex flex-col items-center gap-2 relative z-10 text-white/50 group-hover:text-white transition-colors">
                                {isUploading ? <Loader2 className="animate-spin" /> : <Camera />}
                                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                                    {isUploading ? "Enviando..." : (project.thumbnailUrl ? "Alterar Capa" : "Adicionar Capa")}
                                </span>
                            </div>
                        </div>

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

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-between">
                                Veículo / Modelo
                                <button
                                    onClick={handleGenerateIdeas}
                                    disabled={isGeneratingIdeas || !project.carModel}
                                    className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingIdeas ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                    {isGeneratingIdeas ? "🧠 Pensando..." : "Brainstorm IA"}
                                </button>
                            </label>
                            <div className="relative group">
                                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={project.carModel}
                                    onChange={(e) => onSave({ carModel: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 pl-10 text-sm text-white focus:border-turbinados-red focus:outline-none transition-all placeholder-neutral-600 font-mono"
                                    placeholder="Ex: Porsche 911 GT3 RS"
                                />
                            </div>

                            {/* AI Suggestions Area */}
                            {aiIdeas && (
                                <div className="mt-4 p-4 bg-neutral-900/50 border border-indigo-500/20 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">

                                    {/* Titles */}
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles size={10} /> Sugestões de Títulos
                                        </h4>
                                        <ul className="space-y-2">
                                            {aiIdeas.titles.map((title, idx) => (
                                                <li key={idx} className="group flex items-center gap-2 p-2 bg-black/40 rounded border border-neutral-800 hover:border-indigo-500/30 transition-colors">
                                                    <span className="text-xs text-neutral-300 flex-1 font-medium">{title}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(title, 'title', idx)}
                                                        className="text-neutral-500 hover:text-white transition-colors p-1"
                                                        title="Copiar title"
                                                    >
                                                        {copiedIndex?.type === 'title' && copiedIndex.index === idx ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Prompts */}
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles size={10} /> Prompts de Thumbnail (Midjourney)
                                        </h4>
                                        <ul className="space-y-2">
                                            {aiIdeas.prompts.map((prompt, idx) => (
                                                <li key={idx} className="group flex flex-col gap-2 p-2 bg-black/40 rounded border border-neutral-800 hover:border-indigo-500/30 transition-colors">
                                                    <span className="text-[10px] text-neutral-400 font-mono leading-relaxed">{prompt}</span>
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => copyToClipboard(prompt, 'prompt', idx)}
                                                            className="text-neutral-500 hover:text-white transition-colors p-1 flex items-center gap-1 text-[10px]"
                                                        >
                                                            {copiedIndex?.type === 'prompt' && copiedIndex.index === idx ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                            Copiar
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
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
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-sm flex items-center justify-center"
                        title="Deletar Projeto"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-turbinados-red hover:text-white transition-all rounded-sm flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        Salvar Alterações
                    </button>
                </div>

            </motion.div >
        </>
    );
}
