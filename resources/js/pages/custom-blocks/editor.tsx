import { Head, Link, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Loader2, Play, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { BlockPreview } from '@/components/block-editor/block-preview';
import type { PreviewStatus } from '@/components/block-editor/status-indicator';
import { StatusIndicator } from '@/components/block-editor/status-indicator';
import { TrafficLights } from '@/components/block-editor/traffic-lights';
import type { ViewportSize } from '@/components/block-editor/viewport-toggle';
import {
    VIEWPORT_WIDTHS,
    ViewportToggle,
} from '@/components/block-editor/viewport-toggle';
import { IconPicker } from '@/components/icon-picker';
import { ValidationModal } from '@/components/validation-modal';
import AppLayout from '@/layouts/app-layout';
import type { ValidationIssue } from '@/lib/transpile-block';
import { validateBlockDefinition } from '@/lib/transpile-block';
import type { CustomBlock, CustomBlockResource } from '@/types/custom-block';

import { DEFAULT_SOURCE } from './default-source';




export default function BlockEditor({
    block,
}: {
    block?: CustomBlockResource;
}) {
    const blockData: CustomBlock | undefined = block?.data;
    const isEditing = !!block;
    const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('idle');
    const [viewport, setViewport] = useState<ViewportSize>('desktop');
    const [runTrigger, setRunTrigger] = useState(0);
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
        [],
    );
    const [showModal, setShowModal] = useState(false);
    const [validating, setValidating] = useState(false);

    const form = useForm({
        name: blockData?.name ?? '',
        type: blockData?.type ?? '',
        description: blockData?.description ?? '',
        icon_name: blockData?.icon_name ?? 'Box',
        source_code: blockData?.source_code ?? DEFAULT_SOURCE,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidating(true);

        setTimeout(() => {
            const issues = validateBlockDefinition(form.data.source_code);
            const errors = issues.filter((i) => i.level === 'error');
            const warnings = issues.filter(
                (i) =>
                    i.level === 'warning' && i.message !== 'All checks passed.',
            );

            setValidating(false);

            if (errors.length === 0 && warnings.length === 0) {
                submitForm();

                return;
            }

            setValidationIssues(issues);
            setShowModal(true);
        }, 300);
    };

    const submitForm = () => {
        setShowModal(false);

        if (isEditing && block) {
            form.put(`/custom-blocks/${blockData?.id}`);
        } else {
            form.post('/custom-blocks');
        }
    };

    const handleRun = () => {
        setRunTrigger((t) => t + 1);
    };

    const handleStatusChange = useCallback((status: PreviewStatus) => {
        setPreviewStatus(status);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRun();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <AppLayout>
            <Head
                title={isEditing ? `Edit: ${blockData?.name}` : 'New Custom Block'}
            />
            <div className="flex h-screen flex-col bg-zinc-950">
                {/* Toolbar */}
                <form
                    onSubmit={handleSubmit}
                    className="border-b border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/custom-blocks"
                                className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="mt-5 h-5 w-px bg-zinc-800" />
                            <div className="grid grid-cols-[200px_180px_1fr_auto] gap-3">
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="My Custom Block"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        className={`h-8 w-full rounded-lg border bg-zinc-950 px-3 text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:ring-1 focus:outline-none ${
                                            form.errors.name
                                                ? 'border-red-500/50 focus:ring-red-500/50'
                                                : 'border-zinc-800 focus:ring-zinc-700'
                                        }`}
                                    />
                                    {form.errors.name && (
                                        <p className="mt-0.5 text-[10px] text-red-400">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                                        Type ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="myCustomBlock"
                                        value={form.data.type}
                                        onChange={(e) =>
                                            form.setData('type', e.target.value)
                                        }
                                        className={`h-8 w-full rounded-lg border bg-zinc-950 px-3 font-mono text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:ring-1 focus:outline-none ${
                                            form.errors.type
                                                ? 'border-red-500/50 focus:ring-red-500/50'
                                                : 'border-zinc-800 focus:ring-zinc-700'
                                        }`}
                                    />
                                    {form.errors.type && (
                                        <p className="mt-0.5 text-[10px] text-red-400">
                                            {form.errors.type}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="A brief description of what this block does"
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 w-full min-w-75 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:ring-1 focus:ring-zinc-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                                        Icon
                                    </label>
                                    <IconPicker
                                        value={form.data.icon_name}
                                        onChange={(name) =>
                                            form.setData('icon_name', name)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRun}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                            >
                                <Play className="h-3 w-3" />
                                Run
                                <kbd className="ml-1 rounded border border-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-600">
                                    ⌘↵
                                </kbd>
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing || validating}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                            >
                                {validating ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Validating...
                                    </>
                                ) : form.processing ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-3 w-3" />
                                        Save
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Window Chrome */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
                    <div className="flex items-center gap-4">
                        <TrafficLights />
                        <div className="rounded-t-md border border-b-0 border-zinc-700 bg-zinc-800 px-3 py-1">
                            <span className="text-xs text-zinc-300">
                                {form.data.type || 'untitled'}.tsx
                            </span>
                        </div>
                    </div>
                    <StatusIndicator status={previewStatus} />
                </div>

                {/* Split Pane */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex w-1/2 flex-col border-r border-zinc-800">
                        <div className="border-b border-zinc-800/50 px-4 py-2">
                            <span className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase">
                                Editor
                            </span>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                defaultLanguage="typescript"
                                path="custom-blockData.tsx"
                                value={form.data.source_code}
                                onChange={(value) =>
                                    form.setData('source_code', value ?? '')
                                }
                                theme="vs-dark"
                                beforeMount={(monaco) => {
                                    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                                        {
                                            target: monaco.languages.typescript
                                                .ScriptTarget.Latest,
                                            module: monaco.languages.typescript
                                                .ModuleKind.ESNext,
                                            moduleResolution:
                                                monaco.languages.typescript
                                                    .ModuleResolutionKind
                                                    .NodeJs,
                                            jsx: monaco.languages.typescript
                                                .JsxEmit.ReactJSX,
                                            allowJs: true,
                                            esModuleInterop: true,
                                            allowNonTsExtensions: true,
                                        },
                                    );
                                    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                                        {
                                            noSemanticValidation: true,
                                            noSyntaxValidation: false,
                                        },
                                    );
                                }}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    tabSize: 2,
                                    padding: { top: 16 },
                                    renderLineHighlight: 'gutter',
                                    cursorBlinking: 'smooth',
                                    smoothScrolling: true,
                                    fontFamily:
                                        "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                    fontLigatures: true,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex w-1/2 flex-col bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-2">
                            <span className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase">
                                Preview
                            </span>
                            <ViewportToggle
                                active={viewport}
                                onChange={setViewport}
                            />
                        </div>
                        <div className="flex flex-1 items-start justify-center overflow-y-auto p-6">
                            <div
                                className="w-full transition-all duration-300"
                                style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
                            >
                                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-white p-6 text-black shadow-2xl shadow-black/20">
                                    <BlockPreview
                                        sourceCode={form.data.source_code}
                                        runTrigger={runTrigger}
                                        onStatusChange={handleStatusChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <ValidationModal
                    issues={validationIssues}
                    onClose={() => setShowModal(false)}
                    onConfirm={submitForm}
                    saving={form.processing}
                />
            )}
        </AppLayout>
    );
}
