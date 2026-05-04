"use client";

import { StatsCard } from "@/components/StatsCard";
import { useSurat } from "@/app/hooks/useSurat";

export default function Home() {
  // Mengambil data real-time menggunakan hook yang sudah kita buat
  const { count: totalMasuk } = useSurat("surat_masuk");
  const { count: totalKeluar } = useSurat("surat_keluar");

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Ringkasan Data Administrasi
        </h2>
        <p className="text-slate-500 text-sm">
          Pantau arus surat masuk dan keluar secara real-time.
        </p>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Surat Masuk" 
          value={totalMasuk} 
          color="border-l-teal-500" 
        />
        <StatsCard 
          title="Total Surat Keluar" 
          value={totalKeluar} 
          color="border-l-blue-500" 
        />
        <StatsCard 
          title="Klasifikasi" 
          value={0} 
          color="border-l-amber-500" 
        />
        <StatsCard 
          title="User Aktif" 
          value={1} 
          color="border-l-purple-500" 
        />
      </div>

      {/* Placeholder untuk Aktivitas Terbaru atau Grafik ke depannya */}
      <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
        <p className="text-slate-400 text-sm italic">
          Bagian ini bisa kita isi dengan grafik atau log aktivitas terbaru nanti.
        </p>
      </div>
    </div>
  );
}