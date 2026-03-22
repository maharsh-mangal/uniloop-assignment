import { XCircle } from 'lucide-react';

export function ErrorDisplay({ title, message }: { title: string; message: string }) {
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
