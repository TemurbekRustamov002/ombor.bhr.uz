'use client';

import { format, addDays } from "date-fns";
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

export default function DoverennostPrintable({ transaction }: { transaction: any }) {
    const docId = transaction.id.slice(-6).toUpperCase();
    const date = new Date(transaction.date);
    const dateStr = format(date, "dd.MM.yyyy", { locale: uz });
    const validityDate = format(addDays(date, 10), "dd.MM.yyyy", { locale: uz });

    const farmer = transaction.farmer;
    const items = transaction.batchItems || [transaction];

    return (
        <div className="print-page-wrap bg-white text-black font-serif text-[12pt] leading-snug flex flex-col">
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

            <div className="flex-grow border-[3px] border-double border-gray-800 p-8 flex flex-col">
                {/* Header Section */}
                <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl">NT</div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight uppercase">Navbahor Tekstil</h2>
                            <p className="text-[8pt] font-sans text-gray-500 uppercase tracking-widest">Paxta-to'qimachilik klasteri</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-black uppercase tracking-tight">ISHONCHNOMA</h1>
                        <p className="text-lg font-bold">№ {docId}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4 text-justify text-[10.5pt]">
                    <div className="flex justify-between items-center">
                        <p>Berilgan shahar: <strong>Navoiy v., Navbahor t.</strong></p>
                        <p>Sana: <strong>{dateStr} yil</strong></p>
                    </div>

                    <p>
                        Ushbu ishonchnoma shuni tasdiqlaydiki, <strong>"{farmer?.ni || 'NOMA\'LUM'}"</strong> (STIR: {farmer?.inn})
                        o'z rahbari <strong>{farmer?.directorName || farmer?.user?.fullName || '___________'}</strong> orqali quyidagi vakolatli shaxsga ishonch bildiradi:
                    </p>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-2 font-sans relative">
                        <p className="border-b border-gray-300 pb-1 flex justify-between">
                            <span className="text-[8pt] font-bold text-gray-400 uppercase">Vakil F.I.Sh:</span>
                            <span className="font-bold">_____________________________________________________</span>
                        </p>
                        <p className="border-b border-gray-300 pb-1 flex justify-between">
                            <span className="text-[8pt] font-bold text-gray-400 uppercase">Pasport:</span>
                            <span className="font-bold italic">Seriya: ______ Raqam: ___________</span>
                        </p>
                        <p className="border-b border-gray-300 pb-1 flex justify-between">
                            <span className="text-[8pt] font-bold text-gray-400 uppercase">Kim tomonidan:</span>
                            <span className="font-bold">_____________________________________________________</span>
                        </p>
                    </div>

                    <p>
                        Vakilga <strong>"NAVBAHOR TEKSTIL" MCHJ</strong> omboridan quyidagi tovarlarni qabul qilish vakolati beriladi:
                    </p>

                    {/* Table - Set to 3 rows by default */}
                    <table className="w-full border-collapse border-2 border-black text-center">
                        <thead>
                            <tr className="bg-gray-100 font-bold uppercase text-[9pt]">
                                <th className="border border-black p-2 w-12">№</th>
                                <th className="border border-black p-2 text-left">Mahsulot nomi</th>
                                <th className="border border-black p-2 w-24">Birlik</th>
                                <th className="border border-black p-2 w-32">Miqdori</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, idx: number) => (
                                <tr key={item.id} className="h-10 text-[10pt]">
                                    <td className="border border-black p-2">{idx + 1}</td>
                                    <td className="border border-black p-2 text-left font-bold uppercase">{item.product.name}</td>
                                    <td className="border border-black p-2 uppercase">{formatUnit(item.product.unit)}</td>
                                    <td className="border border-black p-2 font-black text-[12pt]">{item.amount}</td>
                                </tr>
                            ))}
                            {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
                                <tr key={`empty-${i}`} className="h-10 border border-black">
                                    <td className="border border-black p-2">{items.length + i + 1}</td>
                                    <td className="border border-black p-2"></td>
                                    <td className="border border-black p-2"></td>
                                    <td className="border border-black p-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p className="italic text-[10pt]">
                        Ishonchnoma <strong>{validityDate}</strong> yilgacha haqiqiy.
                    </p>

                    {/* Signature Block - Compressed to fit one page */}
                    <div className="grid grid-cols-2 gap-10 mt-6 pt-4 border-t border-gray-100 break-inside-avoid">
                        <div className="space-y-8">
                            <div>
                                <p className="font-bold mb-2 uppercase text-[8pt]">Fermer rahbari:</p>
                                <div className="border-b border-black w-full mb-1"></div>
                                <p className="text-[7pt] italic">(imzo va F.I.SH.)</p>
                            </div>
                            <div className="w-24 h-24 border-2 border-gray-200 rounded-full mx-auto flex items-center justify-center border-dashed opacity-30 -rotate-6">
                                <span className="text-[8pt] font-black uppercase">M.O'.</span>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <p className="font-bold mb-2 uppercase text-[8pt]">Bosh hisobchi:</p>
                                <div className="border-b border-black w-full mb-1"></div>
                                <p className="text-[7pt] italic">(imzo va F.I.SH.)</p>
                            </div>
                            <div>
                                <p className="font-bold mb-2 uppercase text-[8pt]">Vakil imzosi:</p>
                                <div className="border-b border-black w-full mb-1"></div>
                                <p className="text-[7pt] italic">(shaxsiy imzo namunasi)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex justify-between items-end border-t border-gray-100 text-[7pt] text-gray-400 font-sans italic">
                    <p>Haqiqiylik ID: {transaction.id}</p>
                </div>
            </div>

            {/* Print Button UI */}
            <div className="mt-8 pt-4 border-t print:hidden flex justify-center sticky bottom-0 bg-white/80 backdrop-blur-md p-4 rounded-t-3xl shadow-lg border border-gray-100">
                <button
                    onClick={() => window.print()}
                    className="bg-black text-white font-black py-4 px-12 rounded-2xl shadow-xl hover:bg-gray-900 transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
                >
                    Hujjatni chop etish
                </button>
            </div>
        </div>
    );
}
