"use client";

import { useState, useEffect } from 'react';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

export default function ConnectionStatus() {
  const [isVisible, setIsVisible] = useState(false);
  const { isOnline, pendingActions } = useOfflineStorage();

  useEffect(() => {
    // Mostrar notificación cuando cambia el estado
    if (!isOnline) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const getStatusMessage = () => {
    if (!isOnline) {
      return "Sin conexión - Modo offline activado";
    }
    if (pendingActions.length > 0) {
      return `Sincronizando ${pendingActions.length} cambios...`;
    }
    return "Conectado";
  };

  const getStatusColor = () => {
    if (!isOnline) return "bg-orange-500";
    if (pendingActions.length > 0) return "bg-blue-500";
    return "bg-green-500";
  };

  if (!isVisible && isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`
        ${getStatusColor()} 
        text-white px-4 py-2 rounded-lg shadow-lg 
        flex items-center gap-2 text-sm font-medium
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
        <span>{getStatusMessage()}</span>
        {!isOnline && (
          <div className="text-xs opacity-75">
            Los cambios se guardarán cuando vuelva la conexión
          </div>
        )}
      </div>
    </div>
  );
}
