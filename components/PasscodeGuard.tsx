"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

export function PasscodeGuard({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Cek apakah sudah pernah memasukkan passcode di sesi ini
    const verified = sessionStorage.getItem("simtu_verified");
    if (verified === "true") {
      setIsVerified(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleVerify = () => {
    if (inputCode === "601916") {
      sessionStorage.setItem("simtu_verified", "true");
      setIsVerified(true);
      setShowModal(false);
      toast.success("Akses Diterima", { description: "Selamat bekerja, rekan satker!" });
    } else {
      toast.error("Akses Ditolak", { description: "Passcode salah. Silakan hubungi Admin Satker." });
      setInputCode("");
    }
  };

  if (!isVerified) {
    return (
      <Dialog open={showModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px] border-t-4 border-t-amber-500">
          <DialogHeader className="items-center text-center">
            <div className="bg-amber-100 p-3 rounded-full mb-2">
              <LockKeyhole className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">Verifikasi Satker</DialogTitle>
            <DialogDescription>
              Silakan masukkan Passcode Satker untuk melanjutkan akses ke sistem administrasi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="password"
              placeholder="Masukkan 6 digit kode..."
              className="text-center text-2xl tracking-[1em] font-bold"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700 font-bold"
              onClick={handleVerify}
            >
              Buka Akses Sistem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}