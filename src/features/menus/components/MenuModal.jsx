import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMenuStore } from "../store/useMenuStore";
import { Spinner } from "./layouts/Spinner.jsx";

export const MenuModal = ({ isOpen, onClose, menu }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    const saveMenu = useMenuStore((state) => state.saveMenu); // Cambiamos a la acción del store
    const loading = useMenuStore((state) => state.loading);
    const [preview, setPreview] = useState(null);

    const photoFile = watch("photo");

    useEffect(() => {
        if (isOpen) {
            if (menu) {
                reset({
                    name: menu.name,
                    category: menu.category,
                    price: menu.price,
                    description: menu.description,
                });
                setPreview(menu.photo);
            } else {
                reset({
                    name: "",
                    category: "",
                    price: "",
                    description: "",
                    photo: null
                });
                setPreview(null);
            }
        }
    }, [isOpen, menu, reset]);

    useEffect(() => {
        if (photoFile && photoFile.length > 0) {
            const file = photoFile[0];
            setPreview(URL.createObjectURL(file));
        }
    }, [photoFile]);

    const onSubmit = async (data) => {
        // Preparamos el FormData porque enviamos imagen (multipart/form-data)
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("category", data.category);
        formData.append("price", data.price);
        formData.append("description", data.description);
        
        if (data.photo && data.photo[0]) {
            formData.append("photo", data.photo[0]);
        }

        const result = await saveMenu(formData, menu?._id || menu?.id);
        
        if (result.success) {
            reset();
            setPreview(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#2F2F2F]/60 backdrop-blur-sm flex justify-center items-center z-50 px-3">
            <div className="bg-[#FFFFFD] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E2DFCE]">
                
                {/* HEADER CON TU PALETA VERDE */}
                <div className="p-6 text-white bg-[#517360]">
                    <h2 className="text-2xl font-bold">
                        {menu ? "Editar Menú" : "Nuevo Platillo"}
                    </h2>
                    <p className="text-sm opacity-90">
                        {menu ? "Actualiza los detalles del plato" : "Agrega una nueva delicia a la carta"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    
                    {/* PREVIEW CIRCULAR */}
                    <div className="flex justify-center mb-2">
                        <div className="w-32 h-32 rounded-2xl bg-[#E2DFCE] border-2 border-dashed border-[#517360] flex items-center justify-center overflow-hidden shadow-inner relative group">
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <span className="text-[#517360] text-xs font-bold text-center p-2">Sube una foto deliciosa</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre del Plato */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2F2F2F] uppercase mb-1 block">Nombre del Menú</label>
                            <input
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DFCE] focus:border-[#517360] outline-none transition bg-gray-50/50"
                                placeholder="Ej. Hamburguesa Artesanal"
                                {...register("name", { required: "El nombre es obligatorio" })}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="text-xs font-bold text-[#2F2F2F] uppercase mb-1 block">Categoría</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DFCE] focus:border-[#517360] outline-none transition bg-gray-50/50"
                                {...register("category", { required: "Selecciona una categoría" })}
                            >
                                <option value="">Elegir...</option>
                                <option value="Entradas">Entradas</option>
                                <option value="Plato Fuerte">Plato Fuerte</option>
                                <option value="Postres">Postres</option>
                                <option value="Bebidas">Bebidas</option>
                            </select>
                        </div>

                        {/* Precio */}
                        <div>
                            <label className="text-xs font-bold text-[#2F2F2F] uppercase mb-1 block">Precio (Q)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DFCE] focus:border-[#517360] outline-none transition bg-gray-50/50"
                                placeholder="0.00"
                                {...register("price", { required: "Precio necesario", min: 1 })}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2F2F2F] uppercase mb-1 block">Descripción e Ingredientes</label>
                            <textarea
                                rows="3"
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E2DFCE] focus:border-[#517360] outline-none transition bg-gray-50/50 resize-none"
                                placeholder="Describe el sabor..."
                                {...register("description", { required: "Cuéntanos sobre el plato" })}
                            />
                        </div>

                        {/* Input Foto */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#2F2F2F] uppercase mb-1 block">Cambiar Imagen</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#DDB7A2] file:text-[#A66F5B] hover:file:bg-[#A66F5B] hover:file:text-white cursor-pointer w-full"
                                {...register("photo")}
                            />
                        </div>
                    </div>

                    {/* BOTONES ACCIÓN */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-[#A66F5B] bg-[#E2DFCE] hover:bg-[#DDB7A2] transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 px-8 py-3 rounded-xl font-bold text-white bg-[#517360] hover:bg-[#2F2F2F] transition shadow-lg flex items-center justify-center min-w-[140px]"
                        >
                            {loading ? <Spinner /> : menu ? "Guardar Cambios" : "Agregar a la Carta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};