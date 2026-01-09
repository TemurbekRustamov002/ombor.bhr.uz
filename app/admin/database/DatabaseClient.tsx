'use client';

import { useState, useEffect } from 'react';
import {
    Database,
    RefreshCw,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    Layout,
    Table as TableIcon,
    ChevronRight,
    Search,
    ArrowLeft,
    Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

import { getDatabaseStats, clearTableData, downloadDatabaseBackup, getTableData, deleteRow } from '@/app/actions/database';

export default function DatabaseManagement() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClearing, setIsClearing] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loadingTable, setLoadingTable] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getDatabaseStats();
            setStats(data.map(d => ({
                ...d,
                icon: d.name === 'User' ? Layout : TableIcon // Simple icon mapping
            })));
        } catch (error) {
            toast.error("Statistikalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleViewTable = async (tableName: string) => {
        setSelectedTable(tableName);
        setLoadingTable(true);
        try {
            const data = await getTableData(tableName);
            if (Array.isArray(data)) {
                setTableData(data);
            } else {
                toast.error("Ma'lumotlarni yuklashda xatolik");
            }
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setLoadingTable(false);
        }
    };

    const handleDeleteRow = async (id: string) => {
        if (!selectedTable) return;
        if (!confirm("Haqiqatdan ham ushbu qatorni o'chirmoqchimisiz?")) return;

        try {
            const res = await deleteRow(selectedTable, id);
            if (res.success) {
                toast.success("O'chirildi");
                setTableData(prev => prev.filter(row => row.id !== id));
            } else {
                toast.error(res.error || "Xatolik");
            }
        } catch (error) {
            toast.error("O'chirishda xatolik");
        }
    };

    const handleBackup = async () => {
        const promise = downloadDatabaseBackup().then(res => {
            if (res.success && res.data) {
                const blob = new Blob([res.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                return "Baza muvaffaqiyatli saqlandi!";
            }
            throw new Error(res.error || "Xatolik yuz berdi");
        });

        toast.promise(promise, {
            loading: 'Baza nusxalanmoqda...',
            success: (msg) => msg,
            error: (err) => err.message,
        });
    };

    const handleClear = async (tableName: string) => {
        if (!confirm(`Haqiqatdan ham "${tableName}" jadvalidagi BARCHA ma'lumotlarni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!`)) {
            return;
        }

        setIsClearing(tableName);
        try {
            const res = await clearTableData(tableName);
            if (res.success) {
                toast.success(`${tableName} tozalandi`);
                fetchStats();
            } else {
                toast.error(res.error || "Xatolik");
            }
        } catch (error) {
            toast.error("Kutilmagan xatolik");
        } finally {
            setIsClearing(null);
        }
    };

    const tableIcons: Record<string, any> = {
        'User': Layout,
        'Farmer': TableIcon,
        'Product': Database,
        'Transaction': RefreshCw,
        'Waybill': CheckCircle2,
        'Brigadier': TableIcon,
        'Contour': TableIcon,
    };

    if (selectedTable) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedTable(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Ortga
                    </button>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <TableIcon className="w-6 h-6 text-primary" />
                        {selectedTable}
                        <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Top 100</span>
                    </h2>
                </div>

                <div className="glass-card p-0 overflow-hidden bg-white border-none ring-1 ring-black/5 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {tableData.length > 0 && Object.keys(tableData[0]).slice(0, 6).map(key => (
                                        <th key={key} className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">
                                            {key}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px] text-right">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loadingTable ? (
                                    <tr><td colSpan={10} className="p-10 text-center text-gray-400">Yuklanmoqda...</td></tr>
                                ) : tableData.length === 0 ? (
                                    <tr><td colSpan={10} className="p-10 text-center text-gray-400">Ma'lumot topilmadi</td></tr>
                                ) : tableData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        {Object.entries(row).slice(0, 6).map(([key, val]: any, idx) => (
                                            <td key={idx} className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                                {typeof val === 'object' && val !== null ?
                                                    (val instanceof Date ? format(val, 'dd.MM.yyyy') : '{...}') :
                                                    String(val).substring(0, 50)}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteRow(row.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="O'chirish"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                        <Database className="w-8 h-8 text-primary" />
                        Ma'lumotlar Bazasi
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">SUPER ADMIN: Tizimning yuragini boshqarish markazi</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleBackup}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        JSON Backup
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 bg-blue-500 text-white border-none shadow-xl shadow-blue-500/20">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80">Database Status</p>
                    <h3 className="text-2xl font-black mt-2 flex items-center gap-2">
                        Online <CheckCircle2 className="w-6 h-6" />
                    </h3>
                    <p className="text-xs mt-4 font-medium opacity-70">Barcha modullar aloqada</p>
                </div>
                <div className="glass-card p-6 border-none ring-1 ring-black/5 bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Jami jadvallar</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">{stats.length} ta</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-primary h-full w-full" />
                    </div>
                </div>
                <div className="glass-card p-6 border-none ring-1 ring-black/5 bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Yozuvlar soni</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">
                        {stats.reduce((acc, s) => acc + s.count, 0).toLocaleString()}
                    </h3>
                    <p className="text-xs text-green-500 font-bold mt-3">Sog'lom holatda</p>
                </div>
                <div className="glass-card p-6 border-none ring-1 ring-black/5 bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ulanishlar</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">Prisma Client</h3>
                    <p className="text-xs text-gray-400 font-medium mt-3 italic tracking-tight underline">Pool size: 10</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-sm flex items-center gap-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            className="bg-transparent border-none outline-none flex-1 font-medium text-sm"
                            placeholder="Jadvallarni qidirish..."
                        />
                    </div>

                    <div className="glass-card border-none ring-1 ring-black/5 p-0 overflow-hidden bg-white">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 backdrop-blur-sm">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Jadval nomi</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Qatorlar soni</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400 font-medium">Yuklanmoqda...</td>
                                    </tr>
                                ) : stats.map((table: any) => (
                                    <tr key={table.name} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => handleViewTable(table.name)}>
                                        <td className="px-8 py-5 flex items-center gap-3">
                                            <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors ring-1 ring-black/5">
                                                {(() => {
                                                    const Icon = tableIcons[table.name] || TableIcon;
                                                    return <Icon className="w-4 h-4" />;
                                                })()}
                                            </div>
                                            <span className="font-bold text-gray-800">{table.name}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-gray-600 bg-gray-100 px-3 py-1.5 rounded-2xl group-hover:bg-gray-200 transition-colors">
                                                {table.count.toLocaleString()} yozuv
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleViewTable(table.name)}
                                                    className="p-2.5 hover:bg-blue-50 rounded-xl text-blue-500 transition-all border border-transparent hover:border-blue-100 shadow-sm"
                                                    title="Ko'rish"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {['Transaction', 'Waybill', 'FieldActivity', 'AIChat', 'AIMessage'].includes(table.name) && (
                                                    <button
                                                        onClick={() => handleClear(table.name)}
                                                        disabled={isClearing === table.name}
                                                        className="p-2.5 hover:bg-red-50 rounded-xl text-red-500 transition-all border border-transparent hover:border-red-100 shadow-sm"
                                                        title="Tozalash"
                                                    >
                                                        {isClearing === table.name ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                                <button onClick={() => handleViewTable(table.name)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-100">
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 border-none ring-1 ring-black/5 bg-gray-900 text-white shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 relative z-10">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Xavfsizlik protokoli
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium relative z-10">
                            Ma'lumotlar bazasi ustida bajarilgan har bir amal (Clear, Delete) qaytarilmas hisoblanadi.
                            Amaldan oldin backup olishingiz tavsiya etiladi.
                        </p>
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Auto-Snapshot</span>
                                <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Logs Retension</span>
                                <span className="text-blue-500">30 Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
