"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth"; // Kita butuh hook ini untuk baca data user
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  // Membaca data user yang sedang login
  const [user] = useAuthState(auth);

  const menuItems = [
    { name: "Beranda", path: "/" },
    { name: "Surat Masuk", path: "/surat-masuk" },
    { name: "Surat Keluar", path: "/surat-keluar" },
    { name: "Surat Keputusan", path: "/surat-keputusan" }, // Ini yang baru
    { name: "Klasifikasi", path: "/klasifikasi" },
  ];

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      await signOut(auth);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-xl font-bold text-teal-700 tracking-tight leading-none">SIM-TU</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-1">MTsN 10 Kuningan</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
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

      {/* Area Profil & Logout di bawah Sidebar */}
      {user && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 m-2 rounded-xl">
          <div className="flex flex-col space-y-3">
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.displayName || "Staf TU"}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}