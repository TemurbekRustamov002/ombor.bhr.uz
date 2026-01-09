'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tractor, Warehouse, Activity, LogOut, Leaf, Map, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { logout } from '@/app/actions/auth';

const menuItems = [
    { name: 'Boshqaruv', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTOR'] },
    { name: 'Fermerlar', href: '/farmers', icon: Tractor, roles: ['ADMIN', 'DIRECTOR', 'AGRONOMIST'] },
    { name: 'Brigadalar', href: '/brigades', icon: Map, roles: ['ADMIN', 'DIRECTOR', 'AGRONOMIST'] },
    { name: 'Omborxona', href: '/warehouse', icon: Warehouse, roles: ['ADMIN', 'DIRECTOR', 'WAREHOUSEMAN'] },
    { name: 'Monitoring', href: '/monitoring', icon: Activity, roles: ['ADMIN', 'DIRECTOR', 'AGRONOMIST'] },
    { name: 'Hisobotlar', href: '/reports', icon: FileSpreadsheet, roles: ['ADMIN', 'DIRECTOR'] },
    { name: 'Panel', href: '/brigadier-dashboard', icon: LayoutDashboard, roles: ['BRIGADIER'] },
];

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const filteredMenu = menuItems.filter(item => !item.roles || (user?.role && item.roles.includes(user.role)));

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/40 flex flex-col z-50 shadow-2xl"
        >
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 tracking-tighter uppercase leading-none">Navbahor</h1>
                        <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">Tekstil Cluster</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {filteredMenu.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-white shadow-xl shadow-primary/30 active:scale-95"
                                    : "text-gray-500 hover:bg-white hover:text-primary hover:shadow-lg hover:shadow-black/5"
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                            <span className="font-bold text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 space-y-2 mb-4">
                <div className="px-5 py-4 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center gap-4 ring-1 ring-black/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        {user?.fullName?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{user?.role || 'Admin'}</span>
                        <span className="text-sm font-black text-gray-800 truncate">{user?.fullName || 'Direktor'}</span>
                    </div>
                </div>
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-gray-400 hover:text-red-500 cursor-pointer transition-all rounded-2xl hover:bg-red-50 group font-bold text-sm"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span>Chiqish</span>
                    </div>
                </button>
            </div>
        </motion.aside>
    );
}
