'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Map,
    History,
    Plus,
    TrendingUp,
    TrendingDown,
    Package,
    Calendar,
    ChevronRight,
    Tractor,
    X,
    CheckCircle2
} from 'lucide-react';
import { createBrigadierTransaction, updateFieldActivity } from '../actions/brigades';
import { toast } from 'react-hot-toast';
import { askAgronomist, getAIChatHistory } from '../actions/ai-agronomist';
import { Send, Bot, CloudSun, Check, AlertCircle, Clock, LogOut } from 'lucide-react';
import { logout } from '../actions/auth';

interface BrigadierDashboardProps {
    brigadier: any;
    products: any[];
    workStages: any[];
    activities: any[];
    inventory: any[];
    userId: string;
}

export default function BrigadierDashboard({
    brigadier,
    products = [],
    workStages = [],
    activities = [],
    inventory = [],
    userId
}: BrigadierDashboardProps) {
    const [activeTab, setActiveTab] = useState<'home' | 'inventory' | 'history' | 'ai'>('home');
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [trType, setTrType] = useState<'IN' | 'OUT'>('OUT');
    const [showActivityModal, setShowActivityModal] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load AI History
        getAIChatHistory().then(history => {
            if (history && history.length > 0) {
                setMessages(history);
                const lastMsgWithWeather = [...history].reverse().find(m => m.weather);
                if (lastMsgWithWeather) setWeather(lastMsgWithWeather.weather);
            }
        });
    }, []);


    // AI Chat State
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "Assalomu alaykum! Men sizning shaxsiy AI agronomingizman. Ob-havoni inobatga olgan holda maslahat bera olaman. Savolingiz bormi?" }
    ]);
    const [input, setInput] = useState("");
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [weather, setWeather] = useState<any>(null);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsAiThinking(true);

        const res = await askAgronomist(userMsg);
        setIsAiThinking(false);

        if (res.success) {
            setMessages(prev => [...prev, { role: 'ai', text: res.answer || "Javobni ololmadim." }]);
            if (res.weather) setWeather(res.weather);
        } else {
            toast.error(res.error || "Xatolik");
            setMessages(prev => [...prev, { role: 'ai', text: "Kechirasiz, hozir javob bera olmayman." }]);
        }
    };

    const handleTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            type: formData.get("type") as "IN" | "OUT",
            amount: parseFloat(formData.get("amount") as string),
            productId: formData.get("productId") as string,
            brigadierId: brigadier.id,
            contourId: formData.get("contourId") as string || undefined,
            description: formData.get("description") as string,
            createdById: userId
        };

        const res = await createBrigadierTransaction(data);
        setIsSubmitting(false);

        if (res.success) {
            toast.success("Amaliyot muvaffaqiyatli saqlandi");
            setShowTransactionForm(false);
        } else {
            toast.error(res.error || "Xatolik yuz berdi");
        }
    };

    const handleActivityUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        if (!showActivityModal?.contour) return;

        const data = {
            contourId: showActivityModal.contour.id,
            workStageId: formData.get("workStageId") as string,
            brigadierId: brigadier.id,
            status: formData.get("status") as any,
            comment: formData.get("comment") as string
        };

        const res = await updateFieldActivity(data);
        setIsSubmitting(false);

        if (res.success) {
            toast.success("Tadbir holati yangilandi");
            setShowActivityModal(null);
        } else {
            toast.error(res.error || "Xatolik yuz berdi");
        }
    };

    const getActivityForStage = (contourId: string, stageId: string) => {
        if (!activities) return null;
        return activities.find(a => a && a.contourId === contourId && a.workStageId === stageId);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32" suppressHydrationWarning>
            {/* Simple Top Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50" suppressHydrationWarning>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Tractor className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 leading-none">
                            {brigadier.user?.fullName?.split(' ')[0]}
                        </h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brigadir</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Bugun</span>
                        <span className="text-sm font-bold text-gray-900 leading-none mt-1">
                            {mounted ? new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' }) : '...'}
                        </span>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black text-gray-900">Mening Dalalarim</h3>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {brigadier.contours?.length || 0} ta kontur
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {brigadier.contours?.length > 0 ? brigadier.contours.map((contour: any) => (
                                        <div key={contour.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100" suppressHydrationWarning>
                                            <div className="flex justify-between items-start mb-6" suppressHydrationWarning>
                                                <div className="flex items-center gap-4" suppressHydrationWarning>
                                                    <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-2xl" suppressHydrationWarning>
                                                        {contour.number}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900">{contour.name || `Kontur №${contour.number}`}</h4>
                                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{contour.area} Gektar</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShowActivityModal({ contour })}
                                                    className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                                                >
                                                    <Plus className="w-6 h-6" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-5 gap-2 pt-4 border-t border-gray-50">
                                                {workStages.map((stage) => {
                                                    const activity = getActivityForStage(contour.id, stage.id);
                                                    return (
                                                        <div
                                                            key={stage.id}
                                                            title={stage.name}
                                                            className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${activity?.status === 'COMPLETED'
                                                                ? 'bg-primary border-primary text-white'
                                                                : activity?.status === 'IN_PROGRESS'
                                                                    ? 'bg-orange-50 border-orange-200 text-orange-600 animate-pulse'
                                                                    : 'bg-white border-gray-100 text-gray-300'
                                                                }`}
                                                        >
                                                            {activity?.status === 'COMPLETED' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                            <span className="text-[8px] font-black uppercase text-center truncate px-1 w-full">{stage.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center px-6">
                                            <Tractor className="w-12 h-12 text-gray-200 mb-4" />
                                            <p className="text-gray-400 font-bold">Sizga hali kontur biriktirilmagan</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'inventory' && (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-gray-900">Mening Zahiram</h3>
                                <button
                                    onClick={() => setShowTransactionForm(true)}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Qayd Qilish</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {inventory.map(prod => (
                                    <div key={prod.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                <Package className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{prod.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{prod.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-primary leading-none">{prod.currentStock}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mt-1">{prod.unit}</p>
                                        </div>
                                    </div>
                                ))}
                                {inventory.length === 0 && (
                                    <div className="col-span-full py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center px-6">
                                        <Package className="w-12 h-12 text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold">Zahira bo'sh. Omborga murojaat qiling.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xl font-black text-gray-900">Oxirgi Harakatlar</h3>
                            <div className="space-y-3">
                                {brigadier.transactions?.length > 0 ? brigadier.transactions.map((tr: any) => (
                                    <div key={tr.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(tr.type === 'OUT' || tr.type === 'CONSUMPTION') ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {(tr.type === 'OUT' || tr.type === 'CONSUMPTION') ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{tr.product?.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">
                                                    {mounted ? new Date(tr.date).toLocaleDateString('uz-UZ') : '...'} • {tr.contour ? `№${tr.contour.number}` : "Umumiy"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${(tr.type === 'OUT' || tr.type === 'CONSUMPTION') ? 'text-orange-600' : 'text-blue-600'}`}>
                                                {(tr.type === 'OUT' || tr.type === 'CONSUMPTION') ? '-' : '+'}{tr.amount}
                                            </p>
                                            <p className="text-[8px] font-black text-gray-300 uppercase">{tr.product?.unit}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-gray-300 font-bold">Harakatlar tarixi bo'sh</div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ai' && (
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-[calc(100vh-280px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {/* Weather Header in Chat */}
                            {weather && (
                                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-blue-800">
                                        <CloudSun className="w-5 h-5" />
                                        <span className="font-bold text-xs">Navbahor: {weather.temp}°C, {weather.description}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                            <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isAiThinking && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 px-4 py-2 rounded-2xl animate-pulse text-xs font-bold text-gray-400 italic">O'ylayapman...</div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Maslahat so'rang..."
                                    className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isAiThinking}
                                    className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-[60] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-primary' : 'text-gray-300'}`}
                >
                    <Tractor className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ishlar</span>
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'inventory' ? 'text-primary' : 'text-gray-300'}`}
                >
                    <Package className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ombor</span>
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'ai' ? 'text-primary' : 'text-gray-300'}`}
                >
                    <Bot className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-primary' : 'text-gray-300'}`}
                >
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tarix</span>
                </button>
            </div>

            {/* Modals are still here, but simplified */}
            <AnimatePresence>
                {showTransactionForm && (
                    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setShowTransactionForm(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-lg bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-gray-900">Mahsulotni Qayd Etish</h3>
                                <button onClick={() => setShowTransactionForm(false)} className="p-2 bg-gray-100 rounded-full">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={handleTransaction} className="space-y-6 pb-6">
                                <div className="flex p-1 bg-gray-100 rounded-2xl">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="OUT"
                                            checked={trType === 'OUT'}
                                            onChange={() => setTrType('OUT')}
                                            className="sr-only"
                                        />
                                        <div className={`py-4 rounded-xl text-center text-sm font-black transition-all ${trType === 'OUT' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400'}`}>
                                            SARF
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="IN"
                                            checked={trType === 'IN'}
                                            onChange={() => setTrType('IN')}
                                            className="sr-only"
                                        />
                                        <div className={`py-4 rounded-xl text-center text-sm font-black transition-all ${trType === 'IN' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>
                                            KIRIM
                                        </div>
                                    </label>
                                </div>
                                <select name="productId" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800">
                                    <option value="">Mahsulotni tanlang...</option>
                                    {(trType === 'OUT' ? inventory : products).map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {trType === 'OUT' ? `(${p.currentStock} ${p.unit})` : `(${p.unit})`}
                                        </option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="amount" type="number" step="0.01" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Miqdori" />
                                    <select name="contourId" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        <option value="">Umumiy</option>
                                        {brigadier.contours?.map((c: any) => <option key={c.id} value={c.id}>№{c.number}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20">
                                    {isSubmitting ? "Saqlanmoqda..." : "Tasdiqlash"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showActivityModal && (
                    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setShowActivityModal(null)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-lg bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Ish Bajarilishini Tasdiqlash</h3>
                                    <p className="text-sm font-bold text-gray-400">Kontur №{showActivityModal.contour.number}</p>
                                </div>
                                <button onClick={() => setShowActivityModal(null)} className="p-2 bg-gray-100 rounded-full">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={handleActivityUpdate} className="space-y-6 pb-6">
                                <select name="workStageId" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    {workStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <select name="status" required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold">
                                    <option value="IN_PROGRESS">Jarayonda</option>
                                    <option value="COMPLETED">Bajarildi</option>
                                    <option value="PENDING">Kutilmoqda</option>
                                    <option value="CANCELLED">Bekor qilindi</option>
                                </select>
                                <textarea name="comment" rows={3} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold resize-none" placeholder="Izoh (ixtiyoriy)..." />
                                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20">
                                    {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
