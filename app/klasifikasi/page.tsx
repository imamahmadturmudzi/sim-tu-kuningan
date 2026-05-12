"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Search, Edit, ChevronLeft, ChevronRight, BookMarked } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function KlasifikasiPage() {
  const [daftarKode, setDaftarKode] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Tambah (Menggunakan key 'uraian')
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kode: "", uraian: "" });

  // State Form Edit (Menggunakan key 'uraian')
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", kode: "", uraian: "" });
  const [loadingAksi, setLoadingAksi] = useState(false);

  // State Pencarian & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Ambil Data Real-time dari Firebase
  useEffect(() => {
    const q = query(collection(db, "klasifikasi"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Urutkan berdasarkan abjad kode (A-Z)
      data.sort((a: any, b: any) => (a.kode || "").localeCompare(b.kode || ""));
      setDaftarKode(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching klasifikasi:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reset halaman ke 1 kalau lagi nyari
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // LOGIKA FILTER PENCARIAN
  const filteredKode = daftarKode.filter((item) => {
    const keyword = searchQuery.toLowerCase();
    // Membaca semua kemungkinan nama kolom agar aman
    return (item.kode?.toLowerCase() || "").includes(keyword) || 
           (item.uraian?.toLowerCase() || item.keterangan?.toLowerCase() || item.nama?.toLowerCase() || "").includes(keyword);
  });

  // LOGIKA PAGINATION
  const totalPages = Math.ceil(filteredKode.length / ITEMS_PER_PAGE);
  const paginatedKode = filteredKode.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // --- FUNGSI CRUD ---
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAksi(true);
    try {
      await addDoc(collection(db, "klasifikasi"), {
        kode: form.kode.toUpperCase(),
        uraian: form.uraian, // Disimpan sebagai uraian
      });
      toast.success("Berhasil ditambahkan!");
      setForm({ kode: "", uraian: "" });
      setOpen(false);
    } catch (error) {
      toast.error("Gagal menambahkan data.");
    } finally {
      setLoadingAksi(false);
    }
  };

  const handleBukaEdit = (item: any) => {
    setEditForm({ 
      id: item.id, 
      kode: item.kode || "", 
      uraian: item.uraian || item.keterangan || item.deskripsi || item.nama || "" // Mengambil mana saja yang ada isinya
    });
    setOpenEdit(true);
  };

  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAksi(true);
    try {
      await updateDoc(doc(db, "klasifikasi", editForm.id), {
        kode: editForm.kode.toUpperCase(),
        uraian: editForm.uraian, // Diupdate sebagai uraian
      });
      toast.success("Perubahan berhasil disimpan!");
      setOpenEdit(false);
    } catch (error) {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setLoadingAksi(false);
    }
  };

  const handleHapus = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kode klasifikasi ini?")) return;
    try {
      await deleteDoc(doc(db, "klasifikasi", id));
      toast.success("Kode berhasil dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus kode.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER & KONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-600" />
            Master Klasifikasi
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar kode indeks surat resmi madrasah.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari kode atau uraian..."
              className="pl-10 border-slate-200 bg-white shadow-sm w-full focus-visible:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* MODAL TAMBAH */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shadow-sm">+ Tambah Kode</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Kode Klasifikasi</DialogTitle>
                <DialogDescription>Masukkan kode unik dan teks uraiannya.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Kode Klasifikasi</Label>
                  <Input placeholder="Contoh: PP.00.1" value={form.kode} onChange={(e) => setForm({...form, kode: e.target.value})} required className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>Uraian</Label>
                  <Input placeholder="Contoh: Kurikulum dan Evaluasi" value={form.uraian} onChange={(e) => setForm({...form, uraian: e.target.value})} required />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loadingAksi}>
                  {loadingAksi ? "Menyimpan..." : "Simpan Kode"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* MODAL EDIT */}
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Kode Klasifikasi</DialogTitle>
                <DialogDescription>Perbaiki kesalahan ketik pada kode atau uraian.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onEditSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Kode Klasifikasi</Label>
                  <Input value={editForm.kode} onChange={(e) => setEditForm({...editForm, kode: e.target.value})} required className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>Uraian</Label>
                  <Input value={editForm.uraian} onChange={(e) => setEditForm({...editForm, uraian: e.target.value})} required />
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loadingAksi}>
                  {loadingAksi ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[150px]">Kode</TableHead>
              <TableHead>Uraian</TableHead>
              <TableHead className="text-right w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400">Memuat data klasifikasi...</TableCell></TableRow>
            ) : paginatedKode.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-500">Tidak ada kode yang ditemukan.</TableCell></TableRow>
            ) : (
              paginatedKode.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                      {item.kode}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700 break-words whitespace-normal">
                    {/* Ini kunci utamanya: Pastikan prioritas pembacaannya adalah 'uraian' */}
                    {item.uraian || item.keterangan || item.deskripsi || item.nama || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleBukaEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleHapus(item.id)}>
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
        {!loading && filteredKode.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <Button variant="outline" size="sm" className="gap-1 text-slate-600" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Hal {currentPage} dari {totalPages} <span className="hidden sm:inline">({filteredKode.length} kode)</span>
            </span>
            <Button variant="outline" size="sm" className="gap-1 text-slate-600" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}