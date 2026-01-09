import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Package, Activity, TrendingUp } from 'lucide-react';
import { getMonitoringStats } from './actions/monitoring';
import DashboardChart from './components/DashboardChart';

export default async function Home() {
  const session = await getSession();
  if (session?.role === 'FARMER') {
    redirect("/farmer");
  }
  if (session?.role === 'BRIGADIER') {
    redirect("/brigadier-dashboard");
  }
  if (session?.role === 'WAREHOUSEMAN') {
    redirect("/warehouse");
  }

  const stats = await getMonitoringStats();

  if (!stats) {
    return <div className="p-20 text-center text-gray-400 font-bold">Ma'lumotlar yuklanmoqda...</div>;
  }

  const cards = [
    { name: 'Jami Fermerlar', value: (stats.farmerCount || 0).toLocaleString(), icon: Users, change: 'Faol', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Ombor Qoldig\'i', value: (stats.totalStock || 0).toLocaleString(), icon: Package, change: 'tonna/litr', color: 'text-primary', bg: 'bg-primary/10' },
    { name: 'Mahsulot Turlari', value: (stats.productCount || 0).toLocaleString(), icon: Activity, change: 'Skladda', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'So\'nggi harakatlar', value: (stats.recentActivity?.length || 0).toLocaleString(), icon: TrendingUp, change: 'bugun', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Xush kelibsiz!</h2>
          <p className="text-gray-500 mt-1 font-medium">Navbahor Tekstil Cluster - Boshqaruv paneli</p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm text-sm text-gray-600 border border-white/50 font-medium" suppressHydrationWarning>
          {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat) => (
          <div key={stat.name} className="glass-card p-6 flex items-start justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-none ring-1 ring-black/5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.name}</p>
              <h3 className="text-3xl font-black text-gray-800 mt-2 tracking-tight">{stat.value}</h3>
              <div className="flex items-center mt-3 gap-2">
                <span className="text-primary text-[10px] font-black bg-primary/5 px-2 py-0.5 rounded-full ring-1 ring-primary/10 uppercase tracking-tighter">{stat.change}</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 min-h-[400px] border-none ring-1 ring-black/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Tizim Faolligi (Haftalik)</h3>
            <span className="text-xs font-bold text-gray-400">Jonli rejimda</span>
          </div>
          <DashboardChart data={stats.chartData} />
        </div>

        <div className="glass-card p-8 border-none ring-1 ring-black/5">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            So'nggi Amallar
          </h3>
          <div className="space-y-6">
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((act: any) => (
              <div key={act.id} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm ring-4 ring-white transition-all group-hover:shadow-md ${act.type === 'IN' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {act.type}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors truncate">
                    {act.farmer ? act.farmer.ni :
                      act.brigadier ? `${act.brigadier.user.fullName} (Kontur №${act.contour?.number || '?'})` :
                        'Ombor amaliyoti'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{act.product?.name || 'Noma\'lum'}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{act.amount} {act.product?.unit || ''}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-10">Hozircha harakatlar yo'q</p>
            )}
          </div>
          <button className="w-full mt-8 py-3.5 rounded-2xl bg-gray-50 text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-100">
            Barcha harakatlar
          </button>
        </div>
      </div>
    </div>
  );
}
