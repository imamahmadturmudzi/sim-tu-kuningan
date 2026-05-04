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

export default function SuratKeluarPage() {
  const { data: daftarSurat, loading: loadingData } = useSurat("surat_keluar");
  const { tambahSurat, hapusSurat, loading: loadingAksi } = useSuratActions("surat_keluar");
  
  const { data: daftarKlasifikasi } = useSurat("klasifikasi");
  const [open, setOpen] = useState(false);
  
  // State form yang sudah dipecah untuk Generator Nomor Surat
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split("T")[0], // Set default hari ini
    nomorUrut: "", 
    kodeSurat: "PP.00.1", 
    bulan: "05", 
    tahun: "2026",
    tujuan: "", 
    perihal: "" 
  });

  // Poin 3: Kode Lembaga paten
  const KODE_LEMBAGA = "MTs.10.64";

  // Preview real-time nomor surat yang sedang dibuat
  const nomorSuratLengkap = form.nomorUrut 
    ? `${form.nomorUrut}/${KODE_LEMBAGA}/${form.kodeSurat}/${form.bulan}/${form.tahun}`
    : `.../${KODE_LEMBAGA}/${form.kodeSurat}/${form.bulan}/${form.tahun}`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gabungkan data sebelum dikirim ke Firebase
    const dataSimpan = {
      nomor: nomorSuratLengkap,
      pengirim: form.tujuan, 
      perihal: form.perihal,
      tanggal: form.tanggal // Menyimpan tanggal surat
    };

    const sukses = await tambahSurat(dataSimpan);
    if (sukses) {
      setForm({ 
        ...form, 
        nomorUrut: "", 
        tujuan: "", 
        perihal: "" 
      });
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Surat Keluar</h2>
          <p className="text-slate-500 text-sm">Dokumentasi dan penomoran surat keluar instansi.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Tambah Surat Keluar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Input & Penomoran Surat Keluar</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-6 pt-4">
              
              {/* Poin 2: Pengaturan Tanggal */}
              <div className="space-y-2">
                <Label>Tanggal Surat</Label>
                <Input 
                  type="date"
                  value={form.tanggal} 
                  onChange={(e) => setForm({...form, tanggal: e.target.value})} 
                  required 
                />
              </div>

              {/* Generator Nomor Surat Area */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <Label className="text-blue-700 font-bold">Builder Nomor Surat</Label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Poin 5: Nomor Urut Manual */}
                  <div className="space-y-1">
                    <Label className="text-xs">No. Urut</Label>
                    <Input 
                      placeholder="Contoh: 001"
                      value={form.nomorUrut} 
                      onChange={(e) => setForm({...form, nomorUrut: e.target.value})} 
                      required 
                    />
                  </div>

                  {/* Poin 4: Dropdown Kode Surat Dinamis */}
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Klasifikasi</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      value={form.kodeSurat}
                      onChange={(e) => setForm({...form, kodeSurat: e.target.value})}
                    >
                      <option value="" disabled>Pilih Klasifikasi...</option>
                      {daftarKlasifikasi.length === 0 ? (
                        <option value="PP.00.1">PP.00.1 - Default (Master Kosong)</option>
                      ) : (
                        daftarKlasifikasi.map((item) => (
                          <option key={item.id} value={item.kode}>
                            {item.kode} - {item.deskripsi}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Poin 6: Dropdown Bulan & Tahun */}
                  <div className="grid grid-cols-2 gap-2 col-span-2 md:col-span-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Bulan</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        value={form.bulan}
                        onChange={(e) => setForm({...form, bulan: e.target.value})}
                      >
                        {["01","02","03","04","05","06","07","08","09","10","11","12"].map(bln => (
                          <option key={bln} value={bln}>{bln}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tahun</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        value={form.tahun}
                        onChange={(e) => setForm({...form, tahun: e.target.value})}
                      >
                        {["2024","2025","2026","2027"].map(thn => (
                          <option key={thn} value={thn}>{thn}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hasil Preview Real-time */}
                <div className="pt-2">
                  <Label className="text-xs text-slate-500">Preview Nomor Surat:</Label>
                  <div className="mt-1 p-2 bg-blue-100 text-blue-800 font-mono text-center rounded-lg font-bold tracking-wider">
                    {nomorSuratLengkap}
                  </div>
                </div>
              </div>

              {/* Data Surat Sisanya */}
              <div className="space-y-2">
                <Label>Tujuan Surat</Label>
                <Input 
                  placeholder="Contoh: Kantor Kemenag Kuningan"
                  value={form.tujuan} 
                  onChange={(e) => setForm({...form, tujuan: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Perihal / Isi Ringkas</Label>
                <Input 
                  placeholder="Contoh: Undangan Rapat KKG"
                  value={form.perihal} 
                  onChange={(e) => setForm({...form, perihal: e.target.value})} 
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-600" disabled={loadingAksi}>
                {loadingAksi ? "Menyimpan..." : "Simpan Surat Keluar"}
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
              <TableHead className="w-[250px]">Nomor Surat</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Memuat data...</TableCell></TableRow>
            ) : daftarSurat.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Belum ada data surat keluar.</TableCell></TableRow>
            ) : (
              daftarSurat.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-slate-500 text-sm">
                    {s.tanggal || "-"} {/* Poin 2: Menampilkan tanggal di tabel */}
                  </TableCell>
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