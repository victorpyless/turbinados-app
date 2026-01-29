import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VideoCard } from "./VideoCard";
import { Project } from "@/types/project";
import { memo } from "react";

interface SortableVideoCardProps {
    project: Project;
    onSelect?: (project: Project) => void;
    onDelete?: (id: string) => void;
}

function SortableVideoCardComponent({ project, onSelect, onDelete }: SortableVideoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: project.id,
        data: {
            type: "Project",
            project,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Strategist: Keep placeholder visible but dim
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <VideoCard
                project={project}
                onClick={() => onSelect?.(project)}
            />
        </div>
    );
}

export default memo(SortableVideoCardComponent);
