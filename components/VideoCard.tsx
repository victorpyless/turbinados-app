import { Calendar, Paperclip, Flame } from 'lucide-react';
import { Project } from '@/types/project';
import Image from 'next/image';
import { memo } from 'react';

interface VideoCardProps {
    project: Project;
    onClick?: () => void;
    onDelete?: () => void;
}

function VideoCardComponent({ project, onClick }: VideoCardProps) {
    // 1. Lógica da Data (Protegida contra erros)
    const dateObj = new Date(project.date);
    const isValidDate = !isNaN(dateObj.getTime());

    const formattedDate = isValidDate
        ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '')
        : '--/--';

    // Verifica se está atrasado (hoje > data do projeto)
    const isLate = isValidDate && (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(dateObj);
        d.setHours(0, 0, 0, 0);
        return today > d;
    })();

    // Cores dinâmicas
    const dateColor = isLate ? 'text-red-500' : 'text-zinc-500';
    const isHighPriority = project.priority === true;

    // Visual Neon para Prioridade
    const priorityClass = isHighPriority
        ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
        : 'border-zinc-800 hover:border-zinc-700';

    return (
        <div
            onClick={onClick}
            className={`relative group bg-zinc-900 border rounded-lg cursor-grab active:cursor-grabbing overflow-hidden transition-all flex flex-col ${priorityClass}`}
        >

            {/* Imagem de Fundo (Se existir) */}
            {/* Cover Image (Top) - If exists */}
            {project.thumbnailUrl ? (
                <div className="relative w-full h-32 rounded-t-sm overflow-hidden bg-black shrink-0">
                    <Image
                        src={project.thumbnailUrl}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={75}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                </div>
            ) : null}

            {/* Conteúdo do Card */}
            <div className={`relative z-10 flex flex-col gap-2 ${project.thumbnailUrl ? "p-3 pt-0" : "p-3"}`}>
                {/* Header: ID e Status */}
                <div className="flex justify-between items-start">
                    <span className="text-[10px] text-zinc-500 font-mono">ID: {project.id.slice(0, 6)}</span>
                    {isHighPriority && <Flame size={14} className="text-red-500 animate-pulse" />}
                </div>

                {/* Título */}
                <div>
                    <h3 className="font-bold text-zinc-100 leading-tight uppercase shadow-black drop-shadow-md">
                        {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 shadow-black drop-shadow-md">
                        {project.carModel}
                    </p>
                </div>

                {/* Rodapé: Data e Link */}
                <div className="flex items-center justify-between mt-1">
                    <div className={`flex items-center gap-1.5 ${dateColor} bg-black/40 px-2 py-1 rounded backdrop-blur-sm`}>
                        <Calendar size={12} />
                        <span className="text-[10px] font-mono font-bold">{formattedDate}</span>
                    </div>
                    {project.driveLink && (
                        <div className="text-blue-400 flex items-center gap-1 text-[10px] bg-blue-950/30 px-2 py-1 rounded border border-blue-500/20">
                            <Paperclip size={10} />
                            <span>CLIPS</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const VideoCard = memo(VideoCardComponent);
