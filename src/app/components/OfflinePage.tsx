"use client";

import { useState, useEffect } from 'react';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { getStorageSize } from '../utils/offlineUtils';

export default function OfflinePage() {
  const { offlineRecetas, pendingActions, clearPendingActions } = useOfflineStorage();
  const [storageSize, setStorageSize] = useState('');

  useEffect(() => {
    setStorageSize(getStorageSize());
  }, [offlineRecetas]);

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos offline? Esta acción no se puede deshacer.')) {
      clearPendingActions();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#e2d1a3] p-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Información Offline
            </h1>
            <p className="text-gray-600">
              Tu aplicación está funcionando sin conexión a internet
            </p>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📚 Recetas Guardadas</h3>
              <p className="text-blue-700">
                Tienes <strong>{offlineRecetas.length}</strong> recetas guardadas localmente
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">🔄 Cambios Pendientes</h3>
              <p className="text-orange-700">
                Hay <strong>{pendingActions.length}</strong> cambios esperando sincronización
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">💾 Almacenamiento</h3>
              <p className="text-green-700">
                Usando <strong>{storageSize}</strong> de espacio local
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Información</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Las recetas se cargan desde el almacenamiento local</li>
              <li>• Puedes agregar nuevas recetas que se guardarán offline</li>
              <li>• Los cambios se sincronizarán automáticamente cuando vuelva la conexión</li>
              <li>• La aplicación funciona completamente sin internet</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-[#f6d748] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Limpiar Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
