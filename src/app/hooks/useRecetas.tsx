import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface Receta {
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string;
}

export const useRecetas = () => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecetas = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "rayito-recetas"));
      const data: Receta[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Receta, "id">),
      }));
      setRecetas(data);
      setLoading(false);
    };

    fetchRecetas();
  }, []);

  return { recetas, loading, setRecetas };
};
