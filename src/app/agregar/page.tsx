"use client";

import { useState } from "react";
import React from 'react';
import Image from "next/image";
import { createRecipe } from "../../lib/api";
import Modal from "../components/Modal";

export default function CreateRecipePage() {
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        ingredientes: [""],
    });

    const [imagen, setImagen] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError(null);
    };

    const handleArrayChange = (e, index, field) => {
        const newArr = [...form[field]];
        newArr[index] = e.target.value;
        setForm({ ...form, [field]: newArr });
    };

    const addField = (field) => {
        setForm({ ...form, [field]: [...form[field], ""] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Resetear error y activar loading
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("nombre", form.nombre);
            formData.append("descripcion", form.descripcion);

            // Multer espera el mismo nombre de campo repetido para arrays
            const ingredientesValidos = form.ingredientes.filter(i => i.trim());
            if (ingredientesValidos.length === 0) {
                throw new Error("Debes agregar al menos un ingrediente");
            }

            ingredientesValidos.forEach((i) => {
                formData.append("ingredientes", i);
            });

            // Agregar imágenes - el backend espera parser.array('images', 6)
            // Por lo tanto, debemos usar el nombre de campo "images" (en inglés, plural)
            if (imagen.length > 0) {
                // Validar que no se exceda el límite de 6 imágenes
                if (imagen.length > 6) {
                    throw new Error("Solo puedes subir un máximo de 6 imágenes");
                }
                
                imagen.forEach((img) => {
                    // Validar tamaño de archivo (por ejemplo, máximo 5MB)
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (img.size > maxSize) {
                        throw new Error(`La imagen ${img.name} es demasiado grande. El tamaño máximo es 5MB`);
                    }
                    formData.append("images", img);
                });
            }

            // Usar la función de la API para crear la receta
            const data = await createRecipe(formData);
            console.log("Recipe created:", data);
            
            // Limpiar el formulario después de éxito
            setForm({ nombre: "", descripcion: "", ingredientes: [""] });
            setImagen([]);
            
            // Mostrar mensaje de éxito
            setShowSuccessModal(true);
            
        } catch (error) {
            console.error("Error al crear receta:", error);
            
            // Establecer el mensaje de error con manejo específico según el status
            if (error instanceof Error) {
                let errorMessage = error.message;
                
                // Manejar diferentes tipos de errores con mensajes específicos
                const apiError = error as Error & { status?: number };
                if (apiError.status === 400) {
                    errorMessage = errorMessage || "Datos inválidos. Por favor, verifica la información ingresada.";
                } else if (apiError.status === 413) {
                    errorMessage = "Los archivos son demasiado grandes. Por favor, reduce el tamaño de las imágenes.";
                } else if (apiError.status === 500) {
                    errorMessage = errorMessage || "Error interno del servidor. Por favor, intenta más tarde.";
                }
                
                setError(errorMessage);
            } else {
                setError("Error al crear la receta. Por favor, intenta de nuevo.");
            }
        } finally {
            // Desactivar loading siempre, incluso si hay error
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#e2d1a3] to-[#f5e4b8] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[#f6d748] shadow-md border-b-2 border-[#e2d1a3]">
                <div className="flex flex-col items-center justify-center py-2 px-4">
                    <Image 
                        src="/rayito-de-sol.png" 
                        alt="Rayito de Sol" 
                        width={80} 
                        height={80}
                        className="object-contain"
                    />
                    <h1 className="ml-3 text-xl font-bold text-gray-800">Nueva Receta</h1>
                </div>
            </header>

            <main className="px-4 pt-6 pb-6">
                {/* Mensaje de error */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1">Error</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* TITLE */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">📝 Título</label>
                    <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Pastel de chocolate"
                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f6d748] focus:ring-2 focus:ring-[#f6d748]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                        required
                        disabled={loading}
                    />
                </div>

                {/* DESCRIPTION */}
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

                {/* INGREDIENTES */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-3">🥘 Ingredientes</label>
                    <div className="space-y-2">
                        {form.ingredientes.map((ing, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-[#f6d748] font-bold text-lg w-6">•</span>
                                <input
                                    value={ing}
                                    onChange={(e) => handleArrayChange(e, idx, "ingredientes")}
                                    className="flex-1 p-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f6d748] focus:ring-2 focus:ring-[#f6d748]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
                                    placeholder={`Ingrediente ${idx + 1}`}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => addField("ingredientes")}
                        className="mt-3 w-full py-2.5 bg-[#f6d748] text-gray-800 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        <span>➕</span>
                        Agregar Ingrediente
                    </button>
                </div>

                {/* IMAGES */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-3">📷 Imágenes</label>
                    <label className="block w-full">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setImagen(e.target.files ? Array.from(e.target.files) : [])}
                            className="hidden"
                            disabled={loading}
                        />
                        <div className="w-full py-4 px-4 bg-gradient-to-br from-[#f6d748] to-[#f5e4b8] border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#f6d748] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="text-3xl block mb-2">📸</span>
                            <span className="text-sm font-semibold text-gray-700">
                                {imagen.length > 0 ? `${imagen.length} imagen${imagen.length > 1 ? 'es' : ''} seleccionada${imagen.length > 1 ? 's' : ''}` : 'Toca para seleccionar imágenes'}
                            </span>
                            {imagen.length > 6 && (
                                <p className="text-xs text-red-600 mt-1 font-semibold">Máximo 6 imágenes</p>
                            )}
                        </div>
                    </label>

                    {/* PREVIEW */}
                    {imagen.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {Array.from(imagen).map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={URL.createObjectURL(img)}
                                        className="w-full h-full object-cover"
                                        alt={`Preview ${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#f6d748] text-gray-800 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Creando receta...</span>
                        </>
                    ) : (
                        <>
                            <span>✨</span>
                            <span>Crear Receta</span>
                        </>
                    )}
                </button>
            </form>
            </main>

            {/* Modal de éxito */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message="✅ Receta creada con éxito!"
                type="success"
                autoClose={true}
                autoCloseDelay={2000}
            />
        </div>
    );
}
