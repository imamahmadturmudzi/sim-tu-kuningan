import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
// Pastikan path ke tipe Surat disesuaikan jika mas bro punya file types.ts
// import { Surat } from "@/app/types"; 

export function useSuratActions(collectionName: string) {
  const [loading, setLoading] = useState(false);

  const tambahSurat = async (data: any) => {
    setLoading(true);
    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      toast.success("Berhasil!", { description: "Data telah disimpan ke database." });
      return true;
    } catch (error) {
      toast.error("Gagal!", { description: "Terjadi kesalahan saat menyimpan data." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hapusSurat = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini? (File di Google Drive tidak akan terhapus otomatis)")) return false;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Terhapus", { description: "Data telah dihapus dari sistem." });
      return true;
    } catch (error) {
      toast.error("Gagal menghapus data.");
      return false;
    }
  };

  // --- FITUR BARU: EDIT SURAT ---
  const editSurat = async (id: string, dataBaru: any) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, dataBaru);
      toast.success("Diperbarui!", { description: "Perubahan data berhasil disimpan." });
      return true;
    } catch (error) {
      toast.error("Gagal Update!", { description: "Terjadi kesalahan saat mengedit data." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { tambahSurat, hapusSurat, editSurat, loading };
}