import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importa tus páginas
import Evaluation from './pages/Evaluation';
import Results from './pages/Results'; // <-- 1. IMPORTA LA NUEVA PÁGINA

// Importa tus componentes de layout
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Evaluation />} />
          <Route path="/resultado" element={<Results />} /> {/* <-- 2. AÑADE LA RUTA */}
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;