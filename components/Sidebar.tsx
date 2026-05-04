"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  // Hook ini akan membaca URL saat ini (misal: "/" atau "/surat-masuk")
  const pathname = usePathname();

  // Daftar menu agar lebih rapi dan mudah ditambah nanti
  const menuItems = [
    { name: "Beranda", path: "/" },
    { name: "Surat Masuk", path: "/surat-masuk" },
    { name: "Surat Keluar", path: "/surat-keluar" },
    { name: "Klasifikasi", path: "/klasifikasi" }, // Kita siapkan jalurnya untuk Poin 7
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-teal-700 tracking-tight">SIM-TU</h1>
        <p className="text-xs text-slate-500 font-medium">MTsN 10 Kuningan</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          // Cek apakah menu ini adalah halaman yang sedang dibuka
          const isActive = pathname === item.path;

          return (
            <Link 
              key={item.path}
              href={item.path} 
              className={`block p-3 rounded-xl text-sm transition-all ${
                isActive 
                  ? "bg-teal-50 text-teal-700 font-semibold shadow-sm border border-teal-100" 
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}