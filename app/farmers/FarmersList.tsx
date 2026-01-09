'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Key, Edit, Tractor, Eye, Trash2 } from 'lucide-react';
import FarmerModal from '@/components/FarmerModal';

export default function FarmersList({ initialFarmers }: { initialFarmers: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('Barcha hududlar');

    const filteredFarmers = initialFarmers.filter(f => {
        const matchesSearch =
            f.ni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.inn.includes(searchTerm);
        const matchesRegion = regionFilter === 'Barcha hududlar' || f.address === regionFilter;
        return matchesSearch && matchesRegion;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Tractor className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Fermerlar Bazasi</h1>
                        <p className="text-gray-500 font-medium">Klaster bilan shartnoma qilgan barcha fermer xo'jaliklari</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-primary/30 font-bold transform active:scale-95"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Yangi Fermer Qo'shish
                </button>
            </div>

            <div className="glass-card border-none ring-1 ring-black/5 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4 bg-white/40">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Fermer nomi yoki INN bo'yicha qidirish..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white/60 transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="flex-1 md:flex-none px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 focus:outline-none bg-white/60 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <option>Barcha hududlar</option>
                            <option>Navbahor-1</option>
                            <option>Navbahor-2</option>
                            <option>Navbahor-3</option>
                            <option>Navbahor-4</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-6 py-5 border-b border-gray-100">Fermer Xo'jaligi / INN</th>
                                <th className="px-6 py-5 border-b border-gray-100">Hudud</th>
                                <th className="px-6 py-5 border-b border-gray-100">Rahbar</th>
                                <th className="px-6 py-5 border-b border-gray-100">Bog'lanish</th>
                                <th className="px-6 py-5 border-b border-gray-100 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredFarmers.length > 0 ? filteredFarmers.map((f) => (
                                <tr key={f.id} className="hover:bg-primary/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <Link href={`/farmers/${f.id}`} className="block hover:translate-x-1 transition-transform">
                                            <p className="font-bold text-gray-800 text-base group-hover:text-primary transition-colors">{f.ni}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">INN: {f.inn}</p>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold text-xs uppercase tracking-tight">
                                            {f.address || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-gray-800 font-bold text-sm">{f.directorName || f.ni || '—'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-gray-600 font-medium">{f.phone || '—'}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/farmers/${f.id}`} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10 hover:border-primary" title="Ko'rish">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 hover:border-blue-600" title="Parolni yangilash">
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:border-red-600" title="O'chirish">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">Fermerlar topilmadi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FarmerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

function UserPlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
        </svg>
    );
}
