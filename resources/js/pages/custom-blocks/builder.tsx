import { Head, Link } from '@inertiajs/react';

import { ArrowLeft, Copy, Download, Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { transpileAndExtract } from '@/lib/transpile-block';
import { registerBlock } from '@/packages/survey-form-package/src';
import { StandardBlocks } from '@/packages/survey-form-package/src/blocks';
import { StandardNodes } from '@/packages/survey-form-package/src/builder/nodes';
import type { BlockDefinition } from '@/packages/survey-form-package/src/types';
import type { CustomBlockCollection } from '@/types/custom-block';

// Dynamic import — SurveyBuilder uses drag-and-drop which breaks SSR

const SurveyBuilder = React.lazy(() =>
    import('@/packages/survey-form-package/src/builder/survey/SurveyBuilder').then(
        (mod) => ({ default: mod.SurveyBuilder }),
    ),
);
export default function BuilderPage({
    blocks,
}: {
    blocks: CustomBlockCollection;
}) {
    const [surveyData, setSurveyData] = useState<any>(null);

    const { customBlockDefs, errors } = useMemo(() => {
        const defs: BlockDefinition[] = [];
        const errs: string[] = [];

        blocks.data.forEach((block) => {
            const result = transpileAndExtract(block.source_code);

            if (result.success && result.blockDefinition) {
                const blockDef: BlockDefinition = {
                    ...result.blockDefinition,
                    type: block.type,
                    defaultData: {
                        ...result.blockDefinition.defaultData,
                        type: block.type,
                        isCustom: true,
                        showContinueButton: true
                    },
                    generateDefaultData: result.blockDefinition.generateDefaultData
                        ? () => ({
                            ...result.blockDefinition?.generateDefaultData!(),
                            type: block.type,
                            isCustom: true,
                            showContinueButton: true,
                        })
                        : () => ({
                            ...result.blockDefinition?.defaultData,
                            type: block.type,
                            isCustom: true,
                            showContinueButton: true,
                        }),
                };

                console.log('blockDef.defaultData:', blockDef.defaultData);

                registerBlock(blockDef);
                defs.push(blockDef);
            } else {
                errs.push(`${block.name}: ${result.error}`);
            }
        });

        console.log('customBlockDefs count:', defs.length);

        return { customBlockDefs: defs, errors: errs };
    }, [blocks]);

    const handleDataChange = useCallback((data: any) => {
        setSurveyData(data);
    }, []);

    return (
        <>
            <Head title="Form Builder" />
            <div className="flex h-screen flex-col bg-zinc-950">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/custom-blocks"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="h-5 w-px bg-zinc-800" />
                        <span className="text-sm font-medium text-zinc-200">
                            Form Builder
                        </span>
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                            {blocks.data.length} custom{' '}
                            {blocks.data.length === 1 ? 'block' : 'blocks'}{' '}
                            loaded
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (!surveyData) {
                                    return;
                                }

                                navigator.clipboard.writeText(
                                    JSON.stringify(surveyData, null, 2),
                                );
                                alert('Survey JSON copied to clipboard');
                            }}
                            disabled={!surveyData}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30"
                        >
                            <Copy className="h-3 w-3" />
                            Copy JSON
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!surveyData) {
                                    return;
                                }

                                const blob = new Blob(
                                    [JSON.stringify(surveyData, null, 2)],
                                    { type: 'application/json' },
                                );
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'survey.json';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            disabled={!surveyData}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-30"
                        >
                            <Download className="h-3 w-3" />
                            Export JSON
                        </button>
                    </div>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2">
                        {errors.map((err, i) => (
                            <p
                                key={i}
                                className="font-mono text-xs text-amber-300/70"
                            >
                                {err}
                            </p>
                        ))}
                    </div>
                )}

                {/* Builder */}
                <div className="flex-1 overflow-hidden">
                    <Suspense
                        fallback={
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                            </div>
                        }
                    >
                        <SurveyBuilder
                            blockDefinitions={[
                                ...StandardBlocks,
                                ...customBlockDefs,
                            ]}
                            nodeDefinitions={StandardNodes}
                            onDataChange={handleDataChange}
                            mode="pageless"

                        />
                    </Suspense>
                </div>

                {/* Debug output */}
                {surveyData && (
                    <div className="max-h-48 overflow-auto border-t border-zinc-800 bg-zinc-900 px-4 py-3">
                        <p className="mb-1 text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
                            Survey Data
                        </p>
                        <pre className="font-mono text-xs text-zinc-500">
                            {JSON.stringify(surveyData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </>
    );
}
