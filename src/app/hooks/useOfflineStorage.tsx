import { useEffect, useState, useCallback } from 'react';

export interface OfflineReceta {
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string;
  timestamp: number;
  isOffline: boolean;
}

const STORAGE_KEY = 'recetas-offline';
const PENDING_ACTIONS_KEY = 'pending-actions';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineRecetas, setOfflineRecetas] = useState<OfflineReceta[]>([]);
  const [pendingActions, setPendingActions] = useState<Array<{
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    id?: string;
    data?: unknown;
    timestamp: number;
  }>>([]);

  const loadOfflineData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineRecetas(data);
      }
    } catch (error) {
      console.error('Error cargando datos offline:', error);
    }
  }, []);

  const loadPendingActions = useCallback(() => {
    try {
      const stored = localStorage.getItem(PENDING_ACTIONS_KEY);
      if (stored) {
        const actions = JSON.parse(stored);
        setPendingActions(actions);
      }
    } catch (error) {
      console.error('Error cargando acciones pendientes:', error);
    }
  }, []);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar datos offline al iniciar
  useEffect(() => {
    loadOfflineData();
    loadPendingActions();
  }, [loadOfflineData, loadPendingActions]);

  const saveOfflineData = useCallback((recetas: OfflineReceta[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recetas));
      setOfflineRecetas(recetas);
    } catch (error) {
      console.error('Error guardando datos offline:', error);
    }
  }, []);

  const addPendingAction = useCallback((action: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    id?: string;
    data?: unknown;
  }) => {
    const newActions = [...pendingActions, { ...action, timestamp: Date.now() }];
    try {
      localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(newActions));
      setPendingActions(newActions);
    } catch (error) {
      console.error('Error guardando acción pendiente:', error);
    }
  }, [pendingActions]);

  const clearPendingActions = useCallback(() => {
    try {
      localStorage.removeItem(PENDING_ACTIONS_KEY);
      setPendingActions([]);
    } catch (error) {
      console.error('Error limpiando acciones pendientes:', error);
    }
  }, []);

  const saveRecetaOffline = useCallback((receta: Omit<OfflineReceta, 'id' | 'timestamp' | 'isOffline'>) => {
    const newReceta: OfflineReceta = {
      ...receta,
      id: `offline-${Date.now()}`,
      timestamp: Date.now(),
      isOffline: true
    };

    const updatedRecetas = [...offlineRecetas, newReceta];
    saveOfflineData(updatedRecetas);

    // Agregar acción pendiente para sincronizar
    addPendingAction({
      type: 'CREATE',
      data: newReceta
    });

    return newReceta;
  }, [offlineRecetas, saveOfflineData, addPendingAction]);

  const updateRecetaOffline = useCallback((id: string, updates: Partial<OfflineReceta>) => {
    const updatedRecetas = offlineRecetas.map(receta => 
      receta.id === id ? { ...receta, ...updates, timestamp: Date.now() } : receta
    );
    saveOfflineData(updatedRecetas);

    // Agregar acción pendiente
    addPendingAction({
      type: 'UPDATE',
      id,
      data: updates
    });
  }, [offlineRecetas, saveOfflineData, addPendingAction]);

  const deleteRecetaOffline = useCallback((id: string) => {
    const updatedRecetas = offlineRecetas.filter(receta => receta.id !== id);
    saveOfflineData(updatedRecetas);

    // Agregar acción pendiente
    addPendingAction({
      type: 'DELETE',
      id
    });
  }, [offlineRecetas, saveOfflineData, addPendingAction]);

  const syncWithFirebase = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    try {
      // Aquí implementarías la sincronización con Firebase
      // Por ahora solo limpiaremos las acciones pendientes
      console.log('Sincronizando con Firebase:', pendingActions);
      clearPendingActions();
    } catch (error) {
      console.error('Error sincronizando:', error);
    }
  }, [isOnline, pendingActions, clearPendingActions]);

  // Sincronizar automáticamente cuando vuelve la conexión
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncWithFirebase();
    }
  }, [isOnline, pendingActions.length, syncWithFirebase]);

  return {
    isOnline,
    offlineRecetas,
    pendingActions,
    saveRecetaOffline,
    updateRecetaOffline,
    deleteRecetaOffline,
    syncWithFirebase,
    loadOfflineData,
    clearPendingActions
  };
};
