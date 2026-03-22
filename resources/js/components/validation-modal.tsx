import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ValidationIssue } from '@/lib/transpile-block';


interface ValidationModalProps {
    issues: ValidationIssue[];
    onClose: () => void;
    onConfirm: () => void;
    saving: boolean;
}

export function ValidationModal({ issues, onClose, onConfirm, saving }: ValidationModalProps) {
    const errors = issues.filter((i) => i.level === 'error');
    const warnings = issues.filter(
        (i) => i.level === 'warning' && i.message !== 'All checks passed.',
    );
    const hasErrors = errors.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
                    {hasErrors ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10">
                            <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                    ) : warnings.length > 0 ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                        </div>
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                            {hasErrors
                                ? 'Validation Failed'
                                : warnings.length > 0
                                    ? 'Warnings Found'
                                    : 'Validation Passed'}
                        </h3>
                        <p className="text-xs text-zinc-500">
                            {hasErrors
                                ? 'Fix these errors before saving.'
                                : warnings.length > 0
                                    ? 'Your block will work, but could be improved.'
                                    : 'All checks passed.'}
                        </p>
                    </div>
                </div>

                {/* Issues list */}
                {(errors.length > 0 || warnings.length > 0) && (
                    <div className="max-h-64 overflow-y-auto px-5 py-3">
                        <div className="space-y-2">
                            {errors.map((issue, i) => (
                                <div
                                    key={`error-${i}`}
                                    className="flex items-start gap-2 rounded-lg bg-red-500/5 px-3 py-2"
                                >
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                                    <span className="text-xs text-red-300">{issue.message}</span>
                                </div>
                            ))}
                            {warnings.map((issue, i) => (
                                <div
                                    key={`warning-${i}`}
                                    className="flex items-start gap-2 rounded-lg bg-amber-500/5 px-3 py-2"
                                >
                                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                                    <span className="text-xs text-amber-300">{issue.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-5 py-3">
                    {hasErrors ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-8 items-center rounded-lg bg-zinc-800 px-4 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
                        >
                            Go fix them
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-8 items-center rounded-lg border border-zinc-800 px-4 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                            >
                                Go back
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={saving}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : warnings.length > 0 ? 'Save anyway' : 'Save'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
