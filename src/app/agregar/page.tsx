"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { MdDelete } from "react-icons/md";
import { FaImage } from "react-icons/fa6";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoadingDatos from "../components/LoadingDatos";
import Image from "next/image";

interface Receta {
    nombre: string;
    descripcion: string;
    ingredientes: string[];
    imagen: string;
}

export default function Page() {
    const router = useRouter();

    const [form, setForm] = useState<Receta>({
        nombre: "",
        descripcion: "",
        ingredientes: [""],
        imagen: "",
    });

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAgregarIngrediente = () => {
        setForm({ ...form, ingredientes: [...form.ingredientes, ""] });
    };

    const handleChangeIngrediente = (index: number, value: string) => {
        const nuevosIngredientes = [...form.ingredientes];
        nuevosIngredientes[index] = value;
        setForm({ ...form, ingredientes: nuevosIngredientes });
    };

    const handleEliminarIngrediente = (index: number) => {
        const nuevosIngredientes = form.ingredientes.filter((_, i) => i !== index);
        setForm({ ...form, ingredientes: nuevosIngredientes });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";

            if (file) {
                const imageRef = ref(storage, `rayito-recetas/${Date.now()}-${file.name}`);
                await uploadBytes(imageRef, file);
                imageUrl = await getDownloadURL(imageRef);
            }

            await addDoc(collection(db, "rayito-recetas"), {
                ...form,
                imagen: imageUrl,
                createdAt: new Date(),
            });

            // Mostrar modal de éxito
            setShowModal(true);

            // Redirigir al home después de 2 segundos
            setTimeout(() => {
                router.push("/");
            }, 2000);

            // Reset form
            setForm({ nombre: "", descripcion: "", ingredientes: [""], imagen: "" });
            setFile(null);
        } catch (error) {
            console.error("Error subiendo receta:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${(loading || showModal) ? 'flex justify-center items-center ' : 'font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center'} bg-[#e2d1a3] min-h-screen p-4 pb-20 sm:p-20`}>
            {(loading || showModal) ? (
                <LoadingDatos loading={loading} mensaje="✅ Receta guardada con éxito" />
            ) : (

                <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-lg mx-auto bg-[#f6d748] shadow-xl rounded-2xl p-6 space-y-4 w-full"
                    >
                        <h2 className="text-2xl font-bold text-center">Agregar Receta</h2>

                        {/* Nombre */}
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre de la receta"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-500 rounded-xl bg-white"
                        />

                        {/* Descripción */}
                        <textarea
                            name="descripcion"
                            placeholder="Descripción"
                            value={form.descripcion}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-500 rounded-xl bg-white"
                        />

                        {/* Ingredientes */}
                        <div className="space-y-2">
                            <label className="font-semibold">Ingredientes</label>
                            {form.ingredientes.map((ing, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={ing}
                                        onChange={(e) => handleChangeIngrediente(index, e.target.value)}
                                        placeholder={`Ingrediente ${index + 1}`}
                                        className="w-full p-2 border border-gray-500 rounded-xl bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarIngrediente(index)}
                                        className="px-3 py-2 bg-red-500 text-white text-2xl rounded-lg hover:bg-red-600"
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAgregarIngrediente}
                                className="px-3 py-2 w-full bg-green-500 text-white rounded-lg text-center"
                            >
                                Agregar Ingrediente
                            </button>

                            {/* Imagen */}
                            <div className="flex flex-col gap-2 w-full">
                                <input
                                    id="imagen"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="imagen"
                                    className="cursor-pointer px-4 py-2 bg-orange-400 text-white rounded-lg text-center hover:bg-purple-700"
                                >
                                    {file ? "📷 Imagen seleccionada" : <FaImage className="text-2xl mx-auto" />}
                                </label>
                                {file && (
                                    <div className="relative w-full h-44">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="w-full h-44 object-cover rounded-lg mt-2 border"
                                            fill
                                            unoptimized
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botón guardar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Receta"}
                        </button>
                    </form>
                </main>
            )}
        </div>
    );
}
