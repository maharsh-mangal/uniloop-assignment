import { Link } from '@inertiajs/react';
import { Box, Plus } from 'lucide-react';

export function EmptyState() {
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
