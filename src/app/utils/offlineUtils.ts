// Utilidades para manejo offline

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateOfflineId = (): string => {
  return `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const validateOfflineData = (data: any): boolean => {
  try {
    return (
      data &&
      typeof data === 'object' &&
      data.nombre &&
      typeof data.nombre === 'string' &&
      data.nombre.trim().length > 0 &&
      data.ingredientes &&
      Array.isArray(data.ingredientes) &&
      data.ingredientes.length > 0
    );
  } catch {
    return false;
  }
};

export const getStorageSize = (): string => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    
    const sizeInMB = (total / (1024 * 1024)).toFixed(2);
    return `${sizeInMB} MB`;
  } catch {
    return 'N/A';
  }
};

export const clearOfflineData = (): void => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('recetas-') || key.startsWith('offline-') || key.startsWith('pending-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
};
