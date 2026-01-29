export default function VideoCardSkeleton() {
    return (
        <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-sm overflow-hidden animate-pulse">
            <div className="h-6 bg-neutral-800/50 border-b border-neutral-800" />
            <div className="h-32 bg-neutral-800" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-800 rounded w-3/4" />
                <div className="h-3 bg-neutral-800 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="h-3 bg-neutral-800 rounded w-full" />
                    <div className="h-3 bg-neutral-800 rounded w-full" />
                </div>
            </div>
        </div>
    );
}
