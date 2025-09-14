"use client";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { IoMdArrowRoundBack } from "react-icons/io";
import Image from "next/image";
import Loading from "@/app/components/Loading";
import Link from "next/link";
import LoadingDatos from "@/app/components/LoadingDatos";

interface Receta {
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string;
}

export default function RecetaDetalle() {
  const params = useParams();
  const router = useRouter();
  const [receta, setReceta] = useState<Receta | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarMensaje, setMostrarMensaje] = useState<boolean>(false);

  useEffect(() => {
    const fetchReceta = async () => {
      if (!params?.id) return;

      // ✅ Forzamos string
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      const docRef = doc(db, "rayito-recetas", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setReceta(docSnap.data() as Receta);
      }
      setLoading(false);
    };

    fetchReceta();
  }, [params?.id]);


  const handleEliminar = async () => {
    if (!params.id) return;
    const confirm = window.confirm("¿Seguro que querés eliminar esta receta?");
    if (!confirm) return;

    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      await deleteDoc(doc(db, "rayito-recetas", id));
      setMostrarMensaje(true)
      setTimeout(() => {
        setMostrarMensaje(false)
      }, 3000);
      router.push("/");
    } catch (error) {
      console.error("Error eliminando receta:", error);
      alert("Error al eliminar la receta");
    }    
  };

  return (
    <div className=" p-4 sm:p-20 bg-[#fef3c7] min-h-screen">
      {mostrarMensaje && <LoadingDatos loading={loading} mensaje="Receta Eliminada con éxito"/>}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 max-w-lg mx-auto gap-4">
            {/* Botón Volver */}
            <button
              onClick={() => router.back()}
              className="text-black text-3xl p-2 rounded-lg hover:bg-gray-200"
              title="Volver"
            >
              <IoMdArrowRoundBack />
            </button>

            <div className="flex gap-2">
              {/* Botón Editar */}
              <Link
                href={`/recetas/editar/${params.id}`}
                className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                title="Editar receta"
              >
                <AiOutlineEdit className="text-lg" />
              </Link>

              {/* Botón Eliminar */}
              <button
                onClick={handleEliminar}
                className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                title="Eliminar receta"
              >
                <AiOutlineDelete className="text-lg" />
              </button>
            </div>
          </div>

          {!receta ? (
            <p>Receta no encontrada</p>
          ) : (
            <div className="max-w-lg mx-auto bg-[#f6d748] shadow-md rounded-2xl w-full p-4">
              <h1 className="text-2xl font-bold text-center mb-4">{receta.nombre}</h1>
              {receta.imagen && (
                <div className="relative w-full h-64 mb-4">
                  <Image
                    src={receta.imagen}
                    alt={receta.nombre}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              )}
              <h3 className="font-semibold border-b border-black">Descripcion</h3>
              <p className="mb-4">{receta.descripcion}</p>

              <h4 className="font-semibold mb-2 border-b border-black">Ingredientes:</h4>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 list-disc list-inside">
                {receta.ingredientes.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
