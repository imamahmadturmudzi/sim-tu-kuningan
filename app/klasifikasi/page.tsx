"use client";

import { useState } from "react";
import { useSurat } from "@/app/hooks/useSurat";
import { useSuratActions } from "@/app/hooks/useSuratActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function KlasifikasiPage() {
  // Kita "pinjam" hook surat untuk koleksi klasifikasi
  const { data: daftarKlasifikasi, loading: loadingData } = useSurat("klasifikasi");
  const { tambahSurat: tambahKlasifikasi, hapusSurat: hapusKlasifikasi, loading: loadingAksi } = useSuratActions("klasifikasi");
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    kode: "", 
    deskripsi: "" 
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Tambahkan "as any" di sini agar TypeScript mengizinkan bentuk data yang berbeda
    const sukses = await tambahKlasifikasi(form as any); 
    if (sukses) {
      setForm({ kode: "", deskripsi: "" });
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Klasifikasi Surat</h2>
          <p className="text-slate-500 text-sm">Kamus master kode surat MTsN 10 Kuningan.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              + Tambah Kode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Master Klasifikasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Kode Surat</Label>
                <Input 
                  placeholder="Contoh: PP.00.1"
                  value={form.kode} 
                  onChange={(e) => setForm({...form, kode: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi / Keterangan</Label>
                <Input 
                  placeholder="Contoh: Kurikulum / Pembelajaran"
                  value={form.deskripsi} 
                  onChange={(e) => setForm({...form, deskripsi: e.target.value})} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loadingAksi}>
                {loadingAksi ? "Menyimpan..." : "Simpan Kode"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-37.5">Kode Surat</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : daftarKlasifikasi.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400">Belum ada master klasifikasi. Silakan tambah data.</TableCell></TableRow>
            ) : (
              daftarKlasifikasi.map((k) => (
                <TableRow key={k.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-bold text-amber-700">{k.kode}</TableCell>
                  <TableCell className="text-slate-700">{k.deskripsi}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => hapusKlasifikasi(k.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}