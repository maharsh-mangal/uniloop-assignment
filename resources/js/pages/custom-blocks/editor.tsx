import { Head, useForm } from '@inertiajs/react';
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

const DEFAULT_SOURCE = `import React, { forwardRef } from "react";
import type {
  BlockDefinition,
  ContentBlockItemProps,
  BlockRendererProps,
  BlockData,
} from "@/packages/survey-form-package/src/types";
import { Label } from "@/packages/survey-form-package/src/components/ui/label";
import { Input } from "@/packages/survey-form-package/src/components/ui/input";
import { Card } from "@/packages/survey-form-package/src/components/ui/card";
import { Type } from "lucide-react";
import { cn } from "@/packages/survey-form-package/src/lib/utils";
import { themes } from "@/packages/survey-form-package/src/themes";

const CustomRenderer = forwardRef<HTMLInputElement, BlockRendererProps>(
  ({ block, value, onChange, onBlur, error, disabled, theme }, ref) => {
    const themeConfig = theme ?? themes.default;

    return (
      <div className="w-full min-w-0">
        {block.label && (
          <Label className={cn("mb-2 block", themeConfig.field.label)}>
            {block.label}
          </Label>
        )}
        <Input
          ref={ref}
          type="text"
          placeholder={block.placeholder}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(error && "border-destructive", themeConfig.field.input)}
        />
        {error && (
          <div className={cn("text-sm mt-1", themeConfig.field.error)}>{error}</div>
        )}
      </div>
    );
  }
);

CustomRenderer.displayName = "CustomRenderer";

const CustomBlockItem: React.FC<ContentBlockItemProps> = ({ data }) => (
  <Card className="space-y-2 p-4">
    {data.label && <Label>{data.label}</Label>}
    <Input disabled placeholder={data.placeholder || "Preview"} />
  </Card>
);

const CustomBlockPreview: React.FC = () => (
  <div className="w-full flex items-center justify-center py-1">
    <div className="w-4/5 border rounded-md p-2 text-xs text-muted-foreground bg-muted/30">
      Custom Input
    </div>
  </div>
);

export const CustomBlock: BlockDefinition = {
  type: "customBlock",
  name: "Custom Block",
  description: "A custom input block",
  icon: <Type className="w-4 h-4" />,
  defaultData: {
    type: "customBlock",
    fieldName: "customField",
    label: "Custom Field",
    placeholder: "Enter value...",
  },
  renderItem: (props) => <CustomBlockItem {...props} />,
  renderFormFields: () => <div>No config</div>,
  renderPreview: () => <CustomBlockPreview />,
  renderBlock: (props) => <CustomRenderer {...props} />,
  validate: (data: BlockData) => {
    if (!data.fieldName) return "Field name is required";
    return null;
  },
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
            <Head
                title={isEditing ? `Edit: ${block.name}` : 'New Custom Block'}
            />
            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Top bar */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-4 border-b px-4 py-3"
                >
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
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
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

                                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                                    {
                                        noSemanticValidation: true,
                                        noSyntaxValidation: false, // Keeps basic syntax checks (like missing brackets) active
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
                            }}
                        />
                    </div>

                    {/* Preview panel - empty for now */}
                    <div className="w-1/2 bg-neutral-50 p-6">
                        <div className="mb-4 text-sm font-medium text-neutral-500">
                            Preview
                        </div>
                        <div className="rounded-lg border bg-white p-6">
                            <p className="text-sm text-neutral-400">
                                Live preview will render here
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
