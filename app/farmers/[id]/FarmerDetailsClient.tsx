'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Tractor, Phone, MapPin, Hash, LandPlot,
    Edit, Trash2, Key, History, ArrowUpRight, ArrowDownLeft, X, FileText, UserSquare2, CreditCard, Download, PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteFarmer, updateFarmerCredentials, updateFarmer } from '@/app/actions/farmers';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function FarmerDetailsClient({ farmer }: { farmer: any }) {
    const [activeTab, setActiveTab] = useState<'info' | 'history'>('history');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    async function handleDelete() {
        if (confirm("Haqiqatan ham ushbu fermerni va barcha ma'lumotlarini o'chirmoqchimisiz?")) {
            const res = await deleteFarmer(farmer.id);
            if (res.success) router.push('/farmers');
            else alert(res.error);
        }
    }

    async function handleResetPassword() {
        if (confirm("Fermer parolini INN raqamiga qaytarmoqchimisiz?")) {
            const res = await updateFarmerCredentials(farmer.id, farmer.inn);
            if (res.success) alert("Parol INN ga muvaffaqiyatli qaytarildi");
        }
    }

    const exportToExcel = () => {
        const data = farmer.transactions.map((t: any) => ({
            "Sana": new Date(t.date).toLocaleDateString(),
            "Vaqt": new Date(t.date).toLocaleTimeString(),
            "Amaliyot": t.type === 'OUT' ? "Olish" : "Topshirish",
            "Mahsulot": t.product.name,
            "Miqdor": t.amount,
            "O'lchov": t.product.unit,
            "Izoh": t.description || ""
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tarix");
        XLSX.writeFile(wb, `${farmer.ni}_tarix.xlsx`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Info */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-inner">
                        <Tractor className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">{farmer.ni}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest"><MapPin className="w-3.5 h-3.5" /> {farmer.address}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest"><Hash className="w-3.5 h-3.5" /> INN: {farmer.inn}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={handleResetPassword} title="Parolni yangilash" className="p-3 bg-gray-50 text-gray-400 rounded-2xl border border-gray-100 hover:text-primary transition-all shadow-sm">
                        <Key className="w-5 h-5" />
                    </button>
                    <button onClick={handleDelete} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-100 transition-all font-bold text-sm shadow-sm">
                        <Trash2 className="w-4 h-4" /> O'chirish
                    </button>
                    <button onClick={() => setIsEditModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:bg-green-700 transition-all font-bold text-sm">
                        <Edit className="w-4 h-4" /> Tahrirlash
                    </button>
                </div>
            </div>

            <div className="flex gap-6 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'history' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Amaliyotlar Tarixi
                    {activeTab === 'history' && <motion.div layoutId="detail-tab" className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-t-full shadow-lg shadow-primary/40" />}
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'info' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Ma'lumotlar
                    {activeTab === 'info' && <motion.div layoutId="detail-tab" className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-t-full shadow-lg shadow-primary/40" />}
                </button>
            </div>

            {activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <DetailBlock title="Rahbariyat" icon={UserSquare2}>
                        <InfoRow label="Rahbar" value={farmer.directorName || '—'} />
                        <InfoRow label="Telefon" value={farmer.phone || '—'} />
                    </DetailBlock>
                    <DetailBlock title="Yuridik Ma'lumotlar" icon={FileText}>
                        <InfoRow label="INN" value={farmer.inn} />
                        <InfoRow label="PINFL" value={farmer.pinfl || '—'} />
                        <InfoRow label="Manzil" value={farmer.address || '—'} />
                    </DetailBlock>
                    <DetailBlock title="Pasport Ma'lumotlari" icon={CreditCard}>
                        <div className="flex gap-4">
                            <InfoRow label="Seriya" value={farmer.passportSerial || '__'} />
                            <InfoRow label="Raqam" value={farmer.passportNumber || '_______'} />
                        </div>
                    </DetailBlock>
                    <DetailBlock title="Qo'shimcha" icon={History}>
                        <InfoRow label="Tizimga qo'shilgan" value={mounted ? new Date(farmer.createdAt).toLocaleDateString() : '...'} />
                        <InfoRow label="Shartnoma raqami" value={farmer.contractNumber || '—'} />
                    </DetailBlock>
                </div>
            ) : (
                <div className="glass-card border-none ring-1 ring-black/5 overflow-hidden shadow-xl">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-end">
                        <button onClick={exportToExcel} className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
                            <Download className="w-4 h-4" /> Excelga yuklash
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="px-6 py-5">Harakat</th>
                                    <th className="px-6 py-5">Mahsulot</th>
                                    <th className="px-6 py-5">Miqdor</th>
                                    <th className="px-6 py-5">Izoh</th>
                                    <th className="px-6 py-5">Vaqti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {farmer.transactions.length > 0 ? farmer.transactions.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-primary/[0.01] transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold uppercase">
                                            {t.type === 'OUT' ? (
                                                <span className="text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded w-fit"><ArrowUpRight className="w-3.5 h-3.5" /> Olish</span>
                                            ) : (
                                                <span className="text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit"><ArrowDownLeft className="w-3.5 h-3.5" /> Topshirish</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-700">{t.product.name}</td>
                                        <td className="px-6 py-4 font-black text-gray-900">{t.amount} {t.product.unit}</td>
                                        <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">{t.description || '—'}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">{mounted ? new Date(t.date).toLocaleString('uz-UZ') : '...'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {t.type === 'OUT' && (
                                                    <Link
                                                        href={`/warehouse/waybill/${t.id}`}
                                                        target="_blank"
                                                        className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                                        title="Yuk xati"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {t.type === 'OUT' && (
                                                    <Link
                                                        href={`/warehouse/doverennost/${t.id}`}
                                                        target="_blank"
                                                        className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                                                        title="Ishonchnoma"
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400 italic">Hozircha hech qanday amaliyotlar mavjud emas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <FarmerEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} farmer={farmer} />
        </div>
    );
}

function DetailBlock({ title, icon: Icon, children }: any) {
    return (
        <div className="glass-card p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800">{title}</h3>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value }: any) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="font-bold text-gray-800 break-words">{value}</p>
        </div>
    );
}

function FarmerEditModal({ isOpen, onClose, farmer }: { isOpen: boolean, onClose: () => void, farmer: any }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: any) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await updateFarmer(farmer.id, {
            ni: formData.get("ni") as string,
            inn: formData.get("inn") as string,
            landArea: parseFloat(formData.get("landArea") as string) || 0,
            phone: formData.get("phone") as string,
            contractNumber: farmer.contractNumber, // Keep existing
            directorName: formData.get("directorName") as string,
            passportSerial: formData.get("passportSerial") as string,
            passportNumber: formData.get("passportNumber") as string,
            address: formData.get("address") as string,
            pinfl: formData.get("pinfl") as string,
        });
        if (res.success) onClose();
        else alert(res.error);
        setLoading(false);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 bg-gray-50 flex justify-between items-center border-b shrink-0">
                    <h3 className="text-xl font-black text-gray-800">Fermerni tahrirlash</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">F.I.SH (Nomi) *</label>
                        <input name="ni" defaultValue={farmer.ni} required className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">INN *</label>
                        <input name="inn" defaultValue={farmer.inn} required className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                    </div>
                    <div className="space-y-1 text-left col-span-full">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manzil (Hudud) *</label>
                        <input name="address" defaultValue={farmer.address} required className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefon</label>
                        <input name="phone" defaultValue={farmer.phone} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rahbar F.I.Sh</label>
                        <input name="directorName" defaultValue={farmer.directorName} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PINFL (JSHSHIR)</label>
                        <input name="pinfl" defaultValue={farmer.pinfl} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" maxLength={14} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pasport Seriya</label>
                            <input name="passportSerial" defaultValue={farmer.passportSerial} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase text-center" maxLength={2} />
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Raqam</label>
                            <input name="passportNumber" defaultValue={farmer.passportNumber} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" maxLength={7} />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yer maydoni (gektar)</label>
                        <input name="landArea" type="number" step="0.01" defaultValue={farmer.landArea} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                    </div>


                    <div className="col-span-full pt-4 sticky bottom-0 bg-white border-t border-gray-50 mt-4">
                        <button disabled={loading} className="w-full py-4 rounded-xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:bg-green-700 transition-all">
                            {loading ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
