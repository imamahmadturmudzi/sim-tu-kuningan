"use client";

import { useState, useEffect } from "react";
import { useSurat } from "@/app/hooks/useSurat";
import { useSuratActions } from "@/app/hooks/useSuratActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Search, Printer, Edit, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const PILIHAN_JENIS = ["Biasa", "Undangan", "Permohonan", "Pemberitahuan", "Tugas", "Lainnya"];
const ITEMS_PER_PAGE = 10;

export default function SuratMasukPage() {
  const { data: daftarSurat, loading: loadingData } = useSurat("surat_masuk");
  const { tambahSurat, hapusSurat, editSurat, loading: loadingAksi } = useSuratActions("surat_masuk");
  
  // State Form (Ditambah tanggal_surat)
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split("T")[0], // Ini Tanggal Terima
    tanggal_surat: new Date().toISOString().split("T")[0], // Ini Tanggal di Fisik Surat
    nomor: "", 
    pengirim: "", 
    perihal: "",
    jenis: "Biasa"
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({ 
    id: "", tanggal: "", tanggal_surat: "", nomor: "", pengirim: "", perihal: "", jenis: "", file_url: "" 
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // State Filter & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  // State Cetak Laporan Cerdas
  const [openCetak, setOpenCetak] = useState(false);
  const [modeCetak, setModeCetak] = useState("semua"); // semua, tahunan, bulanan
  const [tahunCetak, setTahunCetak] = useState(new Date().getFullYear().toString());
  const [bulanCetak, setBulanCetak] = useState(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterJenis]);

  // AUTO-SORT (Berdasarkan Tanggal Terima terbaru)
  const sortedAndFilteredSurat = daftarSurat
    .filter((surat) => {
      const keyword = searchQuery.toLowerCase();
      const matchCari = surat.nomor?.toLowerCase().includes(keyword) || 
                        surat.pengirim?.toLowerCase().includes(keyword) || 
                        surat.perihal?.toLowerCase().includes(keyword);
      const matchJenis = filterJenis === "Semua" || surat.jenis === filterJenis;
      return matchCari && matchJenis;
    })
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // PAGINATION
  const totalPages = Math.ceil(sortedAndFilteredSurat.length / ITEMS_PER_PAGE);
  const paginatedSurat = sortedAndFilteredSurat.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // LOGIKA FILTER CETAK
  const dataSiapCetak = sortedAndFilteredSurat.filter(s => {
    if (modeCetak === "semua") return true;
    const tgl = new Date(s.tanggal); // Filter berdasar waktu terima di TU
    if (isNaN(tgl.getTime())) return true;
    
    if (modeCetak === "tahunan") {
      return tgl.getFullYear().toString() === tahunCetak;
    }
    if (modeCetak === "bulanan") {
      const bCetak = new Date(bulanCetak); // format YYYY-MM
      return tgl.getFullYear() === bCetak.getFullYear() && tgl.getMonth() === bCetak.getMonth();
    }
    return true;
  });

  const judulCetak = modeCetak === "semua" ? "Seluruh Periode" : 
                     modeCetak === "tahunan" ? `Tahun ${tahunCetak}` : 
                     `Bulan ${new Date(bulanCetak).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

  const eksekusiCetak = () => {
    setOpenCetak(false);
    setTimeout(() => window.print(), 300); // Tunggu modal tertutup baru print
  };

  const prosesUploadFile = async (fileUpload: File, formatNama: string) => {
    const uploadData = new FormData();
    uploadData.append("file", fileUpload);
    uploadData.append("fileName", formatNama);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.success) return data.link;
      throw new Error(data.error);
    } catch (err) {
      alert("Gagal mengunggah ke Google Drive.");
      return "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = ""; 
    if (file) {
      setUploading(true);
      const safeNomor = form.nomor.replace(/[^a-zA-Z0-9]/g, "_");
      fileUrl = await prosesUploadFile(file, `IN_${safeNomor}_${file.name}`);
      setUploading(false);
      if (!fileUrl) return;
    }

    const sukses = await tambahSurat({ ...form, file_url: fileUrl } as any);
    if (sukses) {
      setForm({ 
        tanggal: new Date().toISOString().split("T")[0], 
        tanggal_surat: new Date().toISOString().split("T")[0], 
        nomor: "", pengirim: "", perihal: "", jenis: "Biasa" 
      });
      setFile(null); setOpen(false); 
    }
  };

  const handleBukaEdit = (surat: any) => {
    setEditForm({ 
      id: surat.id, 
      tanggal: surat.tanggal, 
      tanggal_surat: surat.tanggal_surat || surat.tanggal, // Backward compatibility
      nomor: surat.nomor, 
      pengirim: surat.pengirim, 
      perihal: surat.perihal, 
      jenis: surat.jenis || "Biasa", 
      file_url: surat.file_url || "" 
    });
    setEditFile(null);
    setOpenEdit(true);
  };

  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = editForm.file_url;
    if (editFile) {
      setUploading(true);
      const safeNomor = editForm.nomor.replace(/[^a-zA-Z0-9]/g, "_");
      const urlBaru = await prosesUploadFile(editFile, `IN_EDIT_${safeNomor}_${editFile.name}`);
      setUploading(false);
      if (!urlBaru) return;
      fileUrl = urlBaru;
    }

    const sukses = await editSurat(editForm.id, { ...editForm, file_url: fileUrl });
    if (sukses) {
      setOpenEdit(false);
      setEditFile(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-0 print:m-0">
      
      {/* KOP SURAT CETAK */}
      <div className="hidden print:flex flex-col mb-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <div className="w-[85px]">
            <img src="/logo-kemenag.png" alt="Logo Kemenag" className="w-full h-auto object-contain" />
          </div>
          <div className="flex-1 text-center font-sans text-black">
            <h1 className="text-[16px] font-bold uppercase leading-tight">Kementerian Agama Republik Indonesia</h1>
            <h2 className="text-[14px] font-bold uppercase leading-tight">Kantor Kementerian Agama Kabupaten Kuningan</h2>
            <h3 className="text-[16px] font-bold uppercase leading-tight mt-0.5">Madrasah Tsanawiyah Negeri 10</h3>
            <p className="text-[12px] leading-tight mt-1">Jl. Raya Desa Sangkanurip No. 04 Kec. Cigandamekar Kab. Kuningan</p>
            <p className="text-[12px] leading-tight mt-0.5">NPSN 20278735 - NSM 121132080010 - Kode Pos 45556</p>
            <p className="text-[12px] leading-tight mt-0.5 italic">Website : mtsn10kuningan.sch.id &nbsp;&nbsp; E-mail : mtsn10sangkanurip@gmail.com</p>
          </div>
          <div className="w-[85px]"></div>
        </div>
        <div className="border-b-[3px] border-black w-full mt-1"></div>
        <div className="border-b-[1px] border-black w-full mt-[2px]"></div>
        <div className="text-center mt-5">
          <h4 className="text-base font-bold text-black uppercase underline">Buku Agenda Surat Masuk</h4>
          <p className="text-sm font-semibold mt-1">Periode: {judulCetak}</p>
        </div>
      </div>

      {/* HEADER & KONTROL */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Masuk</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola arsip dan klasifikasi surat masuk.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          
          {/* TOMBOL CETAK BUKA MODAL */}
          <Button onClick={() => setOpenCetak(true)} variant="outline" className="w-full sm:w-auto gap-2 text-slate-700 shadow-sm">
            <Printer className="w-4 h-4" /> Cetak Laporan
          </Button>

          {/* FILTER KATEGORI */}
          <div className="relative w-full sm:w-auto flex items-center bg-white border border-slate-200 rounded-md shadow-sm pl-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="bg-transparent border-none text-sm focus:ring-0 py-2 px-2 text-slate-700 outline-none w-full cursor-pointer"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Semua Kategori</option>
              {PILIHAN_JENIS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari surat masuk..."
              className="pl-10 border-slate-200 bg-white shadow-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* MODAL TAMBAH */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-sm">+ Catat Surat</Button>
            </DialogTrigger>
            <DialogContent className="print:hidden sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Input Data Surat Masuk</DialogTitle>
                <DialogDescription>Catat surat yang masuk dari instansi lain.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-semibold">Tgl Diterima (TU)</Label>
                    <Input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} required className="bg-blue-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tgl Fisik Surat</Label>
                    <Input type="date" value={form.tanggal_surat} onChange={(e) => setForm({...form, tanggal_surat: e.target.value})} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nomor Surat</Label>
                    <Input placeholder="Contoh: B-123/..." value={form.nomor} onChange={(e) => setForm({...form, nomor: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori Jenis</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      value={form.jenis} onChange={(e) => setForm({...form, jenis: e.target.value})} required
                    >
                      {PILIHAN_JENIS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instansi Pengirim</Label>
                  <Input placeholder="Contoh: Kemenag Kabupaten" value={form.pengirim} onChange={(e) => setForm({...form, pengirim: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Perihal</Label>
                  <Input placeholder="Contoh: Undangan Rapat" value={form.perihal} onChange={(e) => setForm({...form, perihal: e.target.value})} required />
                </div>
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Label className="text-blue-700 font-semibold">Lampiran Scan (Opsional)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-white cursor-pointer" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loadingAksi || uploading}>
                  {uploading ? "Menerbangkan ke Drive..." : "Simpan Surat Masuk"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* MODAL EDIT */}
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="print:hidden sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Surat Masuk</DialogTitle>
                <DialogDescription>Perbaiki data yang salah ketik.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onEditSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-amber-700 font-semibold">Tgl Diterima</Label>
                    <Input type="date" value={editForm.tanggal} onChange={(e) => setEditForm({...editForm, tanggal: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Tgl Fisik Surat</Label>
                    <Input type="date" value={editForm.tanggal_surat} onChange={(e) => setEditForm({...editForm, tanggal_surat: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nomor Surat</Label>
                    <Input value={editForm.nomor} onChange={(e) => setEditForm({...editForm, nomor: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      value={editForm.jenis} onChange={(e) => setEditForm({...editForm, jenis: e.target.value})} required
                    >
                      {PILIHAN_JENIS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instansi Pengirim</Label>
                  <Input value={editForm.pengirim} onChange={(e) => setEditForm({...editForm, pengirim: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Perihal</Label>
                  <Input value={editForm.perihal} onChange={(e) => setEditForm({...editForm, perihal: e.target.value})} required />
                </div>
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Label className="text-amber-600 font-semibold text-sm">Ganti Lampiran? (Kosongkan jika tidak)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="bg-white cursor-pointer" />
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loadingAksi || uploading}>
                  {uploading ? "Mengupdate Data..." : "Simpan Perubahan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* MODAL PILIH CETAK */}
          <Dialog open={openCetak} onOpenChange={setOpenCetak}>
            <DialogContent className="print:hidden sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Filter Cetak Laporan</DialogTitle>
                <DialogDescription>Pilih periode laporan surat masuk yang ingin dicetak.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Cetak Berdasarkan</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none"
                    value={modeCetak} onChange={(e) => setModeCetak(e.target.value)}
                  >
                    <option value="semua">Keseluruhan (Semua Waktu)</option>
                    <option value="tahunan">Tahunan</option>
                    <option value="bulanan">Bulanan</option>
                  </select>
                </div>

                {modeCetak === "tahunan" && (
                  <div className="space-y-2">
                    <Label>Pilih Tahun</Label>
                    <Input type="number" value={tahunCetak} onChange={(e) => setTahunCetak(e.target.value)} />
                  </div>
                )}

                {modeCetak === "bulanan" && (
                  <div className="space-y-2">
                    <Label>Pilih Bulan</Label>
                    <Input type="month" value={bulanCetak} onChange={(e) => setBulanCetak(e.target.value)} />
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setOpenCetak(false)}>Batal</Button>
                <Button onClick={eksekusiCetak} className="bg-slate-800 hover:bg-slate-900 gap-2">
                  <Printer className="w-4 h-4" /> Lanjutkan Cetak
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABEL DATA INTERAKTIF */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[90px]">Tgl Terima</TableHead>
              <TableHead className="w-[90px]">Tgl Surat</TableHead>
              <TableHead className="w-[140px]">Nomor & Jenis</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead className="text-center w-[60px]">File</TableHead>
              <TableHead className="text-right w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : paginatedSurat.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">Belum ada data surat.</TableCell></TableRow>
            ) : (
              paginatedSurat.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-700 font-semibold text-xs sm:text-sm bg-blue-50/50">{s.tanggal || "-"}</TableCell>
                  <TableCell className="text-slate-500 text-xs sm:text-sm">{s.tanggal_surat || s.tanggal}</TableCell>
                  {/* WRAP TEXT: Nomor */}
                  <TableCell className="max-w-[140px] break-words whitespace-normal">
                    <p className="font-medium text-slate-700">{s.nomor}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded">
                      {s.jenis || "Biasa"}
                    </span>
                  </TableCell>
                  {/* WRAP TEXT: Pengirim */}
                  <TableCell className="max-w-[130px] break-words whitespace-normal text-sm">{s.pengirim}</TableCell>
                  {/* WRAP TEXT: Perihal */}
                  <TableCell className="max-w-[160px] break-words whitespace-normal text-sm">{s.perihal}</TableCell>
                  <TableCell className="text-center">
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline">Lihat</a>
                    ) : <span className="text-slate-300 text-xs">-</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleBukaEdit(s)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => hapusSurat(s.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* KONTROL PAGINATION */}
        {!loadingData && sortedAndFilteredSurat.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <Button variant="outline" size="sm" className="gap-1 text-slate-600" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Hal {currentPage} dari {totalPages} <span className="hidden sm:inline">({sortedAndFilteredSurat.length} data)</span>
            </span>
            <Button variant="outline" size="sm" className="gap-1 text-slate-600" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* TABEL KHUSUS CETAK */}
      <div className="hidden print:block w-full">
        <Table className="w-full text-[12px] leading-tight">
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="w-[80px] text-black">Tgl Terima</TableHead>
              <TableHead className="w-[80px] text-black">Tgl Surat</TableHead>
              <TableHead className="w-[140px] text-black">Nomor & Jenis</TableHead>
              <TableHead className="w-[150px] text-black">Pengirim</TableHead>
              <TableHead className="text-black">Perihal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataSiapCetak.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center italic pt-4">Tidak ada data untuk periode ini.</TableCell></TableRow>
            ) : (
              dataSiapCetak.map((s) => (
                <TableRow key={s.id} className="border-b border-slate-300">
                  <TableCell className="text-black align-top">{s.tanggal || "-"}</TableCell>
                  <TableCell className="text-black align-top">{s.tanggal_surat || s.tanggal}</TableCell>
                  <TableCell className="text-black align-top break-words whitespace-normal">{s.nomor}</TableCell>
                  <TableCell className="text-black align-top break-words whitespace-normal">{s.pengirim}</TableCell>
                  <TableCell className="text-black align-top break-words whitespace-normal">{s.perihal}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}