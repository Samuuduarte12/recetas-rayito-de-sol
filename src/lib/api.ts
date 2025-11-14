// URL del backend - puede ser configurada mediante variable de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-recetas-yt1b.onrender.com/api/recetas';

// Tipo personalizado para errores con status
interface ApiError extends Error {
  status?: number;
}

// Tipos para las respuestas de la API
export interface RecetaResponse {
  _id?: string;
  id?: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string | Array<{ url: string; public_id: string; tipo: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecetaCreateResponse extends RecetaResponse {
  _id: string;
  id: string;
}

export interface DeleteResponse {
  message: string;
}

/**
 * Crea una nueva receta en el backend
 * @param {FormData} formData - Los datos del formulario incluyendo nombre, descripcion, ingredientes e imágenes
 * @returns {Promise<Object>} - La receta creada
 * @throws {ApiError} - Si hay un error al crear la receta
 */
export const createRecipe = async (formData: FormData): Promise<RecetaCreateResponse> => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      // Leer el texto de la respuesta primero
      const responseText = await res.text();
      let errorMessage = `Error al crear la receta (${res.status})`;

      // Intentar parsear como JSON si es posible
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no es JSON, usar el texto directamente si no está vacío
        if (responseText.trim()) {
          errorMessage = responseText;
        }
      }

      // Crear un error con el mensaje apropiado
      const error: ApiError = new Error(errorMessage);
      error.status = res.status;
      throw error;
    }

    // Si la respuesta es exitosa, parsear los datos
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error createRecipe:', error);
    throw error;
  }
};

/**
 * Obtiene todas las recetas del backend
 * @returns {Promise<Array>} - Array de recetas
 * @throws {Error} - Si hay un error al obtener las recetas
 */
export const getRecipes = async (): Promise<RecetaResponse[]> => {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Error al obtener recetas (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error getRecipes:', error);
    throw error;
  }
};

/**
 * Obtiene una receta por su ID
 * @param {string} id - ID de la receta
 * @returns {Promise<Object>} - La receta encontrada
 * @throws {Error} - Si hay un error al obtener la receta
 */
export const getRecipeById = async (id: string): Promise<RecetaResponse> => {
  try {
    const res = await fetch(`${API_URL}/${id}`);

    if (!res.ok) {
      throw new Error(`Error al obtener la receta (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error getRecipeById:', error);
    throw error;
  }
};

/**
 * Actualiza una receta existente
 * @param {string} id - ID de la receta a actualizar
 * @param {FormData} formData - Los datos actualizados del formulario
 * @returns {Promise<Object>} - La receta actualizada
 * @throws {ApiError} - Si hay un error al actualizar la receta
 */
export const updateRecipe = async (id: string, formData: FormData): Promise<RecetaResponse> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      const responseText = await res.text();
      let errorMessage = `Error al actualizar receta (${res.status})`;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (responseText.trim()) {
          errorMessage = responseText;
        }
      }

      const error: ApiError = new Error(errorMessage);
      error.status = res.status;
      throw error;
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error updateRecipe:', error);
    throw error;
  }
};

/**
 * Elimina una receta
 * @param {string} id - ID de la receta a eliminar
 * @returns {Promise<Object>} - Mensaje de confirmación
 * @throws {Error} - Si hay un error al eliminar la receta
 */
export const deleteRecipe = async (id: string): Promise<DeleteResponse> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Error al eliminar receta (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error deleteRecipe:', error);
    throw error;
  }
};

