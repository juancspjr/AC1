import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './hooks/useProject';
import { LogProvider } from './context/LogContext';
import ProjectTypeSelector from './components/project/ProjectTypeSelector';
import Phase1 from './pages/Phase1';
import Phase2 from './pages/Phase2';
import Phase3 from './pages/Phase3';
import Phase4 from './pages/Phase4'; // ✅ Agregado Phase4
import LogPanel from './components/ui/LogPanel';
import './styles/globals.css';

function App() {
  return (
    <LogProvider>
      <ProjectProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Header Global */}
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      🎬 Generador Narrativo con IA
                    </h1>
                    <p className="text-sm text-gray-600">
                      Crea historias virales paso a paso con inteligencia artificial
                    </p>
                  </div>
                  
                  {/* Indicador de fases */}
                  <nav className="hidden md:flex space-x-1">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <span className="text-xs text-gray-600">Idea</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-gray-300"></div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <span className="text-xs text-gray-600">Estrategia</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-gray-300"></div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <span className="text-xs text-gray-600">Personajes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-gray-300"></div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <span className="text-xs text-gray-600">Estructura</span>
                    </div>
                  </nav>
                </div>
              </div>
            </header>

            {/* Contenido Principal */}
            <main className="py-8">
              <Routes>
                <Route path="/" element={<ProjectTypeSelector />} />
                <Route path="/phase-1" element={<Phase1 />} />
                <Route path="/phase-2" element={<Phase2 />} />
                <Route path="/phase-3" element={<Phase3 />} />
                <Route path="/phase-4" element={<Phase4 />} /> {/* ✅ Ruta Phase4 agregada */}
                <Route path="*" element={
                  <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h2>
                    <p className="text-gray-600">La ruta solicitada no existe.</p>
                  </div>
                } />
              </Routes>
            </main>

            {/* Panel de Logs Global */}
            <LogPanel />
          </div>
        </Router>
      </ProjectProvider>
    </LogProvider>
  );
}

export default App;