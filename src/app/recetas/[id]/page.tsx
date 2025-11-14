"use client";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import Image from "next/image";
import Loading from "../../components/Loading";
import Link from "next/link";
import LoadingDatos from "../../components/LoadingDatos";
import { getRecipeById, deleteRecipe } from "../../../lib/api";

interface Receta {
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string | Array<{ url: string; public_id: string; tipo: string }>;
}

export default function RecetaDetalle() {
  const params = useParams();
  const router = useRouter();
  const [receta, setReceta] = useState<Receta | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarMensaje, setMostrarMensaje] = useState<boolean>(false);

  useEffect(() => {
    const fetchReceta = async () => {
      if (!params?.id) return;

      try {
        setLoading(true);
        setError(null);
        // ✅ Forzamos string
        const id = Array.isArray(params.id) ? params.id[0] : params.id;

        const recetaData = await getRecipeById(id);
        
        // Manejar imágenes: puede ser string o array de objetos
        let imagenUrl = '';
        if (Array.isArray(recetaData.imagen) && recetaData.imagen.length > 0) {
          // Si es array, tomar la primera URL
          imagenUrl = recetaData.imagen[0].url || recetaData.imagen[0];
        } else if (typeof recetaData.imagen === 'string') {
          imagenUrl = recetaData.imagen;
        }
        
        setReceta({
          nombre: recetaData.nombre || "",
          descripcion: recetaData.descripcion || "",
          ingredientes: recetaData.ingredientes || [],
          imagen: imagenUrl,
        });
      } catch (error) {
        console.error("Error al cargar receta:", error);
        setError(error instanceof Error ? error.message : "Error al cargar la receta");
      } finally {
        setLoading(false);
      }
    };

    fetchReceta();
  }, [params?.id]);


  const handleEliminar = async () => {
    if (!params.id) return;
    const confirm = window.confirm("¿Seguro que querés eliminar esta receta?");
    if (!confirm) return;

    try {
      setDeleting(true);
      setError(null);
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      await deleteRecipe(id);
      setMostrarMensaje(true);
      setTimeout(() => {
        setMostrarMensaje(false);
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error eliminando receta:", error);
      setError(error instanceof Error ? error.message : "Error al eliminar la receta");
      setDeleting(false);
    }    
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e2d1a3] to-[#f5e4b8] pb-24">
      {mostrarMensaje && <LoadingDatos loading={deleting} mensaje="✅ Receta Eliminada con éxito"/>}
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f6d748] shadow-md border-b-2 border-[#e2d1a3]">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-[#e2d1a3]/30 transition-colors"
            title="Volver"
          >
            <IoMdArrowRoundBack className="text-2xl text-gray-800" />
          </button>
          
          <div className="flex gap-2">
            <Link
              href={`/recetas/editar/${params.id}`}
              className="p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              title="Editar receta"
            >
              <AiOutlineEdit className="text-xl text-gray-800" />
            </Link>
            
            <button
              onClick={handleEliminar}
              disabled={deleting}
              className="p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eliminar receta"
            >
              {deleting ? (
                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <AiOutlineDelete className="text-xl text-red-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      ) : error && !receta ? (
        <div className="px-4 pt-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-5xl mb-4">😕</div>
            <p className="font-bold text-gray-800 mb-2 text-lg">Error</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-[#f6d748] text-gray-800 font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      ) : !receta ? (
        <div className="px-4 pt-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold text-gray-800 mb-2 text-lg">Receta no encontrada</p>
            <p className="text-sm text-gray-600 mb-6">La receta que buscas no existe o fue eliminada</p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-[#f6d748] text-gray-800 font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      ) : (
        <main className="px-4 pt-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <p className="font-semibold text-red-800 mb-1">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="max-w-lg mx-auto">
            {/* Imagen */}
            {receta.imagen && typeof receta.imagen === 'string' && (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={receta.imagen}
                  alt={receta.nombre}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Contenido */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Título */}
              <div className="bg-gradient-to-r from-[#f6d748] to-[#f5e4b8] p-6">
                <h1 className="text-2xl font-bold text-gray-800 text-center">{receta.nombre}</h1>
              </div>

              <div className="p-6 space-y-6">
                {/* Descripción */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📝</span>
                    <h2 className="text-lg font-bold text-gray-800">Descripción</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-8">{receta.descripcion}</p>
                </div>

                {/* Ingredientes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🥘</span>
                    <h2 className="text-lg font-bold text-gray-800">Ingredientes</h2>
                  </div>
                  <ul className="space-y-2 pl-8">
                    {receta.ingredientes.map((ing, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#f6d748] font-bold mt-1">•</span>
                        <span className="text-gray-700 flex-1">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
