
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Box,
    Code2,
    ExternalLink,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';

interface CustomBlock {
    id: number;
    name: string;
    type: string;
    description: string | null;
    icon_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return 'just now';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days}d ago`;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    if (isActive) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            Inactive
        </span>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                <Box className="h-6 w-6 text-zinc-600" />
            </div>
            <h3 className="mb-1 text-sm font-medium text-zinc-300">
                No blocks yet
            </h3>
            <p className="mb-6 text-sm text-zinc-600">
                Create your first custom block to get started.
            </p>
            <Link
                href="/custom-blocks/create"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
                <Plus className="h-4 w-4" />
                New Block
            </Link>
        </div>
    );
}

export default function CustomBlocksIndex({
    blocks,
}: {
    blocks: CustomBlock[];
}) {
    const [search, setSearch] = useState('');
    const activeCount = blocks.filter((b) => b.is_active).length;

    const filtered = blocks.filter((block) => {
        const q = search.toLowerCase();

        return (
            block.name.toLowerCase().includes(q) ||
            block.type.toLowerCase().includes(q)
        );
    });

    const handleDelete = (block: CustomBlock, e: FormEvent) => {
        e.stopPropagation();

        if (confirm(`Delete "${block.name}"? This cannot be undone.`)) {
            router.delete(`/custom-blocks/${block.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Custom Blocks" />
            <div className="min-h-screen bg-zinc-950">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    {/* Header */}
                    <div className="mb-8">
                        <p className="mb-2 text-xs font-medium tracking-widest text-zinc-600 uppercase">
                            Block Manager
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                                    Custom Blocks
                                </h1>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Manage your block library with status
                                    tracking and instant search.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/custom-blocks-preview"
                                    target="_blank"
                                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview Form
                                    <ExternalLink className="h-3 w-3 text-zinc-600" />
                                </Link>
                                <Link
                                    href="/custom-blocks/create"
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Block
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                        {/* Search Bar */}
                        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Search blocks..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pr-4 pl-10 text-sm text-zinc-300 placeholder-zinc-600 transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 focus:outline-none"
                                />
                            </div>
                        </div>

                        {filtered.length === 0 && blocks.length === 0 ? (
                            <EmptyState />
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center py-12">
                                <AlertTriangle className="mb-2 h-5 w-5 text-zinc-600" />
                                <p className="text-sm text-zinc-500">
                                    No blocks match "{search}"
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-[1fr_140px_100px_120px_48px] items-center gap-4 border-b border-zinc-800 px-5 py-2.5">
                                    <span className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
                                        Name
                                    </span>
                                    <span className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
                                        Type
                                    </span>
                                    <span className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
                                        Status
                                    </span>
                                    <span className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
                                        Updated
                                    </span>
                                    <span />
                                </div>

                                {/* Table Rows */}
                                {filtered.map((block) => (
                                    <Link
                                        key={block.id}
                                        href={`/custom-blocks/${block.id}/edit`}
                                        className="group grid grid-cols-[1fr_140px_100px_120px_48px] items-center gap-4 border-b border-zinc-800/50 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-zinc-800/30"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                                                <Code2 className="h-3.5 w-3.5 text-zinc-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                                                    {block.name}
                                                </p>
                                                {block.description && (
                                                    <p className="truncate text-xs text-zinc-600">
                                                        {block.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-mono text-xs text-blue-400">
                                            {block.type}
                                        </span>
                                        <StatusBadge
                                            isActive={block.is_active}
                                        />
                                        <span className="text-xs text-zinc-600">
                                            {timeAgo(block.updated_at)}
                                        </span>
                                        <button
                                            onClick={(e) =>
                                                handleDelete(block, e)
                                            }
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </Link>
                                ))}
                            </>
                        )}

                        {/* Footer */}
                        {blocks.length > 0 && (
                            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-2.5">
                                <span className="text-xs text-zinc-600">
                                    {blocks.length}{' '}
                                    {blocks.length === 1 ? 'block' : 'blocks'} ·{' '}
                                    {activeCount} active
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
