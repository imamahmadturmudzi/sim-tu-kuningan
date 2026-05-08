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
import { Search, Printer } from "lucide-react"; // <-- Tambah icon Printer

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
    let fileUrl = ""; 

    if (file) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const safeNomor = form.nomor.replace(/[^a-zA-Z0-9]/g, "_");
      uploadData.append("fileName", `${safeNomor}_${file.name}`);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        const data = await res.json();
        if (data.success) { fileUrl = data.link; } 
        else { alert("Gagal mengunggah: " + data.error); setUploading(false); return; }
      } catch (err) {
        alert("Terjadi kesalahan jaringan."); setUploading(false); return;
      }
      setUploading(false);
    }

    const dataFinal = { ...form, file_url: fileUrl }; 
    const sukses = await tambahSurat(dataFinal as any);
    
    if (sukses) {
      setForm({ tanggal: new Date().toISOString().split("T")[0], nomor: "", pengirim: "", perihal: "" });
      setFile(null); 
      setOpen(false); 
    }
  };

  // Fungsi untuk memicu layar Print
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-0 print:m-0">
      
      {/* KOP SURAT (Hanya Muncul Saat Dicetak) */}
      <div className="hidden print:flex flex-col mb-6">
        <div className="flex flex-row items-center justify-between pb-2">
          {/* Logo Kiri */}
          <div className="w-[85px]">
            <img src="/logo-kemenag.png" alt="Logo Kemenag" className="w-full h-auto object-contain" />
          </div>
          
          {/* Teks Tengah - Menggunakan font-sans agar persis seperti gambar */}
          <div className="flex-1 text-center font-sans text-black">
            <h1 className="text-[16px] font-bold uppercase leading-tight">Kementerian Agama Republik Indonesia</h1>
            <h2 className="text-[14px] font-bold uppercase leading-tight">Kantor Kementerian Agama Kabupaten Kuningan</h2>
            <h3 className="text-[16px] font-bold uppercase leading-tight mt-0.5">Madrasah Tsanawiyah Negeri 10</h3>
            <p className="text-[12px] leading-tight mt-1">Jl. Raya Desa Sangkanurip No. 04 Kec. Cigandamekar Kab. Kuningan</p>
            <p className="text-[12px] leading-tight mt-0.5">NPSN 20278735 - NSM 121132080010 - Kode Pos 45556</p>
            <p className="text-[12px] leading-tight mt-0.5 italic">Website : mtsn10kuningan.sch.id &nbsp;&nbsp; E-mail : mtsn10sangkanurip@gmail.com</p>
          </div>
          
          {/* Elemen Kosong Kanan (Lebar disamakan dengan logo agar teks pas di tengah) */}
          <div className="w-[85px]"></div>
        </div>
        
        {/* Garis Bawah Ganda (Tebal & Tipis) */}
        <div className="border-b-[3px] border-black w-full mt-1"></div>
        <div className="border-b-[1px] border-black w-full mt-[2px]"></div>

        {/* Judul Laporan (Jangan lupa ganti sesuai halaman: Masuk / Keluar / SK) */}
        <div className="text-center mt-5">
          <h4 className="text-base font-bold text-black uppercase underline">Buku Agenda Surat Masuk</h4>
        </div>
      </div>

      {/* Header & Aksi (Disembunyikan saat dicetak dengan print:hidden) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Masuk</h2>
          <p className="text-slate-500 text-sm mt-1">Pencatatan arsip surat masuk instansi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Tombol Cetak Laporan */}
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto gap-2 text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm">
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </Button>

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
            {/* ... (Isi Dialog Form tetap sama seperti sebelumnya) ... */}
            <DialogContent className="print:hidden">
              <DialogHeader>
                <DialogTitle>Input Data Surat Masuk</DialogTitle>
                <DialogDescription>Lengkapi formulir di bawah ini beserta lampiran scan dokumen jika ada.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tanggal Diterima</Label>
                  <Input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Surat</Label>
                  <Input placeholder="Contoh: 123/DISDIK/2026" value={form.nomor} onChange={(e) => setForm({...form, nomor: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Instansi Pengirim</Label>
                  <Input placeholder="Contoh: Dinas Pendidikan" value={form.pengirim} onChange={(e) => setForm({...form, pengirim: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Perihal</Label>
                  <Input placeholder="Contoh: Undangan Rapat" value={form.perihal} onChange={(e) => setForm({...form, perihal: e.target.value})} required />
                </div>
                
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Label className="text-teal-700 font-semibold">Lampiran Scan Surat (Opsional)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-white cursor-pointer" />
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

      {/* Area Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
        <Table className="print:w-full">
          <TableHeader className="bg-slate-50 print:bg-transparent">
            <TableRow className="print:border-b-2 print:border-black">
              <TableHead className="w-[100px] print:text-black">Tanggal</TableHead>
              <TableHead className="w-[180px] print:text-black">Nomor Surat</TableHead>
              <TableHead className="print:text-black">Pengirim</TableHead>
              <TableHead className="print:text-black">Perihal</TableHead>
              {/* Kolom Lampiran & Aksi disembunyikan saat di-print karena tidak bisa diklik di kertas */}
              <TableHead className="text-center w-[100px] print:hidden">Lampiran</TableHead>
              <TableHead className="text-right print:hidden">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : filteredSurat.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  {daftarSurat.length === 0 ? "Belum ada data surat masuk." : "Pencarian tidak menemukan hasil."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSurat.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors print:border-b print:border-slate-300">
                  <TableCell className="text-slate-500 text-sm print:text-black">{s.tanggal || "-"}</TableCell>
                  <TableCell className="font-medium text-slate-700 print:text-black">{s.nomor}</TableCell>
                  <TableCell className="print:text-black">{s.pengirim}</TableCell>
                  <TableCell className="print:text-black">{s.perihal}</TableCell>
                  
                  {/* Sembunyikan isi kolom lampiran & aksi saat dicetak */}
                  <TableCell className="text-center print:hidden">
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline text-xs font-semibold bg-teal-50 px-2 py-1 rounded-md border border-teal-100">Lihat File</a>
                    ) : <span className="text-slate-300 text-xs">-</span>}
                  </TableCell>
                  <TableCell className="text-right print:hidden">
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