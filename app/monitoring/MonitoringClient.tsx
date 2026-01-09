'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Calendar, Clock, Boxes, Map,
    Tractor, ChevronRight, LayoutDashboard,
    AlertTriangle, CheckCircle2, Factory,
    RefreshCcw, User, Maximize, Minimize,
    LogOut, Sun, Moon, ArrowUpRight, ArrowDownRight,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';

interface MonitoringClientProps {
    stats: any;
}

const unitMap: any = {
    'KG': 'KG',
    'TON': 'TONNA',
    'LITER': 'LITR',
    'GRAMM': 'GRAMM',
    'SACK': 'QOP',
    'METER': 'METR',
    'PIECE': 'DONA'
};

export default function MonitoringClient({ stats }: MonitoringClientProps) {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isManualTheme, setIsManualTheme] = useState(false);

    // Auto-scroll ref
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-theme based on time (6:00 - 18:00 is Day, else Night)
    useEffect(() => {
        if (!isManualTheme) {
            const hour = currentTime.getHours();
            const shouldBeDark = hour >= 18 || hour < 6;
            if (isDarkMode !== shouldBeDark) {
                setIsDarkMode(shouldBeDark);
            }
        }
    }, [currentTime, isManualTheme]);

    // Live Clock & Auto-refresh & Auto-scroll
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const refreshTimer = setInterval(() => router.refresh(), 5 * 60 * 1000); // 5 min

        // Auto-scroll logic for TV
        const scrollInterval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
                if (scrollTop + clientHeight >= scrollHeight - 5) {
                    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ top: 1, behavior: 'auto' });
                }
            }
        }, 50); // Slow scroll for visibility

        document.body.classList.add('hide-global-sidebar');

        return () => {
            clearInterval(timer);
            clearInterval(refreshTimer);
            clearInterval(scrollInterval);
            document.body.classList.remove('hide-global-sidebar');
        };
    }, [router]);

    if (!stats) return <div className="p-20 text-center font-black text-gray-400">Ma'lumotlar yuklanmoqda...</div>;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleThemeToggle = () => {
        setIsManualTheme(true);
        setIsDarkMode(!isDarkMode);
    };

    // Uzbek Date Formatting
    const uzDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const uzMonths = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
    ];

    const dayName = uzDays[currentTime.getDay()];
    const monthName = uzMonths[currentTime.getMonth()];
    const dateDisplay = `${currentTime.getDate()}-${monthName}, ${currentTime.getFullYear()}`;

    // Theme Variables
    const bgClass = isDarkMode ? 'bg-[#0a0c10] text-[#f8fafc]' : 'bg-[#f1f5f9] text-[#1e293b]';
    const cardBg = isDarkMode ? 'bg-[#161b22]/60 border-white/5' : 'bg-white border-gray-200 shadow-sm';
    const innerCardBg = isDarkMode ? 'bg-[#0d1117]/80' : 'bg-gray-50';
    const textMuted = isDarkMode ? 'text-[#8b949e]' : 'text-gray-500';
    const headingColor = isDarkMode ? 'text-white' : 'text-gray-900';

    return (
        <div className={`fixed inset-0 ${bgClass} z-[99999] overflow-hidden font-sans no-sidebar-page transition-colors duration-700 ${isFullscreen ? 'p-0' : 'p-4'}`}>

            <style jsx global>{`
                body.hide-global-sidebar .no-print:has(aside) { display: none !important; }
                body.hide-global-sidebar .main-content { margin-left: 0 !important; padding: 0 !important; max-width: none !important; width: 100vw !important; }
                body.hide-global-sidebar .ambient-bg { display: none !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 20px; }
                .mask-fade-bottom { mask-image: linear-gradient(to bottom, black 85%, transparent 100%); }
                .pulse-red { animation: pulse-red 2s infinite; }
                @keyframes pulse-red {
                    0% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
                    50% { border-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 30px rgba(239, 68, 68, 0.1); }
                    100% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>

            {/* Top Bar */}
            <div className={`flex items-center justify-between backdrop-blur-xl p-5 rounded-[24px] border ${cardBg} mb-6`}>
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-[16px] flex items-center justify-center shadow-lg border border-primary/20">
                        <Factory className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-black tracking-tighter uppercase ${headingColor}`}>NAVBAHOR <span className="text-primary">TEKSTIL</span></h1>
                        <p className={`font-black uppercase tracking-[0.3em] text-[8px] ${textMuted}`}>Strategik Monitoring Tizimi</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-6 px-6 py-2.5 rounded-[20px] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                        <div className={`flex flex-col items-end border-r pr-5 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>{dayName}</span>
                            <span className={`text-lg font-black tracking-tighter ${headingColor}`}>{dateDisplay}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-primary animate-pulse" />
                            <span className="text-3xl font-black font-mono tracking-tighter tabular-nums text-primary">
                                {currentTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleThemeToggle} className={`p-3.5 rounded-[16px] border transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        </button>
                        <button onClick={toggleFullscreen} className={`p-3.5 rounded-[16px] border transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                        <button onClick={() => logout()} className="p-3.5 bg-red-500/10 text-red-500 rounded-[16px] border border-red-500/20"><LogOut className="w-5 h-5" /></button>
                        <button onClick={() => router.refresh()} className="p-3.5 bg-primary text-white rounded-[16px] shadow-lg"><RefreshCcw className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
                {/* LEFT: INVENTORY (HIGH DENSITY) */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                    <div className={`backdrop-blur-md rounded-[32px] border p-6 flex-1 overflow-hidden flex flex-col ${cardBg}`}>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <Boxes className="w-6 h-6 text-primary" />
                                <h2 className={`text-xl font-black uppercase tracking-widest ${headingColor}`}>Ombor <span className="text-primary">Zaxirasi</span></h2>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                {stats.inventory.length} turdagi mahsulot
                            </span>
                        </div>

                        {/* AUTO-SCROLLING GRID */}
                        <div
                            ref={scrollRef}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pr-2 custom-scrollbar"
                        >
                            {stats.inventory.map((item: any) => {
                                const levelPercent = Math.min((item.currentStock / item.peakStock) * 100, 100);
                                const isCritical = item.currentStock <= item.minStockAlert;
                                return (
                                    <div
                                        key={item.id}
                                        className={`${innerCardBg} rounded-[24px] p-4 border transition-all duration-300 ${isCritical ? 'border-red-500/50 pulse-red bg-red-500/5' : 'border-white/5 hover:border-primary/30'}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2 rounded-xl ${isCritical ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                                                <Boxes className={`w-5 h-5 ${isCritical ? 'text-red-500' : 'text-primary'}`} />
                                            </div>
                                            {isCritical && <span className="text-[7px] font-black uppercase text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded-md animate-pulse">Kam</span>}
                                        </div>
                                        <p className={`text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5 ${textMuted} truncate`}>{item.category}</p>
                                        <h3 className={`font-black text-sm truncate mb-3 ${headingColor}`}>{item.name}</h3>
                                        <div className="flex items-baseline gap-1.5 mb-4">
                                            <span className={`text-xl font-black tabular-nums ${isCritical ? 'text-red-500' : headingColor}`}>{item.currentStock.toLocaleString()}</span>
                                            <span className={`text-[8px] font-black uppercase opacity-60 ${textMuted}`}>{unitMap[item.unit] || item.unit}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[7px] font-black uppercase tracking-widest opacity-60">
                                                <span>Daraja</span>
                                                <span className={isCritical ? 'text-red-500' : 'text-primary'}>{Math.round(levelPercent)}%</span>
                                            </div>
                                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${levelPercent}%` }} className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-primary'}`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                    {/* Land Summary */}
                    <div className="bg-primary/10 rounded-[32px] border border-primary/20 p-6 relative overflow-hidden flex items-center gap-5 shadow-inner">
                        <div className="w-12 h-12 bg-primary text-white rounded-[14px] flex items-center justify-center shrink-0 shadow-lg"><Map className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">MAYDON O'LCHAMI</p>
                            <h2 className={`text-4xl font-black ${headingColor}`}>{stats.totalClusterArea.toLocaleString()} <span className="text-sm opacity-40">ga</span></h2>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className={`rounded-[32px] border p-6 flex flex-col overflow-hidden ${cardBg}`}>
                        <h3 className={`text-xs font-black uppercase tracking-widest mb-6 px-1 flex items-center gap-2 ${headingColor}`}>
                            <Tractor className="w-4 h-4 text-primary" /> AGRO MONITOR
                        </h3>
                        <div className="space-y-3.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                            {stats.stageProgress.map((stage: any) => (
                                <div key={stage.id} className={`p-3.5 rounded-[20px] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-2.5">
                                        <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">№{stage.order}</span>
                                        <span className={`text-[11px] font-black ${headingColor}`}>{stage.name}</span>
                                        <span className="text-[12px] font-black text-primary">{Math.round(stage.percent)}%</span>
                                    </div>
                                    <div className={`h-1.5 w-full rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${stage.percent}%` }} className={`h-full rounded-full ${stage.percent >= 100 ? 'bg-green-500' : 'bg-primary'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RECENT FEED */}
                    <div className={`rounded-[32px] border p-6 flex-1 overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#0d1117] border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${textMuted}`}>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> OMBOR LOGLARI
                        </h3>
                        <div className="space-y-4 overflow-hidden mask-fade-bottom">
                            {stats.recentWarehouseActions.map((act: any) => (
                                <div key={act.id} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${act.type === 'IN' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                        {act.type === 'IN' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-black text-xs truncate ${headingColor}`}>{act.product.name}</p>
                                        <p className={`text-[8px] font-bold tracking-widest uppercase truncate ${textMuted}`}>{act.amount.toLocaleString()} {unitMap[act.product.unit] || act.product.unit}</p>
                                    </div>
                                    <span className="text-[8px] font-black tabular-nums opacity-40">{new Date(act.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
