"use client";

import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

export function MobileHeader() {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
      await signOut(auth);
    }
  };

  return (
    <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        <div>
          <h1 className="text-lg font-extrabold text-teal-700 tracking-tight leading-none">SIM-TU</h1>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">MTsN 10 Kuningan</p>
        </div>
      </div>
      
      {user && (
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}