import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav"; // Panggil Bottom Nav

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "SIM-TU MTsN 10 Kuningan",
  description: "Sistem Informasi Manajemen Tata Usaha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${jakarta.className} antialiased bg-slate-50 text-slate-900`}>
        {/* Tambahkan pb-20 untuk HP, agar tabel tidak tertutup bottom bar */}
        <div className="flex h-screen overflow-hidden pb-20 md:pb-0">
          
          {/* Sidebar Area (Hanya muncul di Desktop/Tablet) */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
          
        </div>

        {/* Bottom Nav Area (Hanya muncul di HP) */}
        <BottomNav />

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}