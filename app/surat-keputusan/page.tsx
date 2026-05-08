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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Search } from "lucide-react";

export default function SuratKeputusanPage() {
  // Kita gunakan collection baru bernama "surat_keputusan" di Firebase
  const { data: daftarSK, loading: loadingData } = useSurat("surat_keputusan");
  const { tambahSurat, hapusSurat, loading: loadingAksi } = useSuratActions("surat_keputusan");
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split("T")[0], 
    nomor: "", 
    tentang: "", // SK menggunakan 'tentang' (bukan tujuan/pengirim)
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Menyaring data SK berdasarkan nomor atau tentang
  const filteredSK = daftarSK.filter((sk) => {
    const keyword = searchQuery.toLowerCase();
    return (
      sk.nomor?.toLowerCase().includes(keyword) ||
      sk.tentang?.toLowerCase().includes(keyword)
    );
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gunakan trik "as any" agar TypeScript tidak protes soal perbedaan kolom
    const sukses = await tambahSurat(form as any);
    if (sukses) {
      setForm({ 
        tanggal: new Date().toISOString().split("T")[0], 
        nomor: "", 
        tentang: "" 
      });
      setOpen(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Aksi */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Keputusan (SK)</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola arsip Surat Keputusan Kepala Madrasah.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Area Pencarian */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari nomor atau tentang SK..."
              className="pl-10 border-slate-200 bg-white shadow-sm focus-visible:ring-teal-500 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tombol Tambah */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto shadow-sm">
                + Catat SK Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Data Surat Keputusan</DialogTitle>
                <DialogDescription>
                  Masukkan detail SK yang baru diterbitkan ke dalam arsip.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tanggal Ditetapkan</Label>
                  <Input 
                    type="date"
                    value={form.tanggal} 
                    onChange={(e) => setForm({...form, tanggal: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor SK</Label>
                  <Input 
                    placeholder="Contoh: 01/MTs.10/SK/2026"
                    value={form.nomor} 
                    onChange={(e) => setForm({...form, nomor: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tentang / Perihal</Label>
                  <Input 
                    placeholder="Contoh: Pengangkatan Panitia Ujian"
                    value={form.tentang} 
                    onChange={(e) => setForm({...form, tentang: e.target.value})} 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loadingAksi}>
                  {loadingAksi ? "Menyimpan..." : "Simpan Arsip SK"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Area Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px]">Tanggal</TableHead>
              <TableHead className="w-[200px]">Nomor SK</TableHead>
              <TableHead>Tentang / Perihal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : filteredSK.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                  {daftarSK.length === 0 
                    ? "Belum ada data Surat Keputusan." 
                    : "Pencarian tidak menemukan hasil."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSK.map((sk) => (
                <TableRow key={sk.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-500 text-sm">{sk.tanggal || "-"}</TableCell>
                  <TableCell className="font-medium text-slate-700">{sk.nomor}</TableCell>
                  <TableCell>{sk.tentang}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => hapusSurat(sk.id)}>Hapus</Button>
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