import { Head, Link } from '@inertiajs/react';

import { useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/error-boundry';
import AppLayout from '@/layouts/app-layout';
import { transpileAndExtract } from '@/lib/transpile-block';
import {
    registerBlock,
} from '@/packages/survey-form-package/src';
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

    useEffect(() => {
        const errs: string[] = [];

        blocks.forEach((block) => {
            const result = transpileAndExtract(block.source_code);

            if (result.success && result.blockDefinition) {
                result.blockDefinition.type = block.type;

                if (result.blockDefinition.defaultData) {
                    result.blockDefinition.defaultData.type = block.type;
                }

                registerBlock(result.blockDefinition);
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

    if (!registered) {
        return (
            <AppLayout>
                <Head title="Form Preview" />
                <div className="mx-auto max-w-2xl p-6">
                    <p className="text-neutral-500">Loading blocks...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Form Preview" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Form Preview</h1>
                    <Link
                        href="/custom-blocks"
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
                    >
                        Back to Blocks
                    </Link>
                </div>

                {errors.length > 0 && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="mb-1 text-sm font-medium text-red-800">
                            Some blocks failed to load
                        </div>
                        {errors.map((err, i) => (
                            <p key={i} className="text-xs text-red-600">
                                {err}
                            </p>
                        ))}
                    </div>
                )}

                {blocks.length === 0 ? (
                    <p className="text-neutral-500">
                        No active blocks. Create some blocks first.
                    </p>
                ) : (
                    <div className="rounded-lg border bg-white p-6 text-black">
                        <ErrorBoundary
                            fallback={(err: { message: string }) => (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div className="mb-1 text-sm font-medium text-red-800">
                                        Render Error
                                    </div>
                                    <pre className="text-xs whitespace-pre-wrap text-red-600">
                                        {err.message}
                                    </pre>
                                </div>
                            )}
                        >
                            <SurveyForm
                                survey={surveyData}
                                onSubmit={(data) => {
                                    console.log('Form submitted:', data);
                                    alert(
                                        'Form submitted! Check console for data.',
                                    );
                                }}
                            />
                        </ErrorBoundary>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
