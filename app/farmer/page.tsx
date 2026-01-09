import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, Tractor, History, Info } from 'lucide-react';
import { redirect } from "next/navigation";

export default async function FarmerDashboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'FARMER') {
        redirect("/");
    }

    const farmer = await prisma.farmer.findFirst({
        where: { userId: session.userId },
        include: {
            contracts: true,
            transactions: {
                include: { product: true },
                orderBy: { date: 'desc' }
            }
        }
    });

    if (!farmer) return <div>Fermer profili topilmadi.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">{farmer.ni}</h1>
                    <p className="text-gray-500 font-medium">Shaxsiy kabinet • {farmer.address || 'Hudud aniqlanmagan'}</p>
                </div>
                <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-gray-600">Aloqada: Navbahor Tekstil</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-none ring-1 ring-black/5 bg-gradient-to-br from-white to-green-50">
                    <Tractor className="w-8 h-8 text-primary mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Yer maydoni</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{farmer.landArea} gektar</h3>
                </div>
                <div className="glass-card p-6 border-none ring-1 ring-black/5 bg-gradient-to-br from-white to-blue-50">
                    <Package className="w-8 h-8 text-blue-600 mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Olingan mahsulotlar</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{farmer.transactions.length} ta operatsiya</h3>
                </div>
                <div className="glass-card p-6 border-none ring-1 ring-black/5 bg-gradient-to-br from-white to-orange-50">
                    <Info className="w-8 h-8 text-orange-600 mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Shartnoma kodi</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{farmer.contractNumber || 'Mavjud emas'}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 border-none ring-1 ring-black/5">
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Mendan olingan / Menga berilganlar
                    </h3>
                    <div className="space-y-4">
                        {farmer.transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${t.type === 'OUT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {t.type === 'OUT' ? <Package className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800">{t.product.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-800">{t.amount} {t.product.unit}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.type === 'OUT' ? 'Berilgan' : 'Topshirilgan'}</p>
                                </div>
                            </div>
                        ))}
                        {farmer.transactions.length === 0 && <p className="text-gray-400 text-center py-10 font-medium">Hozircha ma'lumotlar yo'q.</p>}
                    </div>
                </div>

                <div className="glass-card p-8 border-none ring-1 ring-black/5 flex flex-col items-center justify-center text-center bg-primary/5">
                    <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                        <LeafIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800">Yaqinda: Navbahor Mobile App</h3>
                    <p className="text-sm text-gray-500 mt-4 max-w-sm">
                        Fermerlar uchun maxsus mobil ilova tez kunda ishga tushadi.
                        U yerda hosildorlikni AI orqali tahlil qilish va ob-havo ma'lumotlarini olish imkoniyati bo'ladi.
                    </p>
                </div>
            </div>
        </div>
    );
}

function LeafIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C10.32 14.36 12 12 12 12" />
        </svg>
    );
}
