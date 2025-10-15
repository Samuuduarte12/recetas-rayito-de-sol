import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useOfflineStorage, OfflineReceta } from "./useOfflineStorage";

export interface Receta {
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string;
  isOffline?: boolean;
  timestamp?: number;
}

export const useRecetas = () => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, offlineRecetas, loadOfflineData } = useOfflineStorage();

  useEffect(() => {
    if (isOnline) {
      fetchRecetasFromFirebase();
    } else {
      loadRecetasFromOffline();
    }
  }, [isOnline]);

  const fetchRecetasFromFirebase = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "rayito-recetas"));
      const firebaseRecetas: Receta[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Receta, "id">),
        isOffline: false
      }));

      // Combinar recetas de Firebase con las offline
      const combinedRecetas = [...firebaseRecetas, ...offlineRecetas];
      setRecetas(combinedRecetas);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching from Firebase:', error);
      // Si falla Firebase, usar datos offline
      loadRecetasFromOffline();
    }
  };

  const loadRecetasFromOffline = () => {
    setLoading(true);
    loadOfflineData();
    setRecetas(offlineRecetas);
    setLoading(false);
  };

  const addReceta = async (recetaData: Omit<Receta, "id">) => {
    if (isOnline) {
      try {
        // Aquí implementarías la lógica para guardar en Firebase
        // Por ahora simulamos el éxito
        const newReceta: Receta = {
          ...recetaData,
          id: `firebase-${Date.now()}`,
          isOffline: false
        };
        setRecetas(prev => [...prev, newReceta]);
        return newReceta;
      } catch (error) {
        console.error('Error saving to Firebase:', error);
        throw error;
      }
    } else {
      // Guardar offline
      const { saveRecetaOffline } = useOfflineStorage();
      const newReceta = saveRecetaOffline(recetaData);
      setRecetas(prev => [...prev, newReceta]);
      return newReceta;
    }
  };

  return { 
    recetas, 
    loading, 
    setRecetas, 
    isOnline,
    addReceta
  };
};
