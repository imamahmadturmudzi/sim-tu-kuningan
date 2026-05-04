"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useSurat(collectionName: string) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Referensi ke koleksi (misal: "surat_masuk" atau "surat_keluar")
    const collRef = collection(db, collectionName);
    
    // Query untuk mengurutkan berdasarkan waktu pembuatan terbaru
    const q = query(collRef, orderBy("createdAt", "desc"));

    // Berlangganan data secara real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setData(docs);
      setCount(snapshot.size);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}: `, error);
      setLoading(false);
    });

    // Membersihkan langganan saat komponen tidak lagi digunakan
    return () => unsubscribe();
  }, [collectionName]);

  return { data, count, loading };
}