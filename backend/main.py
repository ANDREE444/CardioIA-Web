import joblib
import json
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Cargar los 3 artefactos del modelo ---
try:
    model = joblib.load('cardio_model.pkl')
    scaler = joblib.load('cardio_scaler.pkl')
    with open('cardio_columns.json', 'r') as f:
        train_columns = json.load(f)
    print("--- Backend: Modelo, scaler y columnas cargados exitosamente. ---")
except Exception as e:
    print(f"--- !!! ERROR CRÍTICO AL CARGAR ARCHIVOS !!! ---")
    print(f"Asegúrate de que .pkl y .json estén en la misma carpeta que main.py.")
    print(f"Error: {e}")
    model, scaler, train_columns = None, None, None


# --- 2. Definir los Modelos de Datos (Contrato de API) ---
class HeartData(BaseModel):
    edad: int
    sexo: int
    colesterol: int
    presion_arterial: int
    frecuencia_cardiaca: int
    fumador: int
    consumo_alcohol: int
    horas_ejercicio: int
    historial_familiar: int
    diabetes: int
    obesidad: int
    nivel_estres: int
    nivel_azucar: int
    angina_inducida_ejercicio: int
    tipo_dolor_pecho: int


class PredictionResponse(BaseModel):
    probabilidad: float
    nivel_riesgo: str
    factores_influyentes: list[str]


# --- 3. Inicializar la App de FastAPI ---
app = FastAPI(title="CardioIA API")

# --- 4. Configurar CORS (Para permitir React) ---
origins = ["*"]  # Permite todas las conexiones (para desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 5. La Función de Pre-procesamiento (VERSIÓN CORREGIDA) ---
def preprocess_data(data: HeartData) -> pd.DataFrame:
    """Convierte el JSON de entrada en el DataFrame que el modelo espera."""

    # Mapeo de valores (deben coincidir con tu script de entrenamiento)
    gender_map = {1: 'Male', 0: 'Female'}
    smoking_map = {1: 'Current', 0: 'Never'}
    alcohol_map = {1: 'Heavy', 0: 'None'}
    family_history_map = {1: 'Yes', 0: 'No'}
    diabetes_map = {1: 'Yes', 0: 'No'}  # <-- Esta era la CORRECCIÓN #1
    obesity_map = {1: 'Yes', 0: 'No'}
    angina_map = {1: 'Yes', 0: 'No'}
    chest_pain_map = {0: 'Typical Angina', 1: 'Atypical Angina', 2: 'Non-anginal Pain', 3: 'Asymptomatic'}

    raw_data = {
        'Age': data.edad,
        'Gender': gender_map.get(data.sexo),
        'Cholesterol': data.colesterol,
        'Blood Pressure': data.presion_arterial,
        'Heart Rate': data.frecuencia_cardiaca,
        'Smoking': smoking_map.get(data.fumador),
        'Alcohol Intake': alcohol_map.get(data.consumo_alcohol),
        'Exercise Hours': str(data.horas_ejercicio),  # <-- Esta era la CORRECCIÓN #2
        'Family History': family_history_map.get(data.historial_familiar),
        'Diabetes': diabetes_map.get(data.diabetes),
        'Obesity': obesity_map.get(data.obesidad),
        'Stress Level': str(data.nivel_estres),  # <-- Esta era la CORRECCIÓN #3
        'Blood Sugar': data.nivel_azucar,
        'Exercise Induced Angina': angina_map.get(data.angina_inducida_ejercicio),
        'Chest Pain Type': chest_pain_map.get(data.tipo_dolor_pecho)
    }

    df = pd.DataFrame([raw_data])

    # Aplicar One-Hot Encoding (ahora no fallará)
    categorical_cols = ['Gender', 'Smoking', 'Alcohol Intake', 'Exercise Hours', 'Family History', 'Diabetes',
                        'Obesity', 'Stress Level', 'Exercise Induced Angina', 'Chest Pain Type']
    df_processed = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    # Re-indexar para que coincida 100% con las columnas de entrenamiento
    df_reindexed = df_processed.reindex(columns=train_columns, fill_value=0)

    # Escalar los datos numéricos
    numerical_cols = ['Age', 'Cholesterol', 'Blood Pressure', 'Heart Rate', 'Blood Sugar']
    df_reindexed[numerical_cols] = scaler.transform(df_reindexed[numerical_cols])

    return df_reindexed


# --- 6. El Endpoint de Predicción ---
@app.post("/api/predict", response_model=PredictionResponse)
async def predict_heart_disease(data: HeartData):
    if not all([model, scaler, train_columns]):
        print("--- ERROR 500: El modelo no se cargó. Revisar inicio del log. ---")
        return {"error": "Error interno del servidor: Modelo no cargado."}

    try:
        processed_df = preprocess_data(data)

        probabilidad = model.predict_proba(processed_df)[0][1]  # Probabilidad de "1"
        prob_porcentaje = round(probabilidad * 100, 2)

        if prob_porcentaje >= 65:
            nivel = "Alto"
        elif prob_porcentaje >= 35:
            nivel = "Moderado"
        else:
            nivel = "Bajo"

        # TODO: Implementar lógica de factores influyentes
        factores = ["Análisis de factores aún no implementado."]

        return {
            "probabilidad": prob_porcentaje,
            "nivel_riesgo": nivel,
            "factores_influyentes": factores
        }
    except Exception as e:
        print(f"--- ERROR 500 DURANTE LA PREDICCIÓN ---")
        print(f"Error: {e}")
        return {"error": f"Error al procesar la predicción: {e}"}


# --- 7. Endpoint Raíz (para verificar que funciona) ---
@app.get("/")
def read_root():
    return {"message": "CardioIA Backend API está funcionando."}