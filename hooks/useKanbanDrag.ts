import {
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { Project } from "@/types/project";
import { Dispatch, SetStateAction } from "react";

export const useKanbanDrag = (
    projects: Project[],
    setProjects: Dispatch<SetStateAction<Project[]>>,
    onUpdateProject?: (id: string, updates: Partial<Project>) => void
) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the items
        const activeProject = projects.find((p) => p.id === activeId);
        const overProject = projects.find((p) => p.id === overId);

        // If over a column itself (not a project card), we handle that in DragEnd usually, 
        // but for instant feedback/visuals, we might care. 
        // For now, let's focus on reordering arrays.

        if (!activeProject) return;

        // Case 1: Dragging over another item in a different column
        if (overProject && activeProject.status !== overProject.status) {
            setProjects((items) => {
                const activeIndex = items.findIndex((i) => i.id === activeId);
                const overIndex = items.findIndex((i) => i.id === overId);

                if (items[activeIndex].status !== items[overIndex].status) {
                    // Clone to avoid mutation
                    const newItems = [...items];
                    // Change status immediately for visual feedback
                    newItems[activeIndex].status = items[overIndex].status;
                    return arrayMove(newItems, activeIndex, overIndex - 1 >= 0 ? overIndex - 1 : overIndex);
                    // Note: arrayMove might not be perfect here because we essentially want to insert 
                    // into the new column. A simpler approach for "different columns" is often 
                    // just updating the status and letting standard sort handle it, 
                    // but generic @dnd-kit sortable expects the list to be one big list or multiple lists.
                    // Since we have a flat list of projects, we just update status and let KanbanBoard re-filter.
                    // However, for "Sortable" to work across lists, we need to actually reorder the array 
                    // AND update status.
                }
                return items;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeProject = projects.find((p) => p.id === activeId);
        // Check if over is a Column ID or a Card ID
        // Column IDs in KanbanBoard are: "pauta", "agendamento", etc.
        const isOverColumn = ["pauta", "agendamento", "captacao", "edicao", "revisao", "publicado"].includes(overId as string);

        if (activeProject && isOverColumn) {
            // Dropped directly on a column (empty space)
            if (activeProject.status !== overId) {
                setProjects((items) => {
                    return items.map(p =>
                        p.id === activeId ? { ...p, status: overId as string } : p
                    );
                });
                onUpdateProject?.(activeId as string, { status: overId as string });
            }
        } else if (activeId !== overId) {
            // Dropped on another card (Reorder)
            setProjects((items) => {
                const oldIndex = items.findIndex((i) => i.id === activeId);
                const newIndex = items.findIndex((i) => i.id === overId);

                // If deeper logic needed for status change:
                const newStatus = items[newIndex].status;

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Ensure status is updated if moved to a card in a different column
                if (newItems[newIndex].status !== newStatus) {
                    newItems[newIndex].status = newStatus;
                }
                // Actually, arrayMove simply swaps positions. 
                // IF we moved across columns, we must also update the status of the moved item.
                // But `arrayMove` returns keys in new order.
                // We need to make sure the moved item gets the target's status.

                return newItems.map((item, index) => {
                    if (index === newIndex) { // This is where the item landed
                        if (item.status !== newStatus) {
                            // Status changed during reorder (dragged to another column's card)
                            // Note: 'newStatus' variable in original code block is derived from target item
                        }
                        return { ...item, status: items[newIndex].status };
                    }
                    return item;
                });
            });

            // Optimistic update fired, now sync DB if status changed
            const targetProject = projects.find(p => p.id === overId);
            if (activeProject && targetProject && activeProject.status !== targetProject.status) {
                onUpdateProject?.(activeId as string, { status: targetProject.status });
            }
        }
    };

    return { sensors, handleDragOver, handleDragEnd };
};
