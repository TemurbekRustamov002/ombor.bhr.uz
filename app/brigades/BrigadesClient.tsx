'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Map as MapIcon,
    Plus,
    Search,
    Tractor,
    Phone,
    MapPin,
    ChevronRight,
    UserPlus,
    LayoutGrid,
    CheckCircle2,
    X,
    FileText,
    Calendar,
    Settings,
    RotateCcw,
    ClipboardCheck,
    Download,
    Trash2,
    ArrowRight
} from 'lucide-react';
import {
    createBrigadier,
    createContour,
    assignContour,
    createWorkStage,
    deleteWorkStage,
    resetFieldActivities,
    assignWorkPlanToContour
} from '../actions/brigades';
import { toast } from 'react-hot-toast';
import { exportBrigadeActivities } from '@/lib/excel';

interface BrigadesClientProps {
    initialBrigadiers: any[];
    initialContours: any[];
    initialWorkStages: any[];
    initialActivities: any[];
}

// Sub-components for better organization
function AgroPlanView({ contours, workStages, activities }: { contours: any[], workStages: any[], activities: any[] }) {
    const [selectedContour, setSelectedContour] = useState<string>('');
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [plannedActivities, setPlannedActivities] = useState<any[]>(activities);

    const handleAssign = async () => {
        if (!selectedContour || selectedStages.length === 0) {
            toast.error("Kontur va kamida bitta ish turini tanlang");
            return;
        }
        const contour = contours.find(c => c.id === selectedContour);
        if (!contour.brigadierId) {
            toast.error("Ushbu konturga hali brigadir biriktirilmagan!");
            return;
        }

        const res = await assignWorkPlanToContour(selectedContour, selectedStages, contour.brigadierId);
        if (res.success) {
            toast.success("Agro-reja muvaffaqiyatli saqlandi");
            setSelectedStages([]);
        } else toast.error(res.error);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" /> Reja Tuzish
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Konturni Tanlang</label>
                            <select
                                value={selectedContour}
                                onChange={(e) => setSelectedContour(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-800 appearance-none border-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Tanlang...</option>
                                {contours.map(c => (
                                    <option key={c.id} value={c.id}>Kontur №{c.number} ({c.area} GA) - {c.brigadier?.user?.fullName || 'Brigadirsiz'}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Ish Turlarini Tanlang</label>
                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {workStages.map(ws => (
                                    <label key={ws.id} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${selectedStages.includes(ws.id) ? 'bg-primary/5 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}>
                                        <span className="font-bold text-sm">{ws.name}</span>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedStages.includes(ws.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedStages([...selectedStages, ws.id]);
                                                else setSelectedStages(selectedStages.filter(id => id !== ws.id));
                                            }}
                                        />
                                        {selectedStages.includes(ws.id) ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleAssign}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ClipboardCheck className="w-5 h-5" />
                            Rejani Tasdiqlash
                        </button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm h-full">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Joriy Agro-Tadbirlar Holati</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                <tr>
                                    <th className="pb-4 px-4">Kontur</th>
                                    <th className="pb-4 px-4">Tadbir</th>
                                    <th className="pb-4 px-4">Mas'ul</th>
                                    <th className="pb-4 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activities.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-gray-400 font-bold italic">Hali rejalar tuzilmagan</td>
                                    </tr>
                                ) : activities.map((act) => (
                                    <tr key={act.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4 font-black text-gray-800">№{act.contour.number}</td>
                                        <td className="py-4 px-4 font-bold text-gray-700">{act.workStage.name}</td>
                                        <td className="py-4 px-4 text-sm font-semibold text-gray-500">{act.contour.brigadier?.user?.fullName}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ${act.status === 'COMPLETED' ? 'bg-green-50 text-green-600 ring-green-600/10' :
                                                act.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 ring-blue-600/10' :
                                                    'bg-amber-50 text-amber-600 ring-amber-600/10'
                                                }`}>
                                                {act.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function WorkStagesView({ workStages, onCreateStage }: { workStages: any[], onCreateStage: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Agrotexnik Ish Turlari</h3>
                    <p className="text-gray-500 font-medium">Klaster bo'yicha standart tadbirlar ketma-ketligi</p>
                </div>
                <button
                    onClick={onCreateStage}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-primary transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Yangi Ish Turi
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workStages.map((stage: any) => (
                    <div key={stage.id} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all">
                            <Settings className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-xl">
                                {stage.order}
                            </div>
                            <h4 className="text-xl font-black text-gray-900">{stage.name}</h4>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                            {stage.description || "Ushbu tadbir bo'yicha qo'shimcha ma'lumot kiritilmagan."}
                        </p>
                        <div className="flex gap-2">
                            <button className="grow py-3 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                                onClick={async () => {
                                    if (confirm("Haqiqatan ham ushbu ish turini o'chirmoqchimisiz?")) {
                                        const res = await deleteWorkStage(stage.id);
                                        if (res.success) toast.success("O'chirildi");
                                        else toast.error(res.error);
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4" /> O'chirish
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default function BrigadesClient({
    initialBrigadiers,
    initialContours,
    initialWorkStages,
    initialActivities
}: BrigadesClientProps) {
    const [activeTab, setActiveTab] = useState<'brigadiers' | 'contours' | 'agroplan' | 'workstages'>('brigadiers');
    const [showBrigadierForm, setShowBrigadierForm] = useState(false);
    const [showContourForm, setShowContourForm] = useState(false);
    const [showStageForm, setShowStageForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter logic
    const filteredBrigadiers = initialBrigadiers.filter(b =>
        b.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredContours = initialContours.filter(c =>
        c.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateBrigadier = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await createBrigadier(formData);
        setLoading(false);
        if (res.success) {
            toast.success("Brigadir muvaffaqiyatli yaratildi");
            setShowBrigadierForm(false);
        } else {
            toast.error(res.error || "Xatolik yuz berdi");
        }
    };

    const handleCreateContour = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await createContour(formData);
        setLoading(false);
        if (res.success) {
            toast.success("Kontur muvaffaqiyatli yaratildi");
            setShowContourForm(false);
        } else {
            toast.error(res.error || "Xatolik yuz berdi");
        }
    };

    const handleResetActivities = async () => {
        if (!confirm("Haqiqatan ham barcha agrotexnik tadbirlarni o'chirib yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) return;
        setLoading(true);
        const res = await resetFieldActivities();
        setLoading(false);
        if (res.success) toast.success("Barcha tadbirlar tozalandi");
        else toast.error(res.error);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">BRIGADA BOSHQUVI</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-xs">Yer nazorati va agrotexnik rejalashtirish markazi</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleResetActivities}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all active:scale-95"
                        title="Barcha tadbirlarni tozalash"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>Tugatish/Tozalash</span>
                    </button>
                    <button
                        onClick={() => exportBrigadeActivities(initialActivities)}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        <span>Hisobot (Excel)</span>
                    </button>
                    <button
                        onClick={() => setShowBrigadierForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-primary border border-primary/20 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Yangi Brigadir</span>
                    </button>
                    <button
                        onClick={() => setShowContourForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Kontur Qo'shish</span>
                    </button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/40 p-3 rounded-[32px] border border-white/80 backdrop-blur-md shadow-sm">
                <div className="lg:col-span-8 overflow-x-auto">
                    <div className="flex p-1 bg-gray-100/60 rounded-[22px] w-fit whitespace-nowrap">
                        {[
                            { id: 'brigadiers', label: 'Brigadirlar', icon: Users },
                            { id: 'contours', label: 'Yer Maydonlari', icon: MapIcon },
                            { id: 'agroplan', label: 'Agro-Reja', icon: Calendar },
                            { id: 'workstages', label: 'Ish Turlari', icon: Settings },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-white text-primary shadow-md ring-1 ring-black/5 scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Tizim bo'ylab qidirish..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'brigadiers' && (
                    <motion.div
                        key="brigadiers"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredBrigadiers.map((brigadier) => (
                            <div key={brigadier.id} className="group bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                                            <Tractor className="w-8 h-8" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full ring-1 ring-green-600/10">Faol</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors mb-1">{brigadier.user?.fullName}</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">@{brigadier.user?.username}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Konturlar</p>
                                            <p className="text-xl font-black text-gray-800">{brigadier.contours?.length || 0}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Ishlar</p>
                                            <p className="text-xl font-black text-gray-800">
                                                {initialActivities.filter(a => a.brigadierId === brigadier.id).length}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                                            <span className="text-sm font-bold">{brigadier.phone || "+998 -- --- -- --"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
                                            <span className="text-sm font-bold truncate">{brigadier.address || "Manzil kiritilmagan"}</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 group-hover:bg-primary transition-all shadow-lg active:scale-95">
                                        <span>Boshqaruv Paneli</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'contours' && (
                    <motion.div
                        key="contours"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {filteredContours.map((contour) => (
                            <div key={contour.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all" />
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-xl hover:rotate-6 transition-transform">
                                        {contour.number}
                                    </div>
                                    <span className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                                        {contour.area} Gektar
                                    </span>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-4 truncate">{contour.name || `Kontur №${contour.number}`}</h4>

                                <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                            <Users className="w-5 h-5 text-primary/60" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Brigadir</p>
                                            <p className="text-sm font-bold text-gray-700 truncate">
                                                {contour.brigadier ? contour.brigadier.user?.fullName : "Biriktirilmagan"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-3 text-xs font-black text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-xl transition-all border border-primary/10 active:scale-95">
                                    Biriktirishni o'zgartirish
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'agroplan' && (
                    <AgroPlanView
                        contours={initialContours}
                        workStages={initialWorkStages}
                        activities={initialActivities}
                    />
                )}

                {activeTab === 'workstages' && (
                    <WorkStagesView
                        workStages={initialWorkStages}
                        onCreateStage={() => setShowStageForm(true)}
                    />
                )}
            </AnimatePresence>

            {/* Modals & Views Helpers */}
            <AnimatePresence>
                {showStageForm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowStageForm(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8" >
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Yangi Ish Turi (Stage)</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const res = await createWorkStage(fd.get('name') as string, parseInt(fd.get('order') as string), fd.get('description') as string);
                                if (res.success) { toast.success("Muvaffaqiyatli"); setShowStageForm(false); }
                                else toast.error(res.error);
                            }} className="space-y-4">
                                <input name="name" placeholder="Ish nomi (Masalan: Shudgorlash)" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" />
                                <input name="order" type="number" placeholder="Tartib raqami (1, 2, ...)" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" />
                                <textarea name="description" placeholder="Batafsil ma'lumot (ixtiyoriy)" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold h-32" />
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg">Saqlash</button>
                            </form>
                        </motion.div>
                    </div>
                )}
                {/* Existing modals... */}
                {showBrigadierForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBrigadierForm(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-8">Yangi Brigadir</h2>
                            <form onSubmit={handleCreateBrigadier} className="space-y-5">
                                <input name="fullName" type="text" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="F.I.SH" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="username" type="text" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Login" />
                                    <input name="password" type="password" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Parol" />
                                </div>
                                <input name="phone" type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Telefon" />
                                <input name="address" type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Manzil" />
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg">Saqlash</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showContourForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowContourForm(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-8">Yangi Kontur</h2>
                            <form onSubmit={handleCreateContour} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="number" type="text" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Kontur №" />
                                    <input name="area" type="number" step="0.01" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Maydoni (GA)" />
                                </div>
                                <input name="name" type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold" placeholder="Nomi (Opsional)" />
                                <select name="brigadierId" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold appearance-none">
                                    <option value="">Brigadir Tanlanmagan</option>
                                    {initialBrigadiers.map(b => (
                                        <option key={b.id} value={b.id}>{b.user?.fullName}</option>
                                    ))}
                                </select>
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg">Saqlash</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
