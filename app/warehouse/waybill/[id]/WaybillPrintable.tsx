'use client';

import { format } from "date-fns";
import { uz } from "date-fns/locale";

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

export default function WaybillPrintable({ transaction }: { transaction: any }) {
    const docId = transaction.waybill?.number || transaction.id.slice(-6).toUpperCase();
    const dateStr = format(new Date(transaction.date), "dd.MM.yyyy HH:mm", { locale: uz });

    // Support for both single transaction and batch transactions
    const items = transaction.batchItems || [transaction];

    return (
        <div className="print-page-wrap bg-white text-black font-serif text-[11pt] leading-tight flex flex-col">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0 !important;
                        size: A4;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            {/* Header Section */}
            <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl">
                        NT
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 leading-none">Navbahor Tekstil</h2>
                        <p className="text-[9pt] text-gray-500 font-sans font-bold uppercase tracking-widest mt-1">Paxta-to'qimachilik klasteri</p>
                        <p className="text-[8pt] font-sans text-gray-400">Navoiy viloyati, Navbahor tumani, "Qatag'on" MFY</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">YUK XATI</h1>
                    <p className="text-lg font-black text-gray-900 leading-none">№ {docId}</p>
                    <p className="text-[9pt] font-sans font-bold text-gray-400 mt-2">{dateStr}</p>
                </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[8pt] uppercase font-black text-gray-400 font-sans mb-2 tracking-widest">Yuboruvchi (Topshiruvchi):</p>
                    <div className="space-y-1">
                        <p className="font-black text-gray-800 text-[12pt]">"NAVBAHOR TEKSTIL" MCHJ</p>
                        <p className="text-[10pt] font-bold text-gray-600">Mas'ul: {transaction.createdBy?.fullName}</p>
                        <p className="text-[10pt] font-mono text-gray-500">STIR: 305612345</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-sans">
                    <p className="text-[8pt] uppercase font-black text-gray-400 mb-2 tracking-widest">Qabul qiluvchi (Vakil):</p>
                    <div className="space-y-1">
                        {transaction.brigadier ? (
                            <>
                                <p className="font-black text-gray-800 text-[12pt] uppercase">KLAS BRIGADASI №{transaction.brigadier.user?.fullName?.split(' ')[0] || ''}</p>
                                <p className="text-[10pt] font-bold text-gray-600">Brigader: {transaction.brigadier.user?.fullName}</p>
                                <p className="text-[10pt] font-mono text-gray-500">Tel: {transaction.brigadier.phone}</p>
                            </>
                        ) : (
                            <>
                                <p className="font-black text-gray-800 text-[12pt] uppercase leading-tight">{transaction.farmer?.ni || 'Fermer xo\'jaligi'}</p>
                                <p className="text-[10pt] font-bold text-gray-600">Rahbar: {transaction.farmer?.directorName || transaction.farmer?.user?.fullName}</p>
                                <p className="text-[10pt] font-mono text-gray-500">STIR: {transaction.farmer?.inn}</p>
                                <p className="text-[9pt] text-gray-400 italic leading-none">{transaction.farmer?.address}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Table - Set to 3 rows by default */}
            <div className="mb-6 overflow-hidden rounded-xl border border-gray-300">
                <table className="w-full border-collapse text-center">
                    <thead>
                        <tr className="bg-gray-800 text-white font-sans text-[9pt] uppercase font-black tracking-widest">
                            <th className="p-3 border-r border-gray-700 w-12">№</th>
                            <th className="p-3 border-r border-gray-700 text-left">Mahsulot nomi</th>
                            <th className="p-3 border-r border-gray-700 w-24 text-center">Birlik</th>
                            <th className="p-3 border-r border-gray-700 w-32 text-center">Miqdori</th>
                            <th className="p-3">Eslatma</th>
                        </tr>
                    </thead>
                    <tbody className="text-[10pt]">
                        {items.map((item: any, idx: number) => (
                            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="p-3 border-r border-gray-200 font-bold">{idx + 1}</td>
                                <td className="p-3 border-r border-gray-200 text-left font-black text-gray-800 uppercase text-[11pt]">{item.product.name}</td>
                                <td className="p-3 border-r border-gray-200 font-bold text-gray-500 uppercase">{formatUnit(item.product.unit)}</td>
                                <td className="p-3 border-r border-gray-200 font-black text-gray-900 text-lg">{item.amount}</td>
                                <td className="p-3 text-[9pt] italic text-gray-400 leading-tight">{item.description || (idx === 0 ? transaction.description : '')}</td>
                            </tr>
                        ))}
                        {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
                            <tr key={`empty-${i}`} className="h-10 border-t border-gray-100">
                                <td className="p-3 border-r border-gray-100">{items.length + i + 1}</td>
                                <td className="p-3 border-r border-gray-100"></td>
                                <td className="p-3 border-r border-gray-100"></td>
                                <td className="p-3 border-r border-gray-100"></td>
                                <td className="p-3"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals & Signatures */}
            <div className="break-inside-avoid">
                <div className="mb-10 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                    <p className="mb-1 flex items-center gap-2">
                        <span className="text-[10pt] font-black uppercase text-gray-400 tracking-widest">Jami berildi:</span>
                        <span className="font-black text-gray-800 uppercase">{items.length} turdagi mahsulot.</span>
                    </p>
                    <p className="text-[9pt] text-gray-400 italic">Hujjat bo'yicha jami miqdor: _________________________________________________________________________</p>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div className="text-center relative">
                        <div className="mb-4">
                            <div className="w-full border-b-2 border-gray-800 h-10 mb-1"></div>
                            <p className="text-[8pt] font-black uppercase text-gray-400 tracking-tighter">Topshirdi (Mas'ul shaxs)</p>
                        </div>
                        {/* Stamp Space */}
                        {/* <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-24 border-2 border-gray-300 rounded-full border-dashed flex items-center justify-center opacity-30 rotate-12">
                            <span className="text-[9pt] font-black text-gray-400 uppercase">M.O'.</span>
                        </div> */}
                    </div>
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="w-full border-b-2 border-gray-800 h-10 mb-1"></div>
                            <p className="text-[8pt] font-black uppercase text-gray-400 tracking-tighter">Qabul qildi (Vakil)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t-2 border-gray-200 text-[7pt] text-gray-400 font-sans flex justify-between items-center italic">
                <p>Ushbu hujjat "Paxta Klasteri ERP" tizimi orqali elektron shaklda yaratildi. Nusxa haqiqiyligi bazadagi ID raqami bilan tasdiqlanadi.</p>
                <div className="text-right">
                    <p className="font-mono bg-gray-100 px-2 py-0.5 rounded inline-block">ID: {transaction.batchId || transaction.id}</p>
                </div>
            </div>
        </div>
    );
}
