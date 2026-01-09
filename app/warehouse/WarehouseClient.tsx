'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ArrowDownLeft, ArrowUpRight, Plus, History, Boxes, PlusCircle, FileText, Download, Building2, Tractor, AlertCircle } from 'lucide-react';
import WarehouseModal from '@/components/WarehouseModal';
import ProductManagementModal from '@/components/ProductManagementModal';
import { motion } from 'framer-motion';
import { exportWarehouseTransactions, exportInventoryReport } from '@/lib/excel';

const formatUnit = (unit: string) => {
    const units: any = {
        'KG': 'kg',
        'TON': 'tonna',
        'LITER': 'litr',
        'GRAMM': 'gr',
        'SACK': 'qop',
        'METER': 'metr',
        'PIECE': 'dona'
    };
    return units[unit] || unit.toLowerCase();
};

export default function WarehouseClient({
    products,
    transactions,
    farmers,
    brigadiers,
    userId
}: {
    products: any[],
    transactions: any[],
    farmers: any[],
    brigadiers: any[],
    userId: string
}) {
    const [activeTab, setActiveTab] = useState<'inventory' | 'transactions'>('inventory');
    const [isOpModalOpen, setIsOpModalOpen] = useState(false);
    const [isProdModalOpen, setIsProdModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const categories = Array.from(new Set(products.map(p => p.category)));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Boxes className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Ombor Boshqaruvi</h1>
                        <p className="text-gray-500 font-medium">Ombor qoldig'i va operatsiyalar nazorati</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => activeTab === 'inventory' ? exportInventoryReport(products) : exportWarehouseTransactions(transactions)}
                        className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 font-bold transform active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        Excel Hisobot
                    </button>
                    <button
                        onClick={() => setIsProdModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm border border-gray-100 font-bold transform active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5 text-primary" />
                        Yangi Mahsulot
                    </button>
                    <button
                        onClick={() => setIsOpModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-primary/30 font-bold transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi Operatsiya
                    </button>
                </div>
            </div>

            <div className="flex gap-4 border-b border-gray-100 mb-6">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'inventory' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Mahsulot Qoldiqlari
                    {activeTab === 'inventory' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'transactions' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Operatsiyalar Tarixi
                    {activeTab === 'transactions' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                </button>
            </div>

            {activeTab === 'inventory' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ring-1 ring-black/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Package className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {p.category}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">{p.name}</h4>
                            <div className="mt-4 flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Mavjud miqdor</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1">
                                        {p.currentStock}<span className="text-sm font-medium text-gray-400 ml-1 lowercase">{formatUnit(p.unit)}</span>
                                    </p>
                                </div>
                                {p.currentStock <= p.minStockAlert && (
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded animate-pulse">
                                        Kam qoldi!
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <p className="text-xs font-medium text-gray-400">Oxirgi yangilanish: {mounted ? new Date(p.updatedAt).toLocaleDateString() : '...'}</p>
                                <button className="text-xs font-bold text-primary hover:underline">Tafsilotlar</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card border-none ring-1 ring-black/5 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="px-6 py-5">Turi</th>
                                    <th className="px-6 py-5">Mahsulot</th>
                                    <th className="px-6 py-5">Miqdor</th>
                                    <th className="px-6 py-5">Hujjat №</th>
                                    <th className="px-6 py-5">Kimga / Izoh</th>
                                    <th className="px-6 py-5">Vaqti</th>
                                    <th className="px-6 py-5 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-4">
                                            {t.type === 'IN' && (
                                                <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-blue-600/10">
                                                    <ArrowDownLeft className="w-4 h-4" /> Kirim
                                                </span>
                                            )}
                                            {t.type === 'OUT' && (
                                                <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-orange-600/10">
                                                    <ArrowUpRight className="w-4 h-4" /> Chiqim
                                                </span>
                                            )}
                                            {t.type === 'TRANSFER' && (
                                                <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-purple-600/10">
                                                    <Building2 className="w-4 h-4" /> Transfer
                                                </span>
                                            )}
                                            {t.type === 'CONSUMPTION' && (
                                                <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-amber-600/10">
                                                    <Tractor className="w-4 h-4" /> Sarf
                                                </span>
                                            )}
                                            {t.type === 'ADJUSTMENT' && (
                                                <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-gray-600/10">
                                                    <AlertCircle className="w-4 h-4" /> Tuzatish
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{t.product.name}</td>
                                        <td className="px-6 py-4 font-black text-gray-700">{t.amount} {formatUnit(t.product.unit)}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-mono text-gray-400">
                                                {t.waybill?.number || (t.batchId ? `#${t.batchId.slice(-6)}` : '—')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {t.brigadier ? (
                                                <span className="text-secondary-foreground font-bold">BRIGADA #{t.brigadier.user?.fullName}</span>
                                            ) : t.farmer ? (
                                                <span className="text-primary font-bold">{t.farmer.ni}</span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">{t.description || 'Kirim operatsiyasi'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                            {mounted ? new Date(t.date).toLocaleString('uz-UZ') : '...'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {(t.type === 'OUT' || t.type === 'TRANSFER') && (
                                                    <Link
                                                        href={`/warehouse/waybill/${t.id}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-400 hover:text-primary transition-colors inline-block"
                                                        title="Yuk xatini chop etish"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {t.farmer && (
                                                    <Link
                                                        href={`/warehouse/doverennost/${t.id}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors inline-block"
                                                        title="Ishonchnoma chop etish"
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {t.type === 'IN' && <span className="text-gray-300">—</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <WarehouseModal
                isOpen={isOpModalOpen}
                onClose={() => setIsOpModalOpen(false)}
                products={products}
                farmers={farmers}
                brigadiers={brigadiers}
                userId={userId}
            />

            <ProductManagementModal
                isOpen={isProdModalOpen}
                onClose={() => setIsProdModalOpen(false)}
                categories={categories}
            />
        </div>
    );
}
