"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, Send, FolderOpen } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Daftar menu disesuaikan dengan icon
  const menuItems = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "S. Masuk", path: "/surat-masuk", icon: Inbox },
    { name: "S. Keluar", path: "/surat-keluar", icon: Send },
    { name: "Klasifikasi", path: "/klasifikasi", icon: FolderOpen },
  ];

  return (
    // md:hidden memastikan bar ini hanya muncul di HP. z-50 memastikannya selalu di paling atas.
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center pt-2 pb-4 px-2 md:hidden shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <Link 
            key={item.path}
            href={item.path} 
            className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${
              isActive ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {/* Animasi icon menebal saat aktif */}
            <Icon 
              className={`w-6 h-6 transition-all ${isActive ? "scale-110" : "scale-100"}`} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}