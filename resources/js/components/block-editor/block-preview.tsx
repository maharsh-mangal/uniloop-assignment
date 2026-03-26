
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ErrorBoundary } from '@/components/error-boundry';
import { transpileAndExtract } from '@/lib/transpile-block';
import type { BlockDefinition } from '@/packages/survey-form-package/src/types';


import { ErrorDisplay } from './error-display';
import type { PreviewStatus } from './status-indicator';

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

export function BlockPreview({
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

    const updateStatus = useCallback(
        (status: PreviewStatus) => {
            onStatusChange(status);
        },
        [onStatusChange],
    );

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        updateStatus('compiling');

        timerRef.current = setTimeout(() => {
            const result = transpileAndExtract(sourceCode);

            if (result.success && result.blockDefinition) {
                setBlockDef(result.blockDefinition);
                setError(null);
                setKey((k) => k + 1);
                updateStatus('live');
            } else {
                setBlockDef(null);
                setError(result.error || 'Unknown error');
                updateStatus('error');
            }
        }, 800);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [sourceCode, runTrigger, updateStatus]);

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
