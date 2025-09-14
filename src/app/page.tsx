"use client";

import { useState } from "react";
import { useRecetas, Receta } from "@/app/hooks/useRecetas";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";

export default function Home() {
  const { recetas, loading } = useRecetas();
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Filtrado por nombre
  const recetasFiltradas = recetas.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase())
  );
    
  return (
    <div className="font-sans min-h-screen py-8 px-4 bg-[#e2d1a3]">      
      <main className="flex flex-col gap-6">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 border border-gray-500 rounded-xl bg-white"
        />

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {recetasFiltradas.length > 0 ? (
              <>
                {recetasFiltradas.map((receta: Receta) => (
                  <div
                    key={receta.id}
                    className="max-w-lg mx-auto bg-[#f6d748] shadow-md rounded-2xl w-full cursor-pointer"
                    onClick={() => router.push(`/recetas/${receta.id}`)}
                  >
                    <div className="relative w-full h-44">
                      {receta.imagen && (
                        <Image
                          src={receta.imagen}
                          alt={receta.nombre}
                          fill
                          className="w-full h-44 object-cover rounded-t-lg"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm text-center uppercase font-bold">{receta.nombre}</h3>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <span className="text-center text-xl">
                No hay recetas cargadas
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
