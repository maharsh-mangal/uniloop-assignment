export function StatusBadge({ isActive }: { isActive: boolean }) {
    if (isActive) {
        return (
            <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 px-0.5 py-0.5 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
                <span className="h-1.5 w-1 rounded-full bg-emerald-400" />
                Active
            </span>
        );
    }

    return (
        <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-500/10 px-0.5 py-0.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            <span className="h-1.5 w-1 rounded-full bg-zinc-500" />
            Inactive
        </span>
    );
}
