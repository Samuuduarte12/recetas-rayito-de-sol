"use client";

import { useState } from "react";
import { useRecetas, Receta } from "@/app/hooks/useRecetas";
import Image from "next/image";
import Loading from "./components/Loading";
import Link from "next/link";

export default function Home() {
  const { recetas, loading } = useRecetas();
  const [search, setSearch] = useState("");

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
          <div className={`${recetasFiltradas.length ? 'grid grid-cols-2 md:grid-cols-3' : ''} gap-3 mt-4`}>
            {recetasFiltradas.length > 0 ? (
              <>
                {recetasFiltradas.map((receta: Receta) => (
                  <Link
                    key={receta.id}
                    href={`/recetas/${receta.id}`}
                    className="max-w-lg mx-auto bg-[#f6d748] shadow-md rounded-2xl w-full cursor-pointer"
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
                  </Link>
                ))}
              </>
            ) : (
              <p className="text-center flex flex-col gap-5 text-xl">
                No hay recetas cargadas
                <Link href="/agregar" className="bg-black text-white p-2 rounded-lg">Agragar Receta</Link>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
