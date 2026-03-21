import type { BlockDefinition } from '@/packages/survey-form-package/src/types';

import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ChevronDown,
    Code2,
    Eye,
    ExternalLink,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/error-boundry';
import { transpileAndExtract } from '@/lib/transpile-block';
import { registerBlock } from '@/packages/survey-form-package/src';
import SurveyForm from '@/packages/survey-form-package/src';

interface CustomBlock {
    id: number;
    name: string;
    type: string;
    description: string | null;
    icon_name: string;
    source_code: string;
    is_active: boolean;
}

export default function BlockPreviewPage({
    blocks,
}: {
    blocks: CustomBlock[];
}) {
    const [registered, setRegistered] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [submittedData, setSubmittedData] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [debugOpen, setDebugOpen] = useState(false);

    useEffect(() => {
        const errs: string[] = [];

        blocks.forEach((block) => {
            const result = transpileAndExtract(block.source_code);

            if (result.success && result.blockDefinition) {
                const blockDef: BlockDefinition = {
                    ...result.blockDefinition,
                    type: block.type,
                    defaultData: {
                        ...result.blockDefinition.defaultData,
                        type: block.type,
                    },
                };

                registerBlock(blockDef);
            } else {
                errs.push(`${block.name}: ${result.error}`);
            }
        });

        setErrors(errs);
        setRegistered(true);
    }, [blocks]);

    const surveyData = {
        rootNode: {
            type: 'section' as const,
            uuid: 'root',
            name: 'Custom Blocks Preview',
            items: blocks.map((block, index) => ({
                type: block.type,
                uuid: `block-${index}`,
                fieldName: `field_${block.type}`,
                label: block.name,
                placeholder: `Enter ${block.name.toLowerCase()}...`,
            })),
        },
    };

    const handleSubmit = (data: Record<string, unknown>) => {
        setSubmittedData(data);
        setDebugOpen(true);
        console.log('Form submitted:', data);
    };

    if (!registered) {
        return (
            <>
                <Head title="Form Preview" />
                <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                    <p className="text-sm text-zinc-500">Loading blocks...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Form Preview" />
            <div className="min-h-screen bg-zinc-950">
                {/* Top bar */}
                <div className="border-b border-zinc-800 bg-zinc-900">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/custom-blocks"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="h-5 w-px bg-zinc-800" />
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-200">
                                    Form Preview
                                </span>
                                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                    {blocks.length}{' '}
                                    {blocks.length === 1 ? 'block' : 'blocks'}
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/custom-blocks"
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                        >
                            Back to Blocks
                        </Link>
                    </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mx-auto max-w-7xl px-6 pt-6">
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                <span className="text-sm font-medium text-amber-400">
                                    Some blocks failed to load
                                </span>
                            </div>
                            {errors.map((err, i) => (
                                <p
                                    key={i}
                                    className="font-mono text-xs text-amber-300/70"
                                >
                                    {err}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form area */}
                <div className="mx-auto w-full px-6 py-8">
                    {blocks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 py-20">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
                                <Eye className="h-6 w-6 text-zinc-600" />
                            </div>
                            <h3 className="mb-1 text-sm font-medium text-zinc-300">
                                No active blocks
                            </h3>
                            <p className="mb-6 text-sm text-zinc-600">
                                Create some blocks first to preview them here.
                            </p>
                            <Link
                                href="/custom-blocks/create"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                            >
                                Create Block
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-white shadow-2xl shadow-black/20">
                            <ErrorBoundary
                                fallback={(err: { message: string }) => (
                                    <div className="p-8">
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                            <div className="mb-1 text-sm font-medium text-red-800">
                                                Render Error
                                            </div>
                                            <pre className="text-xs whitespace-pre-wrap text-red-600">
                                                {err.message}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            >
                                <div className="p-8 text-black">
                                    <SurveyForm
                                        survey={surveyData}
                                        onSubmit={handleSubmit}
                                    />
                                </div>
                            </ErrorBoundary>
                        </div>
                    )}

                    {/* Debug panel */}
                    <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                        <button
                            type="button"
                            onClick={() => setDebugOpen(!debugOpen)}
                            className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-zinc-800/50"
                        >
                            <div className="flex items-center gap-2">
                                <Code2 className="h-4 w-4 text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-400">
                                    Form Data
                                </span>
                                {submittedData && (
                                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                                        submitted
                                    </span>
                                )}
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 text-zinc-600 transition-transform ${
                                    debugOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        {debugOpen && (
                            <div className="border-t border-zinc-800 p-5">
                                {submittedData ? (
                                    <pre className="font-mono text-xs leading-relaxed text-zinc-400">
                                        {JSON.stringify(submittedData, null, 2)}
                                    </pre>
                                ) : (
                                    <p className="text-xs text-zinc-600">
                                        Submit the form to see the output data
                                        here.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
