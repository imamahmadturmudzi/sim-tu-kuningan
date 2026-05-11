"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
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
import { Search, Printer, Edit, Filter } from "lucide-react";

// Daftar Pilihan Jenis Surat
const PILIHAN_JENIS = ["Biasa", "Undangan", "Permohonan", "Pemberitahuan", "Keputusan", "Tugas", "Lainnya"];

export default function SuratKeluarPage() {
  const { data: daftarSurat, loading: loadingData } = useSurat("surat_keluar");
  const { tambahSurat, hapusSurat, editSurat, loading: loadingAksi } = useSuratActions("surat_keluar");
  
  // State Form Tambah Data
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split("T")[0], 
    tujuan: "", 
    perihal: "",
    jenis: "Biasa" // Field Baru: Jenis Surat
  });

  // State Form Edit Data
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", tanggal: "", nomor: "", tujuan: "", perihal: "", jenis: "", file_url: "" });
  const [editFile, setEditFile] = useState<File | null>(null);

  // State Nomor Surat & Dropdown Pencarian
  const [noUrut, setNoUrut] = useState("");
  const [kodePilihan, setKodePilihan] = useState("");
  const [kodeSearch, setKodeSearch] = useState("");
  const [showKodeDropdown, setShowKodeDropdown] = useState(false);
  const [daftarKode, setDaftarKode] = useState<any[]>([]);
  
  // State File & Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");

  // Load Master Kode Surat
  useEffect(() => {
    const fetchKodeSurat = async () => {
      try {
        const snapshot = await getDocs(collection(db, "klasifikasi")); 
        const kodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDaftarKode(kodes);
      } catch (error) {
        console.error("Gagal memuat master kode:", error);
      }
    };
    fetchKodeSurat();
  }, []);
  
  // Logika Filter Berlapis (Search + Kategori Jenis)
  const filteredSurat = daftarSurat.filter((surat) => {
    const keyword = searchQuery.toLowerCase();
    const matchCari = surat.nomor?.toLowerCase().includes(keyword) || 
                      surat.tujuan?.toLowerCase().includes(keyword) || 
                      surat.perihal?.toLowerCase().includes(keyword);
    const matchJenis = filterJenis === "Semua" || surat.jenis === filterJenis;
    
    return matchCari && matchJenis;
  });

  // Proses Upload ke Drive (Dipakai oleh Tambah & Edit)
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

  // Submit Tambah Baru
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tgl = new Date(form.tanggal);
    const bulan = (tgl.getMonth() + 1).toString().padStart(2, '0');
    const tahun = tgl.getFullYear();
    const nomorLengkap = `${noUrut}/MTs.10/${kodePilihan}/${bulan}/${tahun}`;

    let fileUrl = ""; 
    if (file) {
      setUploading(true);
      const safeNomor = nomorLengkap.replace(/[^a-zA-Z0-9]/g, "_");
      fileUrl = await prosesUploadFile(file, `OUT_${safeNomor}_${file.name}`);
      setUploading(false);
      if (!fileUrl) return;
    }

    const sukses = await tambahSurat({ ...form, nomor: nomorLengkap, file_url: fileUrl } as any);
    if (sukses) {
      setForm({ tanggal: new Date().toISOString().split("T")[0], tujuan: "", perihal: "", jenis: "Biasa" });
      setNoUrut(""); setKodePilihan(""); setKodeSearch(""); setFile(null); setOpen(false); 
    }
  };

  // Buka Modal Edit
  const handleBukaEdit = (surat: any) => {
    setEditForm({ 
      id: surat.id, tanggal: surat.tanggal, nomor: surat.nomor, 
      tujuan: surat.tujuan, perihal: surat.perihal, jenis: surat.jenis || "Biasa", file_url: surat.file_url || "" 
    });
    setEditFile(null);
    setOpenEdit(true);
  };

  // Submit Edit Data
  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = editForm.file_url;
    
    if (editFile) {
      setUploading(true);
      const safeNomor = editForm.nomor.replace(/[^a-zA-Z0-9]/g, "_");
      const urlBaru = await prosesUploadFile(editFile, `OUT_EDIT_${safeNomor}_${editFile.name}`);
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

  const handlePrint = () => { window.print(); };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-0 print:m-0">
      
      {/* KOP SURAT (Hanya Cetak) */}
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
          <h4 className="text-base font-bold text-black uppercase underline">Buku Agenda Surat Keluar</h4>
        </div>
      </div>

      {/* HEADER & KONTROL (Pencarian, Filter, Tombol) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Keluar</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola arsip dan klasifikasi surat keluar.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto gap-2 text-slate-700 shadow-sm">
            <Printer className="w-4 h-4" /> Cetak
          </Button>

          {/* FILTER KATEGORI JENIS SURAT */}
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
              placeholder="Cari surat..."
              className="pl-10 border-slate-200 bg-white shadow-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* MODAL TAMBAH SURAT */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto shadow-sm">+ Catat Surat</Button>
            </DialogTrigger>
            <DialogContent className="print:hidden sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Input Data Surat Keluar</DialogTitle>
                <DialogDescription>Lengkapi formulir di bawah ini dengan benar.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori Jenis Surat</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      value={form.jenis} onChange={(e) => setForm({...form, jenis: e.target.value})} required
                    >
                      {PILIHAN_JENIS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>
                
                {/* DROPDOWN KLASIFIKASI PENCARIAN (Searchable) */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <Label>Format Nomor Surat</Label>
                  <div className="flex gap-2 relative">
                    <Input placeholder="No.Urut (Cth: 123)" value={noUrut} onChange={(e) => setNoUrut(e.target.value)} required className="w-1/3 bg-white" />
                    
                    {/* Custom Searchable Dropdown */}
                    <div className="w-2/3 relative">
                      <Input
                        placeholder="Ketik cari kode/klasifikasi..."
                        value={kodeSearch}
                        onChange={(e) => { setKodeSearch(e.target.value); setShowKodeDropdown(true); }}
                        onFocus={() => setShowKodeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowKodeDropdown(false), 250)}
                        required={!kodePilihan}
                        className="w-full bg-white"
                      />
                      {showKodeDropdown && (
                        <div className="absolute z-[100] mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-300 shadow-xl rounded-md">
                          {daftarKode
                            .filter(k => {
                              // Logika pencarian yang lebih kebal error (anti undefined)
                              const teksPencarian = `${k.kode || ""} ${k.keterangan || ""} ${k.nama || ""} ${k.deskripsi || ""} ${k.uraian || ""}`.toLowerCase();
                              return teksPencarian.includes(kodeSearch.toLowerCase());
                            })
                            .map(k => (
                              <div 
                                key={k.id} 
                                // RAHASIA: Gunakan onMouseDown agar dieksekusi SEBELUM onBlur!
                                onMouseDown={(e) => {
                                  e.preventDefault(); 
                                  setKodePilihan(k.kode);
                                  setKodeSearch(`${k.kode} - ${k.keterangan || k.nama || k.deskripsi || k.uraian || "Tanpa Keterangan"}`);
                                  setShowKodeDropdown(false);
                                }}
                                className="px-3 py-2 text-sm hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-0"
                              >
                                <span className="font-bold text-teal-700">{k.kode}</span> - {k.keterangan || k.nama || k.deskripsi || k.uraian}
                              </div>
                            ))}
                          
                          {/* Pesan jika pencarian tidak ditemukan */}
                          {daftarKode.filter(k => {
                              const teksPencarian = `${k.kode || ""} ${k.keterangan || ""} ${k.nama || ""} ${k.deskripsi || ""} ${k.uraian || ""}`.toLowerCase();
                              return teksPencarian.includes(kodeSearch.toLowerCase());
                            }).length === 0 && (
                            <div className="px-3 py-3 text-sm text-slate-500 italic text-center bg-slate-50">
                              Kode klasifikasi tidak ditemukan.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Preview: <span className="font-mono text-teal-700 font-bold">
                      {noUrut || "..."}/MTs.10/{kodePilihan || "..."}/{(new Date(form.tanggal).getMonth() + 1).toString().padStart(2, '0')}/{new Date(form.tanggal).getFullYear()}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Instansi Tujuan</Label>
                  <Input placeholder="Contoh: Kemenag Kabupaten" value={form.tujuan} onChange={(e) => setForm({...form, tujuan: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Perihal</Label>
                  <Input placeholder="Contoh: Permohonan Blangko Ijazah" value={form.perihal} onChange={(e) => setForm({...form, perihal: e.target.value})} required />
                </div>
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Label className="text-teal-700 font-semibold">Lampiran Scan (Opsional)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-white cursor-pointer" />
                </div>
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loadingAksi || uploading}>
                  {uploading ? "Menerbangkan ke Drive..." : "Simpan Surat Keluar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* MODAL EDIT SURAT (Terpisah agar aman) */}
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="print:hidden sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Surat Keluar</DialogTitle>
                <DialogDescription>Perbaiki data yang salah ketik. File lama tetap aman jika tidak diganti.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onEditSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input type="date" value={editForm.tanggal} onChange={(e) => setEditForm({...editForm, tanggal: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori Jenis Surat</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      value={editForm.jenis} onChange={(e) => setEditForm({...editForm, jenis: e.target.value})} required
                    >
                      {PILIHAN_JENIS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nomor Surat (Full)</Label>
                  {/* Di Edit, user bisa ubah full nomor manual jika mau */}
                  <Input value={editForm.nomor} onChange={(e) => setEditForm({...editForm, nomor: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Instansi Tujuan</Label>
                  <Input value={editForm.tujuan} onChange={(e) => setEditForm({...editForm, tujuan: e.target.value})} required />
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
                  {uploading ? "Mengupdate Data & Drive..." : "Simpan Perubahan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <Table className="print:w-full">
          <TableHeader className="bg-slate-50 print:bg-transparent">
            <TableRow className="print:border-b-2 print:border-black">
              <TableHead className="w-[100px] print:text-black">Tanggal</TableHead>
              <TableHead className="w-[180px] print:text-black">Nomor & Jenis</TableHead>
              <TableHead className="print:text-black">Tujuan</TableHead>
              <TableHead className="print:text-black">Perihal</TableHead>
              <TableHead className="text-center w-[90px] print:hidden">File</TableHead>
              <TableHead className="text-right w-[150px] print:hidden">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : filteredSurat.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">Belum ada data surat yang cocok.</TableCell></TableRow>
            ) : (
              filteredSurat.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors print:border-b print:border-slate-300">
                  <TableCell className="text-slate-500 text-sm print:text-black">{s.tanggal || "-"}</TableCell>
                  <TableCell className="print:text-black">
                    <p className="font-medium text-slate-700">{s.nomor}</p>
                    {/* Badge Kategori Jenis Surat */}
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded print:hidden">
                      {s.jenis || "Biasa"}
                    </span>
                  </TableCell>
                  <TableCell className="print:text-black">{s.tujuan}</TableCell>
                  <TableCell className="print:text-black">{s.perihal}</TableCell>
                  <TableCell className="text-center print:hidden">
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 text-xs font-semibold underline">Lihat</a>
                    ) : <span className="text-slate-300 text-xs">-</span>}
                  </TableCell>
                  <TableCell className="text-right print:hidden">
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
      </div>
    </div>
  );
}