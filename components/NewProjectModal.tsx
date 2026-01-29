"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Type, Car, Save, Upload } from "lucide-react";
import Image from "next/image";

// Zod Schema
const projectSchema = z.object({
    title: z.string().min(5, "Título muito curto (mínimo 5 letras)"),
    carModel: z.string().min(3, "Modelo muito curto"),
    date: z.string().refine((date) => new Date(date) > new Date(), {
        message: "A data deve ser futura",
    }),
    priority: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProjectFormData & { imageFile: File | null }) => void;
}

export default function NewProjectModal({ isOpen, onClose, onSave }: NewProjectModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            priority: false,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const onSubmit = (data: ProjectFormData) => {
        onSave({ ...data, imageFile: selectedFile });
        reset();
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop (Glassmorphism) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header: HUD Style */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-turbinados-red rounded-full animate-pulse shadow-[0_0_8px_#ff3b30]"></div>
                                    <h2 className="text-sm font-bold text-white tracking-widest uppercase font-mono">
                                        {"//"} Inicializar Projeto
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

                                {/* Visionary: Image Dropzone */}
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
                                        Capa do Projeto (Thumbnail)
                                    </label>
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className="relative w-full h-40 border border-dashed border-white/20 rounded-sm hover:border-turbinados-red hover:bg-white/5 transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />

                                        {previewUrl ? (
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors pointer-events-none z-10">
                                                <Upload size={24} />
                                                <span className="text-xs font-mono uppercase tracking-widest">Arrastar foto do veículo</span>
                                            </div>
                                        )}

                                        {/* Overlay Text for Change */}
                                        {previewUrl && (
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                                                <span className="text-xs font-mono text-white uppercase tracking-widest">Trocar Imagem</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Title Input */}
                                    <div className="space-y-1 group">
                                        <label className="text-xs font-mono text-white/40 uppercase tracking-widest group-focus-within:text-turbinados-red transition-colors flex items-center gap-2">
                                            <Type size={12} /> Título do Vídeo
                                        </label>
                                        <input
                                            {...register("title")}
                                            className="w-full bg-black/20 border border-white/10 rounded-sm p-3 text-white placeholder-white/20 focus:border-turbinados-red focus:outline-none transition-all font-bold text-sm"
                                            placeholder="Ex: GOLF GTI MK7 - O RETORNO"
                                        />
                                        {errors.title && <span className="text-red-500 text-xs font-mono">{errors.title.message}</span>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Car Model */}
                                        <div className="space-y-1 group">
                                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest group-focus-within:text-turbinados-red transition-colors flex items-center gap-2">
                                                <Car size={12} /> Veículo
                                            </label>
                                            <input
                                                {...register("carModel")}
                                                className="w-full bg-black/20 border border-white/10 rounded-sm p-3 text-white placeholder-white/20 focus:border-turbinados-red focus:outline-none transition-all text-sm uppercase"
                                                placeholder="VW GOLF MK7"
                                            />
                                            {errors.carModel && <span className="text-red-500 text-xs font-mono">{errors.carModel.message}</span>}
                                        </div>

                                        {/* Date */}
                                        <div className="space-y-1 group">
                                            <label className="text-xs font-mono text-white/40 uppercase tracking-widest group-focus-within:text-turbinados-red transition-colors flex items-center gap-2">
                                                <Calendar size={12} /> Data de Gravação
                                            </label>
                                            <input
                                                {...register("date")}
                                                type="date"
                                                className="w-full bg-black/20 border border-white/10 rounded-sm p-3 text-white placeholder-white/20 focus:border-turbinados-red focus:outline-none transition-all text-sm [color-scheme:dark]"
                                            />
                                            {errors.date && <span className="text-red-500 text-xs font-mono">{errors.date.message}</span>}
                                        </div>
                                    </div>

                                    {/* Priority Toggle */}
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-sm border border-white/5">
                                        <span className="text-xs font-mono text-white/60 uppercase tracking-widest">Alta Prioridade?</span>
                                        <Controller
                                            name="priority"
                                            control={control}
                                            render={({ field }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${field.value ? "bg-turbinados-red" : "bg-white/20"
                                                        }`}
                                                >
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${field.value ? "translate-x-5" : "translate-x-0"
                                                        }`} />
                                                </button>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 bg-transparent border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-mono text-xs uppercase tracking-widest transition-all rounded-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-turbinados-red hover:text-white transition-all rounded-sm flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />
                                        Criar Projeto
                                    </button>
                                </div>

                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
