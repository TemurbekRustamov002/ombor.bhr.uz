'use client';

import { useState } from 'react';
import { recordTransaction } from '@/app/actions/warehouse';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowDownLeft, ArrowUpRight, FileText, CheckCircle2, Tractor, Building2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WarehouseModal({
    isOpen,
    onClose,
    products,
    farmers,
    brigadiers,
    userId
}: {
    isOpen: boolean,
    onClose: () => void,
    products: any[],
    farmers: any[],
    brigadiers: any[],
    userId: string
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<'IN' | 'OUT'>('OUT');
    const [recipientType, setRecipientType] = useState<'CLUSTER' | 'FARMER'>('CLUSTER');
    const [isNewFarmer, setIsNewFarmer] = useState(false);
    const [successId, setSuccessId] = useState<string | null>(null);

    // Multi-product state
    const [items, setItems] = useState([{ productId: '', amount: '' }]);

    const addItem = () => setItems([...items, { productId: '', amount: '' }]);
    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };
    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        const payload: any = {
            type,
            items: items.map(item => ({
                productId: item.productId,
                amount: parseFloat(item.amount)
            })),
            description: formData.get("description") as string,
            userId
        };

        if (type === 'OUT') {
            if (recipientType === 'CLUSTER') {
                payload.brigadierId = formData.get("brigadierId") as string;
            } else {
                if (isNewFarmer) {
                    payload.newFarmerData = {
                        ni: formData.get("ni") as string,
                        inn: formData.get("inn") as string,
                        directorName: formData.get("directorName") as string,
                        passportSerial: formData.get("passportSerial") as string,
                        passportNumber: formData.get("passportNumber") as string,
                        pinfl: formData.get("pinfl") as string,
                        address: formData.get("address") as string,
                        phone: formData.get("phone") as string,
                    };
                } else {
                    payload.farmerId = formData.get("farmerId") as string;
                }
            }
        }

        const result = await recordTransaction(payload);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            if (type === 'OUT' && result.transactionId) {
                setSuccessId(result.transactionId);
                setLoading(false);
            } else {
                handleClose();
            }
        }
    }

    function handleClose() {
        setSuccessId(null);
        setError(null);
        setLoading(false);
        setIsNewFarmer(false);
        setRecipientType('CLUSTER');
        setItems([{ productId: '', amount: '' }]);
        onClose();
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden sm:max-w-4xl max-h-[95vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <h3 className="text-xl font-bold text-gray-800">Ombor Operatsiyasi</h3>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto grow">
                            {successId ? (
                                <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-800">Muvaffaqiyatli!</h4>
                                        <p className="text-gray-500 font-medium">Mahsulotlar muvaffaqiyatli {type === 'IN' ? 'qabul qilindi' : 'chiqarildi'}.</p>
                                    </div>
                                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                        {type === 'OUT' && (
                                            <>
                                                <Link
                                                    href={`/warehouse/waybill/${successId}`}
                                                    target="_blank"
                                                    className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                    Yuk xatini chop etish
                                                </Link>

                                                {recipientType === 'FARMER' && (
                                                    <Link
                                                        href={`/warehouse/doverennost/${successId}`}
                                                        target="_blank"
                                                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                        Ishonchnoma chop etish
                                                    </Link>
                                                )}
                                            </>
                                        )}

                                        <button
                                            onClick={handleClose}
                                            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Yopish
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6 max-w-md mx-auto">
                                        <button
                                            onClick={() => setType('IN')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'IN' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <ArrowDownLeft className="w-4 h-4" /> Kirim
                                        </button>
                                        <button
                                            onClick={() => setType('OUT')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'OUT' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> Chiqim
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Recipients Selection for OUT */}
                                        {type === 'OUT' && (
                                            <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex gap-2 mb-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setRecipientType('CLUSTER'); setIsNewFarmer(false); }}
                                                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${recipientType === 'CLUSTER' ? 'bg-white border-primary text-primary shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <Building2 className="w-4 h-4" /> Klaster (Brigada)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecipientType('FARMER')}
                                                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${recipientType === 'FARMER' ? 'bg-white border-primary text-primary shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <Tractor className="w-4 h-4" /> Fermer
                                                    </button>
                                                </div>

                                                {recipientType === 'CLUSTER' ? (
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brigada *</label>
                                                        <select name="brigadierId" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium">
                                                            <option value="">Brigadani tanlang</option>
                                                            {brigadiers.map(b => (
                                                                <option key={b.id} value={b.id}>Brigada #{b.user?.fullName} ({b.user?.username})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fermer *</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsNewFarmer(!isNewFarmer)}
                                                                className="text-xs font-bold text-primary hover:underline"
                                                            >
                                                                {isNewFarmer ? "Mavjud ro'yxatdan tanlash" : "Yangi qo'shish"}
                                                            </button>
                                                        </div>

                                                        {isNewFarmer ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4">
                                                                <input name="ni" required placeholder="Fermer xo'jaligi nomi (Yuridik nom)" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" />
                                                                <input name="inn" required placeholder="STIR (INN)" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" />
                                                                <input name="directorName" required placeholder="Rahbar F.I.Sh" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" />
                                                                <input name="phone" required placeholder="Telefon raqami" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" />

                                                                <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-2">
                                                                    <input name="passportSerial" required placeholder="AA" className="col-span-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm text-center uppercase" maxLength={2} />
                                                                    <input name="passportNumber" required placeholder="1234567" className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" maxLength={7} />
                                                                </div>
                                                                <input name="pinfl" required placeholder="JSHSHIR (PINFL)" className="col-span-1 md:col-span-2 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" maxLength={14} />
                                                                <input name="address" required placeholder="To'liq manzil" className="col-span-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm" />
                                                            </div>
                                                        ) : (
                                                            <select name="farmerId" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium">
                                                                <option value="">Fermerni tanlang</option>
                                                                {farmers.map(f => (
                                                                    <option key={f.id} value={f.id}>{f.ni} ({f.inn})</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Dynamic Product Rows */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Mahsulotlar</h4>
                                                <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all">
                                                    <Plus className="w-3.5 h-3.5" /> Qo'shish
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {items.map((item, index) => (
                                                    <div key={index} className="flex gap-3 items-end group animate-in slide-in-from-right-2 duration-200">
                                                        <div className="grow grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mahsulot *</label>
                                                                <select
                                                                    value={item.productId}
                                                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                                    required
                                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm"
                                                                >
                                                                    <option value="">Tanlang...</option>
                                                                    {products.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name} ({p.currentStock} {p.unit})</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Miqdor *</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.amount}
                                                                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                                    required
                                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium text-sm"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            disabled={items.length === 1}
                                                            className="p-3 mb-0.5 text-gray-300 hover:text-red-500 disabled:opacity-0 transition-all rounded-xl hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Umumiy Izoh</label>
                                            <textarea name="description" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm font-medium resize-none" placeholder="Qo'shimcha ma'lumot..."></textarea>
                                        </div>

                                        {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-4 rounded-xl text-center border border-red-100">{error}</p>}

                                        <div className="pt-2 sticky bottom-0 bg-white">
                                            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-14">
                                                <Save className="w-5 h-5" />
                                                {loading ? 'Bajarilmoqda...' : 'Operatsiyani yakunlash'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
