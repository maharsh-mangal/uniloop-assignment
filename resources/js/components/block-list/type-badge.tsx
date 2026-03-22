const TYPE_COLORS: Record<string, string> = {
    input: 'text-emerald-400',
    select: 'text-green-400',
    composite: 'text-purple-400',
    toggle: 'text-orange-400',
    custom: 'text-cyan-400',
};

export function TypeBadge({ type }: { type: string }) {
    const lower = type.toLowerCase();
    const color =
        Object.entries(TYPE_COLORS).find(([key]) => lower.includes(key))?.[1] ||
        'text-blue-400';

    return (
        <span
            className={`font-mono text-xs font-semibold tracking-wider uppercase ${color}`}
        >
            {type}
        </span>
    );
}
