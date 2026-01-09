'use client';

import { useState } from 'react';
import {
    Download, Warehouse, Map, Award,
    FileSpreadsheet, FileText, ChevronRight,
    Search, Filter, Calendar, Info, Clock,
    CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullWarehouseTransactions, getFullFieldActivities } from '@/app/actions/monitoring';
import { exportContractPerformance, exportWarehouseTransactions, exportBrigadeActivities } from '@/lib/excel';

interface ReportsClientProps {
    farmers: any[];
    config: any[];
}

export default function ReportsClient({ farmers, config }: ReportsClientProps) {
    const [loadingReport, setLoadingReport] = useState<string | null>(null);

    const handleDownload = async (id: string, action: () => Promise<void>) => {
        setLoadingReport(id);
        try {
            await action();
        } catch (err) {
            console.error("Report export failed:", err);
            alert("Hisobot yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
        } finally {
            setLoadingReport(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 p-4 md:p-12 space-y-12">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Hujjatlar Markazi</h1>
                    </div>
                    <p className="text-gray-500 font-medium text-lg max-w-2xl">
                        Klaster faoliyatining barcha yo'nalishlari bo'yicha analitik va tizimli hisobotlarni Excel formatida yuklab oling.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oxirgi Yangilanish</p>
                        <p className="text-sm font-black text-gray-900">{new Date().toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Detailed Report Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

                <ReportModule
                    id="warehouse"
                    title="Omborxona Analitikasi"
                    desc="Kirim, chiqim va o'tkazmalar bo'yicha to'liq tranzaksiyalar tarixi va qoldiqlar tahlili."
                    icon={Warehouse}
                    primaryColor="emerald"
                    isLoading={loadingReport === 'warehouse'}
                    features={["Barcha tranzaksiyalar", "Xodimlar hisoboti", "Vaqt bo'yicha filtrlangan"]}
                    onDownload={() => handleDownload('warehouse', async () => {
                        const trs = await getFullWarehouseTransactions();
                        exportWarehouseTransactions(trs);
                    })}
                />

                <ReportModule
                    id="agro"
                    title="Agrotexnik Tadbirlar"
                    desc="Konturlar kesimida bajarilgan barcha dala ishlari, texnika va brigadirlar faoliyati hisoboti."
                    icon={Map}
                    primaryColor="blue"
                    isLoading={loadingReport === 'agro'}
                    features={["Gektar hisobi", "Bosqichma-bosqich progress", "Kontur tahlili"]}
                    onDownload={() => handleDownload('agro', async () => {
                        const acts = await getFullFieldActivities();
                        exportBrigadeActivities(acts);
                    })}
                />

                <ReportModule
                    id="contracts"
                    title="Shartnomalar Monitoringi"
                    desc="Fermerlar bilan tuzilgan shartnomalar ijrosi, plan va fakt ko'rsatkichlari dinamikasi."
                    icon={Award}
                    primaryColor="purple"
                    isLoading={loadingReport === 'contracts'}
                    features={["Plan vs Fakt", "Bajarilish foizi", "Maxsus ko'rsatkichlar"]}
                    onDownload={() => handleDownload('contracts', async () => {
                        exportContractPerformance(farmers, config);
                    })}
                />
            </div>

            {/* Informational Footer Area */}
            <div className="bg-gray-900 rounded-[40px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative z-10 space-y-6 max-w-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <Info className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight uppercase">Professional Hisobotlar</h2>
                    </div>
                    <p className="text-gray-400 font-medium text-lg leading-relaxed">
                        Barcha Excel hisobotlarimiz xalqaro standartlar asosida shakllantirilgan. Ular chop etishga tayyor, ustunlar o'lchami sozlangan va ma'lumotlar vizual darajaga keltirilgan. Hisobotlar faqat tizimda mavjud bo'lgan eng so'nggi faktik ma'lumotlar asosida yaratiladi.
                    </p>
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-4 shrink-0">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center">
                        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="text-2xl font-black">100%</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Aniq Ma'lumot</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
                        <p className="text-2xl font-black">Excel</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">XLSX Format</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportModule({ id, title, desc, icon: Icon, primaryColor, onDownload, isLoading, features }: any) {
    const colorMap: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 icon-bg-emerald shadow-emerald-500/10",
        blue: "bg-blue-50 text-blue-600 border-blue-100 icon-bg-blue shadow-blue-500/10",
        purple: "bg-purple-50 text-purple-600 border-purple-100 icon-bg-purple shadow-purple-500/10"
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="bg-white rounded-[48px] border border-gray-100 p-10 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-8">
                <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border-2 ${colorMap[primaryColor]}`}>
                    <Icon className="w-10 h-10" />
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tayyor</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-black text-gray-900 leading-tight mb-4 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg mb-8">{desc}</p>

                <div className="flex flex-wrap gap-2 mb-10">
                    {features.map((f: string) => (
                        <span key={f} className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-lg uppercase tracking-wider">{f}</span>
                    ))}
                </div>
            </div>

            <button
                onClick={onDownload}
                disabled={isLoading}
                className={`w-full py-6 rounded-[28px] font-black tracking-tight flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl relative overflow-hidden ${isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-primary shadow-gray-900/10'
                    }`}
            >
                {isLoading ? (
                    <>
                        <RefreshCcw className="w-6 h-6 animate-spin" /> YUKLANMOQDA...
                    </>
                ) : (
                    <>
                        <Download className="w-6 h-6 group-hover:bounce" /> EXCEL HISOBOTNI YUKLASH
                    </>
                )}
            </button>

            <style jsx>{`
                .icon-bg-emerald { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
                .icon-bg-blue { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); }
                .icon-bg-purple { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .group:hover .bounce { animation: bounce 0.8s infinite; }
            `}</style>
        </motion.div>
    );
}

function RefreshCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    )
}
