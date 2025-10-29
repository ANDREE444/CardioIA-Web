
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import "./Results.css";

function Results() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('cardioResult');
    if (data) {
      const parsedData = JSON.parse(data);

      // Normalizar datos: si viene 'nivel_riesgo' convertirlo a 'riesgo'
      if (parsedData.nivel_riesgo && !parsedData.riesgo) {
        parsedData.riesgo = parsedData.nivel_riesgo;
      }

      setResultado(parsedData);
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!resultado) {
    return <div className="page-container">Cargando resultados...</div>;
  }

  // Validación adicional
  if (!resultado.riesgo || !resultado.probabilidad) {
    console.error('Datos incompletos en resultado:', resultado);
    return <div className="page-container">Error: Datos incompletos. Por favor, realice la evaluación nuevamente.</div>;
  }

  const riesgoAlto = parseFloat(resultado.probabilidad);
  const riesgoBajo = 100 - riesgoAlto;

  const chartData = [
    { name: 'Riesgo Alto', value: riesgoAlto },
    { name: 'Riesgo Bajo', value: riesgoBajo }
  ];

  const COLORS = ['#8B0000', '#4CAF50'];

  return (
    <div className="page-container results-container">
      <h2>Resultados de la Evaluación</h2>

      <div className="result-summary">
        <div className={`risk-badge ${resultado.riesgo.toLowerCase()}`}>
          Riesgo: {resultado.riesgo}
        </div>
        <p className="probability">
          Probabilidad de riesgo cardiovascular: <strong>{resultado.probabilidad}%</strong>
        </p>
      </div>

      <div className="chart-container">
        <h3>Distribución de Riesgo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {resultado.recomendaciones && (
        <div className="recommendations">
          <h3>Recomendaciones</h3>
          <ul>
            {resultado.recomendaciones.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-buttons">
        <button
          className="btn btn-submit"
          onClick={() => navigate('/')}
        >
          Nueva Evaluación
        </button>
      </div>
    </div>
  );
}

export default Results;