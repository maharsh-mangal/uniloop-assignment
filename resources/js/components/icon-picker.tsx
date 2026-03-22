import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

const ICON_LIST = [
    'Box', 'Type', 'Text', 'Hash', 'List', 'CheckSquare', 'Circle',
    'Star', 'Heart', 'Search', 'Mail', 'Phone', 'MapPin', 'Calendar',
    'Clock', 'User', 'Users', 'Settings', 'Lock', 'Shield', 'Key',
    'CreditCard', 'DollarSign', 'ShoppingCart', 'Tag', 'Bookmark',
    'FileText', 'Image', 'Camera', 'Upload', 'Download', 'Link',
    'Globe', 'Wifi', 'Zap', 'AlertCircle', 'Info', 'HelpCircle',
    'ThumbsUp', 'ThumbsDown', 'MessageSquare', 'Send', 'Bell',
    'ToggleLeft', 'Sliders', 'Filter', 'BarChart', 'PieChart',
    'Activity', 'Thermometer', 'Droplet', 'Pill', 'Stethoscope',
    'Clipboard', 'ClipboardList', 'Edit', 'Trash2', 'Plus', 'Minus',
] as const;

function getIcon(name: string) {
    return (LucideIcons as Record<string, any>)[name] || LucideIcons.Box;
}

export function IconPicker({
                               value,
                               onChange,
                           }: {
    value: string;
    onChange: (name: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const ActiveIcon = getIcon(value);

    const filtered = ICON_LIST.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-8 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
                <ActiveIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{value}</span>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
                        <div className="border-b border-zinc-800 p-2">
                            <input
                                type="text"
                                placeholder="Search icons..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none"
                                autoFocus
                            />
                        </div>
                        <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto p-2">
                            {filtered.map((name) => {
                                const Icon = getIcon(name);

                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        onClick={() => {
                                            onChange(name);
                                            setOpen(false);
                                            setSearch('');
                                        }}
                                        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                                            value === name
                                                ? 'bg-blue-600 text-white'
                                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </button>
                                );
                            })}
                            {filtered.length === 0 && (
                                <p className="col-span-8 py-4 text-center text-xs text-zinc-600">
                                    No icons found
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
