"use client";

import { useMemo, useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    defaultDropAnimationSideEffects,
    DropAnimation
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Project } from "@/types/project";
import SortableVideoCard from "./SortableVideoCard";
import { VideoCard } from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import { useKanbanDrag } from "@/hooks/useKanbanDrag";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
// import ProjectDrawer from "./ProjectDrawer";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const ProjectDrawer = dynamic(() => import("./ProjectDrawer"), { ssr: false });

// Droppable Column Wrapper
function DroppableColumn({ id, children, projectCount, isLoading }: { id: string; children: React.ReactNode, projectCount: number, isLoading: boolean }) {
    const { setNodeRef } = useDroppable({ id });

    const titles: Record<string, string> = {
        pauta: "PAUTA / IDEIA",
        agendamento: "AGENDAMENTO",
        captacao: "CAPTAÇÃO",
        edicao: "EDIÇÃO (LEO)",
        revisao: "REVISÃO FINAL",
        publicado: "PUBLICADO",
    };

    return (
        <div ref={setNodeRef} className="min-w-[320px] h-full flex flex-col bg-neutral-900/20 border border-neutral-800/50 rounded-sm">
            {/* Column Header */}
            <div className="p-3 border-b border-neutral-800 flex justify-between items-center bg-garage-surface/50">
                <h2 className="font-mono text-sm font-bold tracking-widest text-text-secondary uppercase">
                    {"//"} {titles[id] || id}
                </h2>
                <span className="text-xs font-mono text-neutral-600">
                    {projectCount}
                </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <>
                        <VideoCardSkeleton />
                        <VideoCardSkeleton />
                        <VideoCardSkeleton />
                    </>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

interface KanbanBoardProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onDeleteProject: (id: string) => void;
    showToast: (message: string) => void;
    searchTerm?: string;
    onlyPriority?: boolean;
}

export default function KanbanBoard({ projects, setProjects, onDeleteProject, showToast, searchTerm = "", onlyPriority = false }: KanbanBoardProps) {
    // Filter Logic
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.carModel.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = onlyPriority ? p.priority === true : true;
            return matchesSearch && matchesPriority;
        });
    }, [projects, searchTerm, onlyPriority]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Fetch Data on Load
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Map DB keys to CamelCase if necessary? 
                // Assuming Supabase returns snake_case, we might need to map it if our type is camelCase.
                // For simplicity, let's assume valid mapping or use 'as any' casting for the MVP if schema matches closely.
                // Our Project type: title, carModel, status, date, isDelayed...
                // DB likely: title, car_model, status, date, is_delayed...
                // Ideally, we map it.

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedProjects: Project[] = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    carModel: d.car_model || d.carModel, // Fallback
                    status: d.status,
                    date: d.date,
                    thumbnailUrl: d.thumbnail_url || "",
                    isDelayed: d.is_delayed || false,
                    year: d.year,
                    color: d.color,
                    notes: d.notes,
                    driveLink: d.drive_link,
                    priority: d.priority || false // Assuming 'priority' column exists, default to false
                }));
                setProjects(mappedProjects);
            }
            setIsLoading(false);
        };

        fetchProjects();
    }, [setProjects]);

    // Handle DB Updates (Engineer)
    const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
        // Optimistic Update
        setProjects((prev) => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        // Map updates to snake_case
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.carModel) dbUpdates.car_model = updates.carModel;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.driveLink !== undefined) dbUpdates.drive_link = updates.driveLink;

        const { error } = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("Error updating project:", error);
            // Ideally revert optimistic UI here
        } else {
            // If relevant, trigger toast for manual saves (not drag usually, but we can check keys)
            if (updates.notes !== undefined || updates.driveLink !== undefined) {
                showToast("💾 Dados atualizados para a equipe");
            }
        }
    };

    const { sensors, handleDragOver, handleDragEnd } = useKanbanDrag(projects, setProjects, handleUpdateProject);
    const [activeId, setActiveId] = useState<string | null>(null);

    const activeProject = useMemo(
        () => projects.find((p) => p.id === activeId),
        [activeId, projects]
    );

    const columns = useMemo(() => {
        const cols = ["pauta", "agendamento", "captacao", "edicao", "revisao", "publicado"];
        return cols;
    }, []);

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={({ active }) => setActiveId(active.id as string)}
                onDragOver={handleDragOver}
                onDragEnd={(event) => {
                    handleDragEnd(event);
                    setActiveId(null);
                }}
            >
                <div className="h-[calc(100vh-80px)] p-4 md:p-8 bg-garage-dark overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full">
                        {columns.map((colId) => (
                            <DroppableColumn
                                key={colId}
                                id={colId}
                                projectCount={filteredProjects.filter(p => p.status === colId).length}
                                isLoading={isLoading}
                            >
                                <SortableContext
                                    items={filteredProjects.filter(p => p.status === colId).map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {filteredProjects
                                        .filter((p) => p.status === colId)
                                        .map((project) => (
                                            <SortableVideoCard
                                                key={project.id}
                                                project={project}
                                                onSelect={(p) => setSelectedProject(p)}
                                                onDelete={onDeleteProject}
                                            />
                                        ))
                                    }
                                </SortableContext>
                            </DroppableColumn>
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeProject ? (
                        <div className="transform scale-105 shadow-[0_0_30px_rgba(255,59,48,0.3)] rotate-2 cursor-grabbing">
                            <div className="pointer-events-none">
                                <VideoCard
                                    project={activeProject}
                                />
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <AnimatePresence>
                {selectedProject && (
                    <ProjectDrawer
                        project={selectedProject}
                        isOpen={!!selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onSave={(updates) => handleUpdateProject(selectedProject.id, updates)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
