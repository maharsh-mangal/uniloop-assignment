
import { Head, Link, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft,
    Circle,
    Loader2,
    Monitor,
    Play,
    Save,
    Smartphone,
    Tablet,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ErrorBoundary } from '@/components/error-boundry';
import AppLayout from '@/layouts/app-layout';
import { transpileAndExtract } from '@/lib/transpile-block';
import type { BlockDefinition } from '@/packages/survey-form-package/src/types';

const DEFAULT_SOURCE = `import React, { forwardRef, useState } from "react";

const Renderer = forwardRef(({ block, value, onChange, error, disabled }, ref) => {
  const [count, setCount] = useState(0);

  return (
    <div ref={ref} style={{ padding: 16 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
        {block.label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={block.placeholder}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: error ? "2px solid red" : "1px solid #ccc",
          borderRadius: 6,
        }}
      />
      <button
        type="button"
        onClick={() => setCount(c => c + 1)}
        style={{
          marginTop: 8,
          padding: "6px 16px",
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Clicked {count} times
      </button>
      {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
    </div>
  );
});

Renderer.displayName = "TestRenderer";

export const TestBlock = {
  type: "testBlock",
  name: "Test Block",
  description: "A simple test block",
  defaultData: {
    type: "testBlock",
    fieldName: "testField",
    label: "Test Input",
    placeholder: "Type something...",
  },
  renderItem: ({ data }) => <div style={{ padding: 8 }}>{data.label}</div>,
  renderFormFields: () => <div>No config</div>,
  renderPreview: () => <div style={{ padding: 4, fontSize: 12 }}>Test Block</div>,
  renderBlock: (props) => <Renderer {...props} />,
  validate: () => null,
  validateValue: () => null,
};`;

interface CustomBlock {
    id: number;
    name: string;
    type: string;
    description: string | null;
    icon_name: string;
    source_code: string;
    is_active: boolean;
}

type PreviewStatus = 'idle' | 'compiling' | 'live' | 'error';
type ViewportSize = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%',
};

/* ─── Error display ─── */
function ErrorDisplay({ title, message }: { title: string; message: string }) {
    return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">{title}</span>
            </div>
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-red-300/80">
                {message}
            </pre>
        </div>
    );
}

/* ─── Status indicator ─── */
function StatusIndicator({ status }: { status: PreviewStatus }) {
    if (status === 'compiling') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Compiling
            </span>
        );
    }

    if (status === 'live') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Circle className="h-2 w-2 fill-emerald-400" />
                Live
            </span>
        );
    }

    if (status === 'error') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
                <Circle className="h-2 w-2 fill-red-400" />
                Error
            </span>
        );
    }

    return null;
}

/* ─── macOS traffic lights ─── */
function TrafficLights() {
    return (
        <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
    );
}

