import { Circle, Loader2 } from 'lucide-react';

export type PreviewStatus = 'idle' | 'compiling' | 'live' | 'error';

export function StatusIndicator({ status }: { status: PreviewStatus }) {
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
