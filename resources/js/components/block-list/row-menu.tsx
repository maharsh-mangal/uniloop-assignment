import type { CustomBlock } from '@/types/custom-block';

import { Eye, MoreVertical, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

export function RowMenu({
    block,
    onToggle,
    onDelete,
}: {
    block: CustomBlock;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            >
                <MoreVertical className="h-4 w-4" />
            </button>
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(false);
                        }}
                    />
                    <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggle();
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            {block.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete();
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 transition-colors hover:bg-zinc-800"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
