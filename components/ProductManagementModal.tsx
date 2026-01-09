'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions/warehouse';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Tag } from 'lucide-react';

const UNITS = [
    { label: 'Tonna (t)', value: 'TON' },
    { label: 'Kilogramm (kg)', value: 'KG' },
    { label: 'Litr (l)', value: 'LITER' },
    { label: 'Gramm (g)', value: 'GRAMM' },
    { label: 'Qop', value: 'SACK' },
    { label: 'Metr (m)', value: 'METER' },
    { label: 'Dona (pcs)', value: 'PIECE' },
];

export default function ProductManagementModal({
    isOpen,
    onClose,
    categories
}: {
    isOpen: boolean,
    onClose: () => void,
    categories: string[]
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNewCategory, setShowNewCategory] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const category = showNewCategory
            ? formData.get("newCategory") as string
            : formData.get("category") as string;

        const result = await createProduct({
            name: formData.get("name") as string,
            category: category,
            unit: formData.get("unit") as string,
            minStockAlert: parseFloat(formData.get("minStockAlert") as string) || 0,
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            onClose();
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Yangi Mahsulot Qo'shish</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Mahsulot nomi *</label>
                                <input name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium" placeholder="Masalan: G'o'za urug'i" />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Kategoriya *</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategory(!showNewCategory)}
                                        className="text-[10px] font-black text-primary uppercase hover:underline"
                                    >
                                        {showNewCategory ? "Ro'yxatdan tanlash" : "+ Yangi kategoriya"}
                                    </button>
                                </div>
                                {showNewCategory ? (
                                    <input name="newCategory" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium" placeholder="Yangi kategoriya nomi" />
                                ) : (
                                    <select name="category" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium bg-white">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        {categories.length === 0 && <option value="Boshqa">Boshqa</option>}
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">O'lchov birligi *</label>
                                    <select name="unit" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium bg-white">
                                        {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Ogohlantirish miqdori</label>
                                    <input name="minStockAlert" type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium" placeholder="Masalan: 5" />
                                </div>
                            </div>


                            {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg text-center">{error}</p>}

                            <div className="pt-4">
                                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Saqlanmoqda...' : 'Mahsulotni saqlash'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
