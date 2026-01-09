'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();
        // Mock real-time: poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
            >
                <Bell className={clsx("w-5 h-5 transition-transform", isOpen ? "scale-110" : "group-hover:rotate-12")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black/5"
                        >
                            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-black text-gray-800 tracking-tight">Bildirishnomalar</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                    >
                                        Hammasini o'qish
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-400">Hozircha xabarlar yo'q</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={clsx(
                                                    "p-5 transition-colors relative group",
                                                    !n.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-gray-50"
                                                )}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="mt-1">{getIcon(n.type)}</div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{n.title}</h4>
                                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                                {new Date(n.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{n.message}</p>
                                                        {n.link && (
                                                            <Link
                                                                href={n.link}
                                                                className="text-[10px] font-bold text-primary inline-block mt-2 hover:underline"
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                Batafsil ko'rish →
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(n.id)}
                                                        className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-green-500 transition-all"
                                                        title="O'qilgan deb belgilash"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                                <button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                    Barcha xabarlar tarixi
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
