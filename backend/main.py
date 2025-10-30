import joblib
import json
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Cargar modelo, scaler y columnas ---
try:
    model = joblib.load('cardio_model.pkl')
    scaler = joblib.load('cardio_scaler.pkl')
    with open('cardio_columns.json', 'r') as f:
        train_columns = json.load(f)
    print("--- ✅ Backend: Modelo, scaler y columnas cargados exitosamente. ---")
except Exception as e:
    print("--- ❌ ERROR CRÍTICO AL CARGAR ARCHIVOS ---")
    print("Asegúrate de que .pkl y .json estén en la misma carpeta que main.py.")
    print("Error:", e)
    model, scaler, train_columns = None, None, None


# --- 2. Modelos de datos ---
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


# --- 3. Inicializar FastAPI ---
app = FastAPI(title="CardioIA API")

# --- 4. CORS ---
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 5. Preprocesamiento ---
def preprocess_data(data: HeartData) -> pd.DataFrame:
    gender_map = {1: 'Male', 0: 'Female'}
    smoking_map = {1: 'Current', 0: 'Never'}
    alcohol_map = {1: 'Heavy', 0: 'None'}
    family_history_map = {1: 'Yes', 0: 'No'}
    diabetes_map = {1: 'Yes', 0: 'No'}
    obesity_map = {1: 'Yes', 0: 'No'}
    angina_map = {1: 'Yes', 0: 'No'}
    chest_pain_map = {
        0: 'Typical Angina',
        1: 'Atypical Angina',
        2: 'Non-anginal Pain',
        3: 'Asymptomatic'
    }

    raw_data = {
        'Age': data.edad,
        'Gender': gender_map.get(data.sexo),
        'Cholesterol': data.colesterol,
        'Blood Pressure': data.presion_arterial,
        'Heart Rate': data.frecuencia_cardiaca,
        'Smoking': smoking_map.get(data.fumador),
        'Alcohol Intake': alcohol_map.get(data.consumo_alcohol),
        'Exercise Hours': str(data.horas_ejercicio),
        'Family History': family_history_map.get(data.historial_familiar),
        'Diabetes': diabetes_map.get(data.diabetes),
        'Obesity': obesity_map.get(data.obesidad),
        'Stress Level': str(data.nivel_estres),
        'Blood Sugar': data.nivel_azucar,
        'Exercise Induced Angina': angina_map.get(data.angina_inducida_ejercicio),
        'Chest Pain Type': chest_pain_map.get(data.tipo_dolor_pecho)
    }

    df = pd.DataFrame([raw_data])

    categorical_cols = [
        'Gender', 'Smoking', 'Alcohol Intake', 'Exercise Hours',
        'Family History', 'Diabetes', 'Obesity', 'Stress Level',
        'Exercise Induced Angina', 'Chest Pain Type'
    ]

    df_processed = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
    df_reindexed = df_processed.reindex(columns=train_columns, fill_value=0)

    # Escalar columnas numéricas
    numerical_cols = ['Age', 'Cholesterol', 'Blood Pressure', 'Heart Rate', 'Blood Sugar']
    df_reindexed[numerical_cols] = scaler.transform(df_reindexed[numerical_cols])

    return df_reindexed


# --- 6. Endpoint de predicción ---
@app.post("/predict", response_model=PredictionResponse)
async def predict_heart_disease(data: HeartData):
    if not all([model, scaler, train_columns]):
        print("--- ❌ ERROR 500: El modelo no se cargó. ---")
        return {"error": "Error interno del servidor: Modelo no cargado."}

    try:
        processed_df = preprocess_data(data)

        # 🧩 --- DEBUG: Mostrar detalles del DataFrame ---
        print("\n🔍 ====== DEPURACIÓN DEL MODELO ======")
        print("📋 Columnas recibidas por el modelo:")
        print(list(processed_df.columns))
        print("\n📊 Primeras filas (valores después de escalar):")
        print(processed_df.head())
        print("======================================\n")

        # --- Predicción ---
        probabilidad = model.predict_proba(processed_df)[0][1]
        prob_porcentaje = round(float(probabilidad) * 100, 2)

        if prob_porcentaje >= 65:
            nivel = "Alto"
        elif prob_porcentaje >= 35:
            nivel = "Moderado"
        else:
            nivel = "Bajo"

        factores = ["Análisis de factores aún no implementado."]

        resultado = {
            "probabilidad": prob_porcentaje,
            "nivel_riesgo": nivel,
            "riesgo": nivel,
            "factores_influyentes": factores
        }

        print("📤 Respuesta enviada al frontend:", resultado)
        return resultado

    except Exception as e:
        print("--- ❌ ERROR DURANTE LA PREDICCIÓN ---")
        print("Error:", e)
        return {"error": f"Error al procesar la predicción: {e}"}


# --- 7. Endpoint raíz ---
@app.get("/")
def read_root():
    return {"message": "CardioIA Backend API está funcionando correctamente 🚀"}
