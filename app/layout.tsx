import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";
import { MobileHeader } from "@/components/MobileHeader";
import { PasscodeGuard } from "@/components/PasscodeGuard";

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
          {/* PasscodeGuard diletakkan di sini untuk MEMBUNGKUS seluruh antarmuka.
            Jika belum masukin kode, Sidebar dan BottomNav tidak akan terlihat sama sekali.
          */}
          <PasscodeGuard>
            
            <div className="flex h-screen overflow-hidden pb-20 md:pb-0 print:h-auto print:overflow-visible print:pb-0">
              {/* Sidebar disembunyikan saat nge-print */}
              <div className="print:hidden">
                <Sidebar />
              </div>
              
              <main className="flex-1 overflow-y-auto flex flex-col relative print:overflow-visible">
                {/* Header Mobile disembunyikan saat nge-print */}
                <div className="print:hidden">
                  <MobileHeader />
                </div>
                
                {/* Area konten utama, padding dihilangkan saat nge-print biar hemat kertas */}
                <div className="p-4 md:p-8 print:p-0">
                  {children}
                </div>
              </main>
            </div>

            {/* Bottom Nav disembunyikan saat nge-print */}
            <div className="print:hidden">
              <BottomNav />
            </div>

          </PasscodeGuard>
        </AuthProvider>

        {/* Notifikasi Toaster biarkan di luar agar toast error/success tetap bisa muncul di atas segalanya */}
        <div className="print:hidden">
          <Toaster position="top-center" richColors />
        </div>
      </body>
    </html>
  );
}