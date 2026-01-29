import React from "react";

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-garage-dark flex flex-col">
            {/* Header Skeleton */}
            <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-garage-dark z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-neutral-800 rounded-full animate-pulse"></div>
                    <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse hidden md:block"></div>
                    <div className="h-8 w-8 bg-neutral-800 rounded-full animate-pulse"></div>
                </div>
            </header>

            {/* Kanban Board Skeleton */}
            <div className="flex-1 overflow-hidden">
                <div className="flex h-[calc(100vh-80px)] overflow-x-auto gap-4 p-6 whitespace-nowrap">
                    {[1, 2, 3, 4, 5].map((col) => (
                        <div key={col} className="min-w-[320px] h-full flex flex-col bg-neutral-900/20 border border-neutral-800/50 rounded-sm animate-pulse">
                            {/* Column Header */}
                            <div className="p-3 border-b border-neutral-800 flex justify-between items-center">
                                <div className="h-3 w-24 bg-neutral-800 rounded"></div>
                                <div className="h-3 w-6 bg-neutral-800 rounded"></div>
                            </div>

                            {/* Cards Area */}
                            <div className="flex-1 p-3 space-y-3">
                                {[1, 2, 3].map((card) => (
                                    <div key={card} className="w-full h-32 bg-zinc-800/50 rounded-md animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
