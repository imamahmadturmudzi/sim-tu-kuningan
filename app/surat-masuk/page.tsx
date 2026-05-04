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

export default function SuratMasukPage() {
  const { data: daftarSurat, loading: loadingData } = useSurat("surat_masuk");
  const { tambahSurat, hapusSurat, loading: loadingAksi } = useSuratActions("surat_masuk");
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split("T")[0], // Default hari ini
    nomor: "", 
    pengirim: "", 
    perihal: "" 
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sukses = await tambahSurat(form);
    if (sukses) {
      setForm({ 
        tanggal: new Date().toISOString().split("T")[0], 
        nomor: "", 
        pengirim: "", 
        perihal: "" 
      });
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Masuk</h2>
          <p className="text-slate-500 text-sm">Pencatatan arsip surat masuk instansi.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              + Catat Surat Masuk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Data Surat Masuk</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 pt-4">
              
              {/* Tambahan Input Tanggal */}
              <div className="space-y-2">
                <Label>Tanggal Diterima</Label>
                <Input 
                  type="date"
                  value={form.tanggal} 
                  onChange={(e) => setForm({...form, tanggal: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Nomor Surat (Sesuai Fisik)</Label>
                <Input 
                  placeholder="Ketik nomor surat yang tertera"
                  value={form.nomor} 
                  onChange={(e) => setForm({...form, nomor: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Instansi Pengirim</Label>
                <Input 
                  placeholder="Contoh: Dinas Pendidikan Provinsi"
                  value={form.pengirim} 
                  onChange={(e) => setForm({...form, pengirim: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Perihal</Label>
                <Input 
                  placeholder="Contoh: Undangan Sosialisasi"
                  value={form.perihal} 
                  onChange={(e) => setForm({...form, perihal: e.target.value})} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loadingAksi}>
                {loadingAksi ? "Menyimpan..." : "Simpan Surat Masuk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px]">Tanggal</TableHead>
              <TableHead className="w-[200px]">Nomor Surat</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : daftarSurat.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada data surat masuk.</TableCell></TableRow>
            ) : (
              daftarSurat.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-500 text-sm">{s.tanggal || "-"}</TableCell>
                  <TableCell className="font-medium text-slate-700">{s.nomor}</TableCell>
                  <TableCell>{s.pengirim}</TableCell>
                  <TableCell>{s.perihal}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => hapusSurat(s.id)}>Hapus</Button>
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