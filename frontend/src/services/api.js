import axios from 'axios';

// La URL donde tu API de FastAPI está corriendo
const API_URL = 'http://localhost:8000/predict';  // Remove /api

/**
 * Llama a la API de FastAPI real para la predicción.
 * @param {object} formData Los datos del formulario del paciente
 * @returns {Promise<object>} Una promesa que resuelve con la respuesta de la API.
 */
export const submitEvaluation = async (formData) => {
  console.log("Datos enviados a la API de FastAPI:", formData);

  try {
    // Usamos axios para hacer la petición POST
    const response = await axios.post(API_URL, formData);

    console.log("Respuesta recibida de FastAPI:", response.data);
    return response.data; // Devuelve el JSON de la API

  } catch (error) {
    console.error("Error al contactar la API de FastAPI:", error);

    // Manejo de errores para que el usuario sepa qué pasó
    if (error.response) {
      // El servidor respondió con un error (ej. 422 Validación)
      console.error("Datos del error:", error.response.data);
      throw new Error(`Error del servidor: ${error.response.status}`);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta (¡Backend no está corriendo!)
      console.error("No se recibió respuesta. ¿El backend (FastAPI) está caído?");
      throw new Error("No se pudo conectar al servidor. Revisa que el backend esté corriendo.");
    } else {
      // Otro error
      throw new Error(`Error: ${error.message}`);
    }
  }
};