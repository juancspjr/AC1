import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './hooks/useProject';
import ProjectTypeSelector from './components/project/ProjectTypeSelector';
import Phase1 from './pages/Phase1';
import './styles/globals.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Header Global */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                    <span className="text-white text-xl">🎭</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Generador Narrativo</h1>
                    <p className="text-sm text-gray-500">Powered by AI + n8n</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Contenido Principal */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<ProjectTypeSelector />} />
              <Route path="/phase-1" element={<Phase1 />} />
              <Route path="/phase-2" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Fase 2: En Desarrollo</h2><p className="text-gray-600 mt-2">Esta fase se implementará próximamente</p></div>} />
              <Route path="/phase-3" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Fase 3: En Desarrollo</h2><p className="text-gray-600 mt-2">Esta fase se implementará próximamente</p></div>} />
              <Route path="/phase-4" element={<div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Fase 4: En Desarrollo</h2><p className="text-gray-600 mt-2">Esta fase se implementará próximamente</p></div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ProjectProvider>
  );
}

export default App;