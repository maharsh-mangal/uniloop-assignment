import { Monitor, Smartphone, Tablet } from 'lucide-react';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%',
};

export function ViewportToggle({
    active,
    onChange,
}: {
    active: ViewportSize;
    onChange: (size: ViewportSize) => void;
}) {
    const sizes: {
        key: ViewportSize;
        icon: typeof Smartphone;
        label: string;
    }[] = [
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
