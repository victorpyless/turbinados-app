export interface Project {
    id: string;
    title: string;
    carModel: string;
    status: string;
    date: string;
    thumbnailUrl: string;
    isDelayed: boolean;
    // Details for Drawer
    year?: string;
    color?: string;
    notes?: string;
    driveLink?: string;
    priority?: boolean;
}
