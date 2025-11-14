import { useEffect, useState, useCallback } from "react";
import { getRecipes } from "../../lib/api";
import { useOfflineStorage } from "./useOfflineStorage";

export interface Receta {
  _id?: string;
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string | Array<{ url: string; public_id: string; tipo: string }>;
  isOffline?: boolean;
  timestamp?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useRecetas = () => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, offlineRecetas, loadOfflineData } = useOfflineStorage();

  const fetchRecetasFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const backendRecetas = await getRecipes();
      
      // Transformar las recetas del backend al formato esperado
      const transformedRecetas: Receta[] = backendRecetas.map((receta: any) => {
        // El backend devuelve _id, pero necesitamos id
        const id = receta._id || receta.id;
        
        // Manejar imágenes: puede ser string o array de objetos
        let imagenUrl = '';
        if (Array.isArray(receta.imagen) && receta.imagen.length > 0) {
          // Si es array, tomar la primera URL
          imagenUrl = receta.imagen[0].url || receta.imagen[0];
        } else if (typeof receta.imagen === 'string') {
          imagenUrl = receta.imagen;
        }
        
        return {
          id,
          nombre: receta.nombre,
          descripcion: receta.descripcion,
          ingredientes: receta.ingredientes || [],
          imagen: imagenUrl,
          isOffline: false,
          createdAt: receta.createdAt,
          updatedAt: receta.updatedAt
        };
      });

      // Combinar recetas del backend con las offline
      const combinedRecetas = [...transformedRecetas, ...offlineRecetas];
      setRecetas(combinedRecetas);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching from backend:', error);
      // Si falla el backend, usar datos offline
      setLoading(true);
      loadOfflineData();
      setRecetas(offlineRecetas);
      setLoading(false);
    }
  }, [offlineRecetas, loadOfflineData]);

  useEffect(() => {
    if (isOnline) {
      fetchRecetasFromBackend();
    } else {
      setLoading(true);
      loadOfflineData();
      setRecetas(offlineRecetas);
      setLoading(false);
    }
  }, [isOnline, fetchRecetasFromBackend, offlineRecetas, loadOfflineData]);

  const addReceta = useCallback(async (recetaData: Omit<Receta, "id">) => {
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
      // Guardar offline - necesitamos acceder al hook de forma diferente
      const newReceta: Receta = {
        ...recetaData,
        id: `offline-${Date.now()}`,
        isOffline: true,
        timestamp: Date.now()
      };
      setRecetas(prev => [...prev, newReceta]);
      return newReceta;
    }
  }, [isOnline]);

  return { 
    recetas, 
    loading, 
    setRecetas, 
    isOnline,
    addReceta
  };
};