/* ─── Viewport toggle ─── */
function ViewportToggle({
                            active,
                            onChange,
                        }: {
    active: ViewportSize;
    onChange: (size: ViewportSize) => void;
}) {
    const sizes: { key: ViewportSize; icon: typeof Smartphone; label: string }[] = [
        { key: 'mobile', icon: Smartphone, label: 'Mobile' },
        { key: 'tablet', icon: Tablet, label: 'Tablet' },
        { key: 'desktop', icon: Monitor, label: 'Desktop' },
    ];

    return (
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
            {sizes.map(({ key, icon: Icon, label }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    title={label}
                    className={`rounded-md p-1.5 transition-colors ${
                        active === key
                            ? 'bg-zinc-800 text-zinc-200'
                            : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                >
                    <Icon className="h-3.5 w-3.5" />
                </button>
            ))}
        </div>
    );
}

/* ─── Live block renderer ─── */
function LiveBlock({ blockDef }: { blockDef: BlockDefinition }) {
    const [formValue, setFormValue] = useState('');

    if (!blockDef.renderBlock) {
        return (
            <ErrorDisplay
                title="Missing renderBlock"
                message='Your BlockDefinition must have a "renderBlock" method.'
            />
        );
    }

    if (!blockDef.defaultData) {
        return (
            <ErrorDisplay
                title="Missing defaultData"
                message='Your BlockDefinition must have a "defaultData" object.'
            />
        );
    }

    return (
        <>
            {blockDef.renderBlock({
                block: blockDef.defaultData,
                value: formValue,
                onChange: (val: string) => setFormValue(val),
                error: undefined,
                disabled: false,
            })}
        </>
    );
}

/* ─── Preview panel ─── */
function BlockPreview({
                          sourceCode,
                          runTrigger,
                          onStatusChange,
                      }: {
    sourceCode: string;
    runTrigger: number;
    onStatusChange: (status: PreviewStatus) => void;
}) {
    const [blockDef, setBlockDef] = useState<BlockDefinition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        onStatusChange('compiling');

        timerRef.current = setTimeout(() => {
            const result = transpileAndExtract(sourceCode);

            if (result.success && result.blockDefinition) {
                setBlockDef(result.blockDefinition);
                setError(null);
                setKey((k) => k + 1);
                onStatusChange('live');
            } else {
                setBlockDef(null);
                setError(result.error || 'Unknown error');
                onStatusChange('error');
            }
        }, 800);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [sourceCode, runTrigger]);

    if (error) {
        return <ErrorDisplay title="Transpilation Error" message={error} />;
    }

    if (!blockDef) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="mb-3 h-5 w-5 animate-spin text-zinc-600" />
                <p className="text-xs text-zinc-600">Compiling...</p>
            </div>
        );
    }

    return (
        <ErrorBoundary
            key={key}
            fallback={(err: { message: string }) => (
                <ErrorDisplay title="Render Error" message={err.message} />
            )}
        >
            <LiveBlock blockDef={blockDef} />
        </ErrorBoundary>
    );
}

/* ─── Main page ─── */
export default function BlockEditor({ block }: { block?: CustomBlock }) {
    const isEditing = !!block;
    const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('idle');
    const [viewport, setViewport] = useState<ViewportSize>('desktop');
    const [runTrigger, setRunTrigger] = useState(0);

    const form = useForm({
        name: block?.name ?? '',
        type: block?.type ?? '',
        description: block?.description ?? '',
        icon_name: block?.icon_name ?? 'Box',
        source_code: block?.source_code ?? DEFAULT_SOURCE,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(`/custom-blocks/${block.id}`);
        } else {
            form.post('/custom-blocks');
        }
    };

    const handleRun = () => {
        setRunTrigger((t) => t + 1);
    };

    // Ctrl/Cmd + Enter to run
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
            <Head title={isEditing ? `Edit: ${block.name}` : 'New Custom Block'} />
            <div className="flex h-screen flex-col bg-zinc-950">
                {/* ─── Toolbar ─── */}
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
                            <div className="grid grid-cols-[200px_180px_1fr] gap-3">
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="My Custom Block"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className={`h-8 w-full rounded-lg border bg-zinc-950 px-3 text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:outline-none focus:ring-1 ${
                                            form.errors.name
                                                ? 'border-red-500/50 focus:ring-red-500/50'
                                                : 'border-zinc-800 focus:ring-zinc-700'
                                        }`}
                                    />
                                    {form.errors.name && (
                                        <p className="mt-0.5 text-[10px] text-red-400">{form.errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                        Type ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="myCustomBlock"
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value)}
                                        className={`h-8 w-full rounded-lg border bg-zinc-950 px-3 font-mono text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:outline-none focus:ring-1 ${
                                            form.errors.type
                                                ? 'border-red-500/50 focus:ring-red-500/50'
                                                : 'border-zinc-800 focus:ring-zinc-700'
                                        }`}
                                    />
                                    {form.errors.type && (
                                        <p className="mt-0.5 text-[10px] text-red-400">{form.errors.type}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="A brief description of what this block does"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        className="h-8 w-full min-w-75 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder-zinc-600 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-700"
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
                                disabled={form.processing}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                            >
                                {form.processing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Save className="h-3 w-3" />
                                )}
                                {form.processing ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* ─── Window Chrome ─── */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
                    <div className="flex items-center gap-4">
                        <TrafficLights />
                        <div className="flex items-center">
                            <div className="rounded-t-md border border-b-0 border-zinc-700 bg-zinc-800 px-3 py-1">
                                <span className="text-xs text-zinc-300">
                                    {form.data.type || 'untitled'}.tsx
                                </span>
                            </div>
                        </div>
                    </div>
                    <StatusIndicator status={previewStatus} />
                </div>

                {/* ─── Split Pane ─── */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Editor side */}
                    <div className="flex w-1/2 flex-col border-r border-zinc-800">
                        <div className="border-b border-zinc-800/50 px-4 py-2">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                                Editor
                            </span>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                defaultLanguage="typescript"
                                path="custom-block.tsx"
                                value={form.data.source_code}
                                onChange={(value) => form.setData('source_code', value ?? '')}
                                theme="vs-dark"
                                beforeMount={(monaco) => {
                                    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                                        target: monaco.languages.typescript.ScriptTarget.Latest,
                                        module: monaco.languages.typescript.ModuleKind.ESNext,
                                        moduleResolution:
                                        monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                                        jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                                        allowJs: true,
                                        esModuleInterop: true,
                                        allowNonTsExtensions: true,
                                    });
                                    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                                        noSemanticValidation: true,
                                        noSyntaxValidation: false,
                                    });
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
                                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                    fontLigatures: true,
                                }}
                            />
                        </div>
                    </div>

                    {/* Preview side */}
                    <div className="flex w-1/2 flex-col bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-2">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                                Preview
                            </span>
                            <ViewportToggle active={viewport} onChange={setViewport} />
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
                                        onStatusChange={setPreviewStatus}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
