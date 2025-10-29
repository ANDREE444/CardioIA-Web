import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <p>
        <strong>Importante:</strong> CardioIA es una herramienta preventiva y de concientización.
        Los resultados no constituyen un diagnóstico médico formal ni sustituyen
        la evaluación de un profesional de la salud.
      </p>
      <p>© {new Date().getFullYear()} CardioIA - Todos los derechos reservados.</p>
    </footer>
  );
}

export default Footer;