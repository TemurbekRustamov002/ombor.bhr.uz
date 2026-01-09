'use client';

import NotificationBell from './NotificationBell';
import { Search } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-20 flex items-center justify-between px-8 bg-white/40 backdrop-blur-md border-b border-white/40 sticky top-0 z-40 no-print">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Tizim bo'ylab qidirish..."
                        className="w-full bg-white/60 border border-white/80 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />
            </div>
        </header>
    );
}
