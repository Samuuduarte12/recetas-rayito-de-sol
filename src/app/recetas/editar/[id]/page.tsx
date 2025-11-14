"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaImage } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import LoadingDatos from "../../../components/LoadingDatos";
import { IoMdArrowRoundBack } from "react-icons/io";
import Image from "next/image";
import { getRecipeById, updateRecipe } from "../../../../lib/api";
import Modal from "../../../components/Modal";

interface Receta {
    nombre: string;
    descripcion: string;
    ingredientes: string[];
    imagen: string | Array<{ url: string; public_id: string; tipo: string }>;
}

export default function EditarReceta() {
    const params = useParams();
    const router = useRouter();

    const [form, setForm] = useState<Receta>({
        nombre: "",
        descripcion: "",
        ingredientes: [""],
        imagen: "",
    });
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // ✅ Cargar receta existente
    useEffect(() => {
        const fetchReceta = async () => {
            if (!params.id) return;
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            
            try {
                setLoadingData(true);
                setError(null);
                const receta = await getRecipeById(id);
                
                // Manejar imágenes: puede ser string o array de objetos
                let imagenUrl = '';
                if (Array.isArray(receta.imagen) && receta.imagen.length > 0) {
                    // Si es array, tomar la primera URL
                    const firstImage = receta.imagen[0];
                    imagenUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || '';
                } else if (typeof receta.imagen === 'string') {
                    imagenUrl = receta.imagen;
                }
                
                setForm({
                    nombre: receta.nombre || "",
                    descripcion: receta.descripcion || "",
                    ingredientes: receta.ingredientes && receta.ingredientes.length > 0 
                        ? receta.ingredientes 
                        : [""],
                    imagen: imagenUrl,
                });
            } catch (error) {
                console.error("Error al cargar receta:", error);
                setError(error instanceof Error ? error.message : "Error al cargar la receta");
            } finally {
                setLoadingData(false);
            }
        };
        fetchReceta();
    }, [params.id]);

    // ✅ Cambios genéricos en inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError(null);
    };

    // ✅ Ingredientes dinámicos
    const handleAgregarIngrediente = () => {
        setForm({ ...form, ingredientes: [...form.ingredientes, ""] });
    };

    const handleChangeIngrediente = (index: number, value: string) => {
        const nuevos = [...form.ingredientes];
        nuevos[index] = value;
        setForm({ ...form, ingredientes: nuevos });
    };

    const handleEliminarIngrediente = (index: number) => {
        const nuevos = form.ingredientes.filter((_, i) => i !== index);
        setForm({ ...form, ingredientes: nuevos });
    };

    // ✅ Imagen
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            // Validar que no se exceda el límite de 6 imágenes
            if (selectedFiles.length > 6) {
                setError("Solo puedes subir un máximo de 6 imágenes");
                return;
            }
            // Validar tamaño de archivos
            const maxSize = 5 * 1024 * 1024; // 5MB
            for (const file of selectedFiles) {
                if (file.size > maxSize) {
                    setError(`La imagen ${file.name} es demasiado grande. El tamaño máximo es 5MB`);
                    return;
                }
            }
            setFiles(selectedFiles);
        }
    };

    // ✅ Submit para actualizar
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!params.id) return;
        
        // Resetear error y activar loading
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("nombre", form.nombre);
            formData.append("descripcion", form.descripcion);
            
            // Validar ingredientes
            const ingredientesValidos = form.ingredientes.filter(i => i.trim());
            if (ingredientesValidos.length === 0) {
                throw new Error("Debes agregar al menos un ingrediente");
            }
            
            ingredientesValidos.forEach((i) => {
                formData.append("ingredientes", i);
            });

            // Agregar imágenes nuevas si hay
            if (files.length > 0) {
                files.forEach((img) => {
                    formData.append("images", img);
                });
            }

            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            await updateRecipe(id, formData);
            
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error actualizando receta:", error);
            
            // Establecer el mensaje de error
            if (error instanceof Error) {
                const apiError = error as Error & { status?: number };
                let errorMessage = error.message;
                
                if (apiError.status === 400) {
                    errorMessage = errorMessage || "Datos inválidos. Por favor, verifica la información ingresada.";
                } else if (apiError.status === 413) {
                    errorMessage = "Los archivos son demasiado grandes. Por favor, reduce el tamaño de las imágenes.";
                } else if (apiError.status === 500) {
                    errorMessage = errorMessage || "Error interno del servidor. Por favor, intenta más tarde.";
                }
                
                setError(errorMessage);
            } else {
                setError("Error al actualizar la receta. Por favor, intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#e2d1a3] to-[#f5e4b8] flex justify-center items-center">
                <LoadingDatos loading={true} mensaje="Cargando receta..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#e2d1a3] to-[#f5e4b8] pb-24">
            {loading ? (
                <LoadingDatos loading={loading} mensaje="Guardando receta..." />
            ) : (
                <>
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
                            <h1 className="text-xl font-bold text-gray-800">Editar Receta</h1>
                            <div className="w-10"></div>
                        </div>
                    </header>

                    <main className="px-4 pt-6 pb-6">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                            noValidate
                        >

                            {/* Mensaje de error */}
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-red-800 mb-1">Error</p>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Nombre */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 mb-2">📝 Título</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Pastel de chocolate"
                                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f6d748] focus:ring-2 focus:ring-[#f6d748]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Descripción */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 mb-2">📄 Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describe la receta..."
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f6d748] focus:ring-2 focus:ring-[#f6d748]/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Ingredientes */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 mb-3">🥘 Ingredientes</label>
                                <div className="space-y-2">
                                    {form.ingredientes.map((ing, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-[#f6d748] font-bold text-lg w-6">•</span>
                                            <input
                                                type="text"
                                                value={ing}
                                                onChange={(e) => handleChangeIngrediente(index, e.target.value)}
                                                placeholder={`Ingrediente ${index + 1}`}
                                                className="flex-1 p-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f6d748] focus:ring-2 focus:ring-[#f6d748]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleEliminarIngrediente(index)}
                                                className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={loading}
                                            >
                                                <MdDelete className="text-xl" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAgregarIngrediente}
                                    className="mt-3 w-full py-2.5 bg-[#f6d748] text-gray-800 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <span>➕</span>
                                    Agregar Ingrediente
                                </button>
                            </div>

                            {/* Imagen */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 mb-3">📷 Imágenes</label>
                                <label className="block w-full">
                                    <input
                                        type="file"
                                        id="imagen"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <div className={`w-full py-4 px-4 bg-gradient-to-br from-[#f6d748] to-[#f5e4b8] border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#f6d748] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {files.length > 0 ? (
                                            <>
                                                <span className="text-3xl block mb-2">📸</span>
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {files.length} imagen{files.length > 1 ? 'es' : ''} nueva{files.length > 1 ? 's' : ''} seleccionada{files.length > 1 ? 's' : ''}
                                                </span>
                                                {files.length > 6 && (
                                                    <p className="text-xs text-red-600 mt-1 font-semibold">Máximo 6 imágenes</p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <FaImage className="text-3xl mx-auto mb-2 text-gray-600" />
                                                <span className="text-sm font-semibold text-gray-700">Toca para agregar imágenes</span>
                                            </>
                                        )}
                                    </div>
                                </label>
                                
                                {files.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        {Array.from(files).map((file, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    className="w-full h-full object-cover"
                                                    alt={`Preview ${i + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {files.length === 0 && form.imagen && typeof form.imagen === 'string' && (
                                    <div className="relative w-full h-48 mt-4 rounded-lg overflow-hidden shadow-md">
                                        <Image
                                            src={form.imagen}
                                            alt="Imagen actual"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">Imagen actual</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón guardar */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#f6d748] text-gray-800 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        <span>Actualizar Receta</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </main>
                </>
            )}

            {/* Modal de éxito */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    const id = Array.isArray(params.id) ? params.id[0] : params.id;
                    router.push(`/recetas/${id}`);
                }}
                message="✅ Receta actualizada con éxito!"
                type="success"
                autoClose={true}
                autoCloseDelay={2000}
            />
        </div>
    );
}
