import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Code2,
    ExternalLink,
    Eye,
    Filter,
    Plus,
    Search,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { EmptyState } from '@/components/block-list/empty-state';
import { RowMenu } from '@/components/block-list/row-menu';
import { StatusBadge } from '@/components/block-list/status-badge';
import { TypeBadge } from '@/components/block-list/type-badge';
import AppLayout from '@/layouts/app-layout';
import { timeAgo } from '@/lib/time-ago';
import type {
    CustomBlock,
    CustomBlockCollection,
    CustomBlockFilters,
    CustomBlockStats,
} from '@/types/custom-block';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function CustomBlocksIndex({
    blocks,
    filters,
    stats,
}: {
    blocks: CustomBlockCollection;
    filters: CustomBlockFilters;
    stats: CustomBlockStats;
}) {
    const [search, setSearch] = useState(filters.search);
    const [showFilters, setShowFilters] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyFilters = (params: Record<string, string>) => {
        router.get(
            '/custom-blocks',
            { ...filters, ...params },
            { preserveState: true, replace: true },
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            applyFilters({ search: value, page: '1' });
        }, 400);
    };

    const handleStatusFilter = (status: StatusFilter) => {
        applyFilters({ status, page: '1' });
        setShowFilters(false);
    };

    const handlePageChange = (page: number) => {
        applyFilters({ page: String(page) });
    };

    const handleDelete = (block: CustomBlock) => {
        if (confirm(`Delete "${block.name}"? This cannot be undone.`)) {
            router.delete(`/custom-blocks/${block.id}`);
        }
    };

    const handleToggle = (block: CustomBlock) => {
        router.patch(`/custom-blocks/${block.id}/toggle`);
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
                                    href="/custom-blocks-builder"
                                    target="_blank"
                                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                                >
                                    <Code2 className="h-4 w-4" />
                                    Form Builder
                                    <ExternalLink className="h-3 w-3 text-zinc-600" />
                                </Link>
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
                        {/* Search + Filters */}
                        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Search blocks..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pr-4 pl-10 text-sm text-zinc-300 placeholder-zinc-600 transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 focus:outline-none"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                        filters.status !== 'all'
                                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    Filters
                                    {filters.status !== 'all' && (
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                                            1
                                        </span>
                                    )}
                                </button>
                                {showFilters && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setShowFilters(false)
                                            }
                                        />
                                        <div className="absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                                            <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
                                                Status
                                            </p>
                                            {(
                                                [
                                                    'all',
                                                    'active',
                                                    'inactive',
                                                ] as StatusFilter[]
                                            ).map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() =>
                                                        handleStatusFilter(
                                                            status,
                                                        )
                                                    }
                                                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-800 ${
                                                        filters.status ===
                                                        status
                                                            ? 'text-blue-400'
                                                            : 'text-zinc-300'
                                                    }`}
                                                >
                                                    <span className="capitalize">
                                                        {status}
                                                    </span>
                                                    {filters.status ===
                                                        status && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        {stats.total === 0 ? (
                            <EmptyState />
                        ) : blocks.data.length === 0 ? (
                            <div className="flex flex-col items-center py-16">
                                <Search className="mb-3 h-5 w-5 text-zinc-700" />
                                <p className="text-sm text-zinc-500">
                                    No blocks match your search
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters({
                                            search: '',
                                            status: 'all',
                                            page: '1',
                                        });
                                    }}
                                    className="mt-2 text-xs text-blue-400 transition-colors hover:text-blue-300"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-[24px_1fr_120px_100px_120px_32px] items-center gap-4 border-b border-zinc-800 px-5 py-2.5">
                                    <span />
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
                                        Last Updated
                                    </span>
                                    <span />
                                </div>
                                {blocks.data.map((block) => (
                                    <Link
                                        key={block.id}
                                        href={`/custom-blocks/${block.id}/edit`}
                                        className="group grid grid-cols-[24px_1fr_120px_100px_120px_32px] items-center gap-4 border-b border-zinc-800/50 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-zinc-800/30"
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 bg-zinc-950">
                                            <Code2 className="h-3 w-3 text-zinc-600" />
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
                                        <TypeBadge type={block.type} />
                                        <StatusBadge
                                            isActive={block.is_active}
                                        />
                                        <span className="text-xs text-zinc-600">
                                            {timeAgo(block.updated_at)}
                                        </span>
                                        <RowMenu
                                            block={block}
                                            onToggle={() => handleToggle(block)}
                                            onDelete={() => handleDelete(block)}
                                        />
                                    </Link>
                                ))}
                            </>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-2.5">
                            <span className="text-xs text-zinc-600">
                                {stats.total}{' '}
                                {stats.total === 1 ? 'block' : 'blocks'}
                                {' · '}
                                <span className="text-emerald-500">
                                    {stats.active} active
                                </span>
                            </span>
                            {blocks.meta.last_page > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(
                                                blocks.meta.current_page - 1,
                                            )
                                        }
                                        disabled={
                                            blocks.meta.current_page === 1
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    {Array.from(
                                        { length: blocks.meta.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                                                blocks.meta.current_page ===
                                                page
                                                    ? 'bg-zinc-700 text-white'
                                                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(
                                                blocks.meta.current_page + 1,
                                            )
                                        }
                                        disabled={
                                            blocks.meta.current_page ===
                                            blocks.meta.last_page
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
