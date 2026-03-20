import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface CustomBlock {
    id: number;
    name: string;
    type: string;
    description: string | null;
    icon_name: string;
    is_active: boolean;
    created_at: string;
}

export default function CustomBlocksIndex({ blocks }: { blocks: CustomBlock[] }) {
    return (
        <AppLayout>
            <Head title="Custom Blocks" />
            <div className="mx-auto max-w-5xl p-6">

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Custom Blocks</h1>
                    <div className="flex gap-2">
                        <Link
                            href="/custom-blocks-preview"
                            className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-50"
                        >
                            Preview Form
                        </Link>
                        <Link
                            href="/custom-blocks/create"
                            className="rounded-md bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-700"
                        >
                            New Block
                        </Link>
                    </div>
                </div>

                {blocks.length === 0 ? (
                    <p className="text-neutral-500">
                        No custom blocks yet. Create your first one.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {blocks.map((block) => (
                            <div
                                key={block.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div>
                                    <h3 className="font-medium">
                                        {block.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        Type: {block.type}
                                        {block.description &&
                                            ` — ${block.description}`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/custom-blocks/${block.id}/edit`}
                                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this block?')) {
                                                router.delete(
                                                    `/custom-blocks/${block.id}`,
                                                );
                                            }
                                        }}
                                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
