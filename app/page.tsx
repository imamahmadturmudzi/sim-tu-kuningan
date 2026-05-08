"use client";

import { useSurat } from "@/app/hooks/useSurat";
import { StatsCard } from "@/components/StatsCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export default function Home() {
  const { data: suratMasuk, count: totalMasuk } = useSurat("surat_masuk");
  const { data: suratKeluar, count: totalKeluar } = useSurat("surat_keluar");
  const { data: suratSK, count: totalSK } = useSurat("surat_keputusan");

  // --- LOGIKA PENGOLAHAN DATA GRAFIK ---
  const processChartData = () => {
    const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    
    // Inisialisasi data kosong untuk 12 bulan
    const monthlyData = namaBulan.map(bulan => ({
      name: bulan,
      masuk: 0,
      keluar: 0,
      sk: 0
    }));

    // Hitung Surat Masuk per bulan
    suratMasuk.forEach((s: any) => {
      const tgl = new Date(s.tanggal);
      if (!isNaN(tgl.getTime())) monthlyData[tgl.getMonth()].masuk++;
    });

    // Hitung Surat Keluar per bulan
    suratKeluar.forEach((s: any) => {
      const tgl = new Date(s.tanggal);
      if (!isNaN(tgl.getTime())) monthlyData[tgl.getMonth()].keluar++;
    });

    // Hitung SK per bulan
    suratSK.forEach((s: any) => {
      const tgl = new Date(s.tanggal);
      if (!isNaN(tgl.getTime())) monthlyData[tgl.getMonth()].sk++;
    });

    // Kita hanya tampilkan bulan yang sudah lewat/berjalan (Jan sampai bulan sekarang)
    const currentMonth = new Date().getMonth();
    return monthlyData.slice(0, currentMonth + 1);
  };

  const chartData = processChartData();

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Ringkasan Data Administrasi
        </h2>
        <p className="text-slate-500 text-sm">
          Pantau statistik surat dan keputusan secara real-time.
        </p>
      </div>

      {/* Grid Statistik - Sekarang menjadi 4 kolom */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Surat Masuk" 
          value={totalMasuk} 
          color="border-l-teal-500" 
        />
        <StatsCard 
          title="Surat Keluar" 
          value={totalKeluar} 
          color="border-l-blue-500" 
        />
        <StatsCard 
          title="Total SK" 
          value={totalSK} 
          color="border-l-rose-500" 
        />
        <StatsCard 
          title="Klasifikasi" 
          value={0} // Bisa dihubungkan ke master kode nanti
          color="border-l-amber-500" 
        />
      </div>

      {/* GRAFIK BATANG ADMINISTRASI */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Statistik Bulanan</h3>
          <p className="text-sm text-slate-500">Perbandingan jumlah dokumen yang tercatat per periode.</p>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="masuk" name="Surat Masuk" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="keluar" name="Surat Keluar" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="sk" name="SK" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}