'use client';

import { useState } from 'react';
import { createFarmer } from '@/app/actions/farmers';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, UserPlus } from 'lucide-react';

export default function FarmerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await createFarmer(formData);

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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Yangi Fermer Qo'shish</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Fermer xo'jaligi nomi *</label>
                                    <input name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300 font-bold" placeholder="Masalan: Baraka Agro" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">INN (Login) *</label>
                                    <input name="inn" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300 font-bold" placeholder="9 xonalik son" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Telefon raqami</label>
                                    <input name="phone" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300 font-bold" placeholder="+998 90 123 45 67" />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Manzil (Hudud) *</label>
                                    <input name="address" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold bg-gray-50/30" placeholder="Viloyat, tuman, mahalla..." />
                                </div>

                                <div className="col-span-full border-t border-gray-100 my-2"></div>
                                <h4 className="col-span-full font-bold text-gray-800">Rahbariyat va Pasport ma'lumotlari (Ishonchnoma uchun)</h4>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Rahbar F.I.Sh</label>
                                    <input name="directorName" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold" placeholder="Ism Familiya" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">PINFL (JSHSHIR)</label>
                                    <input name="pinfl" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold" placeholder="14 xonalik son" maxLength={14} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Pasport Seriya</label>
                                    <input name="passportSerial" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold uppercase" placeholder="AA" maxLength={2} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Pasport Raqami</label>
                                    <input name="passportNumber" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold" placeholder="1234567" maxLength={7} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Yer maydoni (gektar)</label>
                                    <input name="landArea" type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold" placeholder="0.00" />
                                </div>
                                {/* Hidden fields for compatibility if needed */}
                                <input type="hidden" name="contractNumber" value="" />
                            </div>

                            {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 sticky bottom-0 bg-white">
                                <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                                    Bekor qilish
                                </button>
                                <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 transform active:scale-95">
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
