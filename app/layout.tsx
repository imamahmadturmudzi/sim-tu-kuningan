import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";
import { MobileHeader } from "@/components/MobileHeader"; // <-- Ini yang baru

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
        <AuthProvider>
          <div className="flex h-screen overflow-hidden pb-20 md:pb-0">
            <Sidebar />
            {/* Sedikit penyesuaian di area main ini agar header menempel di atas */}
            <main className="flex-1 overflow-y-auto flex flex-col relative">
              <MobileHeader /> {/* <-- Pasang di sini */}
              <div className="p-4 md:p-8">
                {children}
              </div>
            </main>
          </div>
          <BottomNav />
        </AuthProvider>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}