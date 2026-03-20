import { Head, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { transpileAndExtract } from '@/lib/transpile-block';

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

function BlockPreview({ sourceCode }: { sourceCode: string }) {
    const [preview, setPreview] = useState<{
        component: React.ReactNode | null;
        error: string | null;
    }>({ component: null, error: null });

    const [formValue, setFormValue] = useState('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce: wait 800ms after user stops typing before transpiling
    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            const result = transpileAndExtract(sourceCode);

            if (result.success && result.blockDefinition) {
                try {
                    const block = result.blockDefinition;
                    const element = block.renderBlock({
                        block: block.defaultData,
                        value: formValue,
                        onChange: (val: any) => setFormValue(val),
                        error: undefined,
                        disabled: false,
                    });
                    setPreview({ component: element, error: null });
                } catch (err: any) {
                    setPreview({ component: null, error: 'Render error: ' + err.message });
                }
            } else {
                setPreview({ component: null, error: result.error || 'Unknown error' });
            }
        }, 800);

        return () => {
            if (timerRef.current) {
clearTimeout(timerRef.current);
}
        };
    }, [sourceCode]);

    // Re-render with updated value without re-transpiling
    useEffect(() => {
        const result = transpileAndExtract(sourceCode);

        if (result.success && result.blockDefinition) {
            try {
                const block = result.blockDefinition;
                const element = block.renderBlock({
                    block: block.defaultData,
                    value: formValue,
                    onChange: (val: any) => setFormValue(val),
                    error: undefined,
                    disabled: false,
                });
                setPreview({ component: element, error: null });
            } catch (err: any) {
                setPreview({ component: null, error: 'Render error: ' + err.message });
            }
        }
    }, [formValue]);

    if (preview.error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="mb-1 text-sm font-medium text-red-800">Error</div>
                <pre className="whitespace-pre-wrap text-xs text-red-600">{preview.error}</pre>
            </div>
        );
    }

    if (!preview.component) {
        return <p className="text-sm text-neutral-400">Transpiling...</p>;
    }

    return (
        <div className="rounded-lg border bg-white p-6 text-black">
            {preview.component}
        </div>
    );
}

export default function BlockEditor({ block }: { block?: CustomBlock }) {
    const isEditing = !!block;

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

    return (
        <AppLayout>
            <Head title={isEditing ? `Edit: ${block.name}` : 'New Custom Block'} />
            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Top bar */}
                <form onSubmit={handleSubmit} className="flex items-center gap-4 border-b px-4 py-3">
                    <input
                        type="text"
                        placeholder="Block Name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className="rounded-md border px-3 py-1.5 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Type (unique ID)"
                        value={form.data.type}
                        onChange={(e) => form.setData('type', e.target.value)}
                        className="rounded-md border px-3 py-1.5 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        className="rounded-md border px-3 py-1.5 text-sm"
                    />
                    <div className="ml-auto flex gap-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-md bg-neutral-800 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            {form.processing ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>

                {/* Editor + Preview split */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Code editor */}
                    <div className="w-1/2 border-r">
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
                                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
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
                            }}
                        />
                    </div>

                    {/* Preview panel */}
                    <div className="w-1/2 bg-neutral-50 p-6 overflow-y-auto">
                        <div className="mb-4 text-sm font-medium text-neutral-500">Preview</div>
                        <BlockPreview sourceCode={form.data.source_code} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
