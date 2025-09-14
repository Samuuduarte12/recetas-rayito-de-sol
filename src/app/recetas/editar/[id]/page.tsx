"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaImage } from "react-icons/fa6";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MdDelete } from "react-icons/md";
import LoadingDatos from "@/app/components/LoadingDatos";
import { IoMdArrowRoundBack } from "react-icons/io";

interface Receta {
    nombre: string;
    descripcion: string;
    ingredientes: string[];
    imagen: string;
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
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // ✅ Cargar receta existente
    useEffect(() => {
        const fetchReceta = async () => {
            if (!params.id) return;
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            const docRef = doc(db, "rayito-recetas", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setForm(docSnap.data() as Receta);
            }
        };
        fetchReceta();
    }, [params.id]);

    // ✅ Cambios genéricos en inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // ✅ Submit para actualizar
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!params.id) return;
        setLoading(true);

        try {
            let imageUrl = form.imagen;

            if (file) {
                const imageRef = ref(storage, `rayito-recetas/${Date.now()}-${file.name}`);
                await uploadBytes(imageRef, file);
                imageUrl = await getDownloadURL(imageRef);
            }

            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            await updateDoc(doc(db, "rayito-recetas", id), {
                ...form,
                imagen: imageUrl,
            });
            setShowModal(true)

            alert("Receta actualizada con éxito 🎉");
            router.push(`/recetas/${id}`); // redirige al detalle
        } catch (error) {
            console.error("Error actualizando receta:", error);
            alert("Error al actualizar la receta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-20 bg-[#fef3c7] flex justify-center items-start">
            {(loading || showModal) ? (
                <LoadingDatos loading={loading} mensaje="✅ Receta actualizada con éxito" />
            ) : (
                <div>
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-black text-3xl p-2 rounded-lg hover:bg-gray-200"
                            title="Volver"
                        >
                            <IoMdArrowRoundBack />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-yellow-400 shadow-md rounded-2xl p-6 w-full max-w-lg space-y-4"
                    >
                        <h2 className="text-2xl font-bold text-center">Editar Receta</h2>

                        {/* Nombre */}
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Nombre de la receta"
                            className="w-full p-2 border border-gray-500 rounded-xl bg-white"
                            required
                        />

                        {/* Descripción */}
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                            className="w-full p-2 border border-gray-500 rounded-xl bg-white"
                            required
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
                        </div>

                        {/* Imagen */}
                        <div className="flex flex-col gap-2">
                            <input
                                type="file"
                                id="imagen"
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
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg mt-2 border"
                                />
                            )}
                            {!file && form.imagen && (
                                <img
                                    src={form.imagen}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg mt-2 border"
                                />
                            )}
                        </div>

                        {/* Botón guardar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Actualizar Receta"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
