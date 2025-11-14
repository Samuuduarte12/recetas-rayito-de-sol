"use client";

import { useState } from "react";
import { useRecetas, Receta } from "./hooks/useRecetas";
import Image from "next/image";
import Loading from "./components/Loading";
import Link from "next/link";
import OfflineBadge from "./components/OfflineBadge";
import React from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";

export default function Home() {
  const { recetas, loading, isOnline } = useRecetas();
  const [search, setSearch] = useState("");

  const recetasFiltradas = recetas.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e2d1a3] to-[#f5e4b8] pb-24">
      {/* Header con logo */}
      <header className="sticky top-0 z-10 bg-[#f6d748] shadow-md border-b-2 border-[#e2d1a3] p-4 flex flex-col gap-2">
        <div className="flex justify-center">
          <Image
            src="/rayito-de-sol.png"
            alt="Rayito de Sol"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
          {/* Buscador mejorado */}
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <HiMagnifyingGlass className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[#f6d748] focus:ring-2 focus:ring-[#f6d748]/20 transition-all text-gray-700 placeholder-gray-400"
          />
        </div>
      </header>

      <main className="px-4 pt-6 pb-6">
        {/* Estado de conexión */}
        {!isOnline && (
          <div className="mb-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <strong className="block text-sm font-semibold">Modo offline activado</strong>
                <p className="text-xs mt-0.5 opacity-90">Los cambios se sincronizarán cuando vuelva la conexión</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <Loading />
        ) : (
          <>
            {recetasFiltradas.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {recetasFiltradas.map((receta: Receta) => (
                  <Link
                    key={receta.id}
                    href={`/recetas/${receta.id}`}
                    className="group bg-[#f6d748] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative transform hover:-translate-y-1"
                  >
                    <OfflineBadge isOffline={receta.isOffline} />
                    <div className="relative w-full h-40 overflow-hidden">
                      {receta.imagen ? (
                        <Image
                          src={receta.imagen}
                          alt={receta.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#f6d748] to-[#f5e4b8] flex items-center justify-center">
                          <span className="text-4xl">🍳</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-800 text-center line-clamp-2 min-h-[2.5rem]">
                        {receta.nombre}
                      </h3>
                      {receta.isOffline && (
                        <p className="text-xs text-gray-600 text-center mt-1.5">
                          ⚡ Offline
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl font-semibold text-gray-700 mb-2 text-center">
                  {search ? "No se encontraron recetas" : "No hay recetas aún"}
                </p>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  {search ? "Intenta con otro término de búsqueda" : "Comienza agregando tu primera receta"}
                </p>
                <Link
                  href="/agregar"
                  className="bg-[#f6d748] text-gray-800 font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  ➕ Agregar Receta
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
