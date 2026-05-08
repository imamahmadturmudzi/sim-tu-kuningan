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

export default function SuratMasukPage() {
  const { data: daftarSurat, loading: loadingData } = useSurat("surat_masuk");
  const { tambahSurat, hapusSurat, loading: loadingAksi } = useSuratActions("surat_masuk");
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split("T")[0],
    nomor: "", 
    pengirim: "", 
    perihal: "" 
  });
  
  // State baru untuk menampung file scan dan status loading upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredSurat = daftarSurat.filter((surat) => {
    const keyword = searchQuery.toLowerCase();
    return (
      surat.nomor?.toLowerCase().includes(keyword) ||
      surat.pengirim?.toLowerCase().includes(keyword) ||
      surat.perihal?.toLowerCase().includes(keyword)
    );
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = ""; // Variabel untuk menyimpan link dari Google Drive

    // JIKA ADA FILE YANG DIPILIH, SURUH ROBOT UNGGAH DULU KE DRIVE
    if (file) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      // Rapikan nama file: hilangkan karakter aneh dari nomor surat, lalu gabung dengan nama asli file
      const safeNomor = form.nomor.replace(/[^a-zA-Z0-9]/g, "_");
      uploadData.append("fileName", `${safeNomor}_${file.name}`);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const data = await res.json();
        
        if (data.success) {
          fileUrl = data.link; // Yess! Berhasil dapat link dari Drive
        } else {
          alert("Gagal mengunggah file ke Drive: " + data.error);
          setUploading(false);
          return; // Hentikan proses jika gagal upload
        }
      } catch (err) {
        alert("Terjadi kesalahan jaringan saat mengunggah file.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // SETELAH UPLOAD SELESAI (ATAU JIKA TIDAK ADA FILE), SIMPAN DATA KE FIREBASE
    const dataFinal = { ...form, file_url: fileUrl }; // Gabungkan data form dengan link Drive
    const sukses = await tambahSurat(dataFinal as any);
    
    if (sukses) {
      // Reset semua isian jika sukses
      setForm({ 
        tanggal: new Date().toISOString().split("T")[0], 
        nomor: "", 
        pengirim: "", 
        perihal: "" 
      });
      setFile(null); // Kosongkan file pilihan
      setOpen(false); // Tutup dialog
    }
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Masuk</h2>
          <p className="text-slate-500 text-sm mt-1">Pencatatan arsip surat masuk instansi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari surat..."
              className="pl-10 border-slate-200 bg-white shadow-sm focus-visible:ring-teal-500 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto shadow-sm">
                + Catat Surat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Data Surat Masuk</DialogTitle>
                <DialogDescription>
                  Lengkapi formulir di bawah ini beserta lampiran scan dokumen jika ada.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-4">
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
                  <Label>Nomor Surat</Label>
                  <Input 
                    placeholder="Contoh: 123/DISDIK/2026"
                    value={form.nomor} 
                    onChange={(e) => setForm({...form, nomor: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instansi Pengirim</Label>
                  <Input 
                    placeholder="Contoh: Dinas Pendidikan"
                    value={form.pengirim} 
                    onChange={(e) => setForm({...form, pengirim: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perihal</Label>
                  <Input 
                    placeholder="Contoh: Undangan Rapat"
                    value={form.perihal} 
                    onChange={(e) => setForm({...form, perihal: e.target.value})} 
                    required 
                  />
                </div>
                
                {/* INPUT FILE SCAN BARU */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Label className="text-teal-700 font-semibold">Lampiran Scan Surat (Opsional)</Label>
                  <Input 
                    type="file" 
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="bg-white cursor-pointer" 
                  />
                  <p className="text-[11px] text-slate-500">Format: PDF, JPG, atau PNG (Maks 5MB disarankan).</p>
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loadingAksi || uploading}>
                  {uploading ? "Menerbangkan ke Drive..." : loadingAksi ? "Menyimpan ke Database..." : "Simpan Arsip Masuk"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Tanggal</TableHead>
              <TableHead className="w-[180px]">Nomor Surat</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead className="text-center w-[100px]">Lampiran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : filteredSurat.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  {daftarSurat.length === 0 
                    ? "Belum ada data surat masuk." 
                    : "Pencarian tidak menemukan hasil."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSurat.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-500 text-sm">{s.tanggal || "-"}</TableCell>
                  <TableCell className="font-medium text-slate-700">{s.nomor}</TableCell>
                  <TableCell>{s.pengirim}</TableCell>
                  <TableCell>{s.perihal}</TableCell>
                  
                  {/* KOLOM LAMPIRAN */}
                  <TableCell className="text-center">
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline text-xs font-semibold bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                        Lihat File
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </TableCell>

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