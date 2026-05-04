import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { Surat } from "@/app/types";

export function useSuratActions(collectionName: string) {
  const [loading, setLoading] = useState(false);

  const tambahSurat = async (data: Omit<Surat, "id" | "createdAt">) => {
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
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Terhapus", { description: "Data telah dihapus dari server." });
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  return { tambahSurat, hapusSurat, loading };
}