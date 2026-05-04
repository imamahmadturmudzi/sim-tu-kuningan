"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/app/lib/firebase"; // Sesuaikan path firebase.ts kamu
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memantau apakah user sedang login atau logout
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginDenganGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Gagal login:", error);
      alert("Gagal login dengan Google. Silakan coba lagi.");
    }
  };

  // Tampilkan layar putih polos saat mengecek status (agar tidak berkedip)
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-teal-700 font-medium">Memuat SIM-TU...</div>;
  }

  // Jika belum login, tampilkan Halaman Login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-teal-700 tracking-tight">SIM-TU</h1>
            <p className="text-slate-500 font-medium">MTsN 10 Kuningan</p>
          </div>
          
          <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100">
            <p className="text-sm text-teal-800 leading-relaxed">
              Sistem Informasi Manajemen Tata Usaha. Silakan masuk menggunakan akun Google Anda untuk melanjutkan.
            </p>
          </div>

          <Button 
            onClick={loginDenganGoogle}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-md shadow-md flex items-center justify-center gap-3"
          >
            {/* Icon Google sederhana */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </Button>
        </div>
      </div>
    );
  }

  // Jika sudah login, tembus ke aplikasi utama!
  return <>{children}</>;
}