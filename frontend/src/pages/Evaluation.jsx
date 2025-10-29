import React, { useState } from 'react';
import { submitEvaluation } from '../services/api'; // Importamos nuestro mock
import { useNavigate } from 'react-router-dom'; // Para navegar a la pág de resultados
import './Evaluation.css';

function Evaluation() {
  const navigate = useNavigate(); // Hook para redirigir

  // --- Estados para los 15 campos del formulario (basado en el CSV) ---
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('1'); // 1: Male, 0: Female
  const [colesterol, setColesterol] = useState('');
  const [presion, setPresion] = useState('');
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState('');
  const [fumador, setFumador] = useState('1'); // 1: Current, 0: Never
  const [alcohol, setAlcohol] = useState('1'); // 1: Heavy, 0: None
  const [horasEjercicio, setHorasEjercicio] = useState('');
  const [historialFamiliar, setHistorialFamiliar] = useState('1'); // 1: Yes, 0: No
  const [diabetes, setDiabetes] = useState('1'); // 1: Yes, 0: No
  const [obesidad, setObesidad] = useState('1'); // 1: Yes, 0: No
  const [estres, setEstres] = useState('');
  const [azucar, setAzucar] = useState('');
  const [angina, setAngina] = useState('1'); // 1: Yes, 0: No
  const [tipoDolorPecho, setTipoDolorPecho] = useState('1'); // 0: Typical, 1: Atypical...

  // --- Estados para la UI ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Manejador del envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = {
      edad: Number(edad),
      sexo: Number(sexo),
      colesterol: Number(colesterol),
      presion_arterial: Number(presion),
      frecuencia_cardiaca: Number(frecuenciaCardiaca),
      fumador: Number(fumador),
      consumo_alcohol: Number(alcohol),
      horas_ejercicio: Number(horasEjercicio),
      historial_familiar: Number(historialFamiliar),
      diabetes: Number(diabetes),
      obesidad: Number(obesidad),
      nivel_estres: Number(estres),
      nivel_azucar: Number(azucar),
      angina_inducida_ejercicio: Number(angina),
      tipo_dolor_pecho: Number(tipoDolorPecho)
    };

    try {
      const resultado = await submitEvaluation(formData);

      // Guardamos el resultado en sessionStorage para pasarlo a la otra página
      sessionStorage.setItem('cardioResult', JSON.stringify(resultado));

      // Navegamos a la página de resultados
      navigate('/resultado');

    } catch (err) {
      setError("Hubo un error al procesar la evaluación. Intente de nuevo.");
      console.error(err);
      setIsLoading(false);
    }
  };

  // --- Renderizado del componente (JSX) ---
  return (
    <div className="page-container evaluation-container">
      <h2>Evaluación de Riesgo</h2>
      <p style={{textAlign: 'center', maxWidth: '700px', margin: '0 auto 2rem auto'}}>
        Ingresa los datos clínicos solicitados para la evaluación. Estos campos se basan en el dataset de entrenamiento del modelo.
      </p>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* --- Grupo 1 --- */}
            <div className="form-group">
              <label htmlFor="edad">Edad</label>
              <input type="number" id="edad" value={edad} onChange={(e) => setEdad(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="sexo">Sexo</label>
              <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="1">Masculino</option>
                <option value="0">Femenino</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipoDolorPecho">Tipo de Dolor de Pecho (cp)</label>
              <select id="tipoDolorPecho" value={tipoDolorPecho} onChange={(e) => setTipoDolorPecho(e.target.value)}>
                <option value="0">Angina Típica</option>
                <option value="1">Angina Atípica</option>
                <option value="2">Dolor No Anginoso</option>
                <option value="3">Asintomático</option>
              </select>
            </div>

            {/* --- Grupo 2 --- */}
            <div className="form-group">
              <label htmlFor="presion">Presión Arterial (reposo)</label>
              <input type="number" id="presion" value={presion} onChange={(e) => setPresion(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="colesterol">Colesterol Sérico (mg/dl)</label>
              <input type="number" id="colesterol" value={colesterol} onChange={(e) => setColesterol(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="azucar">Nivel de Azúcar (en ayunas)</label>
              <input type="number" id="azucar" value={azucar} onChange={(e) => setAzucar(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="frecuenciaCardiaca">Frecuencia Cardíaca Máx.</label>
              <input type="number" id="frecuenciaCardiaca" value={frecuenciaCardiaca} onChange={(e) => setFrecuenciaCardiaca(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="estres">Nivel de Estrés (1-10)</label>
              <input type="number" id="estres" value={estres} min="1" max="10" onChange={(e) => setEstres(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="horasEjercicio">Horas de Ejercicio (sem.)</label>
              <input type="number" id="horasEjercicio" value={horasEjercicio} onChange={(e) => setHorasEjercicio(e.target.value)} required />
            </div>

            {/* --- Grupo 3 --- */}
            <div className="form-group">
              <label htmlFor="fumador">¿Fumador?</label>
              <select id="fumador" value={fumador} onChange={(e) => setFumador(e.target.value)}>
                <option value="1">Sí (Actual)</option>
                <option value="0">No (Nunca)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="alcohol">Consumo de Alcohol</label>
              <select id="alcohol" value={alcohol} onChange={(e) => setAlcohol(e.target.value)}>
                <option value="1">Frecuente / Alto</option>
                <option value="0">Ocasional / Nulo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="historialFamiliar">Historial Familiar</label>
              <select id="historialFamiliar" value={historialFamiliar} onChange={(e) => setHistorialFamiliar(e.target.value)}>
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="diabetes">¿Diabetes?</label>
              <select id="diabetes" value={diabetes} onChange={(e) => setDiabetes(e.target.value)}>
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="obesidad">¿Obesidad?</label>
              <select id="obesidad" value={obesidad} onChange={(e) => setObesidad(e.target.value)}>
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="angina">Angina Inducida por Ejercicio</label>
              <select id="angina" value={angina} onChange={(e) => setAngina(e.target.value)}>
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>

          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-buttons">
            <button type="submit" className="btn btn-submit" disabled={isLoading}>
              {isLoading ? 'Calculando...' : 'Calcular Riesgo'}
            </button>
            <button type="reset" className="btn btn-clear" disabled={isLoading}>
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Evaluation;