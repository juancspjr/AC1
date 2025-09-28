import React, { useState } from 'react';
import { Plus, Repeat, BookOpen, ArrowRight, Sparkles, Search, Database, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useLog } from '../../context/LogContext';

const ProjectTypeSelector = () => {
  const navigate = useNavigate();
  const { setProjectType, loadExistingProject } = useProject();
  const { addLog } = useLog();
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showProjectSearch, setShowProjectSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Proyectos simulados - En el futuro conectar a base de datos real
  const existingProjects = [
    {
      id: 'proj_001',
      title: 'La Fortaleza de la Persistencia',
      description: 'Un aprendizaje de la vida construyendo la fortaleza de persistencia',
      lastModified: '2025-09-28',
      phase: 'Fase 2',
      targetAudience: 'Jóvenes adultos interesados en crecimiento personal',
      keyElements: 'persistencia, crecimiento, desafíos, superación',
      type: 'narrativa_personal'
    },
    {
      id: 'proj_002', 
      title: 'Hackers de la Memoria',
      description: 'Un grupo de hackers descubre que pueden alterar recuerdos digitales',
      lastModified: '2025-09-27',
      phase: 'Fase 1',
      targetAudience: 'Fans de ciencia ficción y thriller tecnológico',
      keyElements: 'tecnología, memoria, identidad, ética, poder',
      type: 'ciencia_ficcion'
    },
    {
      id: 'proj_003',
      title: 'El Último Faro',
      description: 'Historia de un farero que protege secretos del mar',
      lastModified: '2025-09-26',
      phase: 'Fase 3',
      targetAudience: 'Lectores de narrativa contemporánea y misterio',
      keyElements: 'soledad, misterio, naturaleza, secretos, protección',
      type: 'misterio'
    }
  ];
  
  const projectTypes = [
    {
      id: 'new',
      title: 'Nuevo Proyecto',
      description: 'Comienza una historia completamente nueva desde cero',
      icon: Plus,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      features: ['Lienzo en blanco', 'Total libertad creativa', 'Sin restricciones']
    },
    {
      id: 'continuation',
      title: 'Continuar Proyecto',
      description: 'Retoma un proyecto existente donde lo dejaste',
      icon: Repeat,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      features: ['Mantiene el progreso', 'Edita fases previas', 'Optimiza tu trabajo'],
      searchEnabled: true
    },
    {
      id: 'series',
      title: 'Nueva Serie/Capítulo',
      description: 'Crea una continuación manteniendo personajes y coherencia',
      icon: BookOpen,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      features: ['Coherencia narrativa', 'Personajes persistentes', 'Evolución creativa'],
      badge: 'Avanzado'
    }
  ];
  
  // Función de búsqueda en tiempo real
  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    if (!query.trim()) {
      setFilteredProjects([]);
      setIsSearching(false);
      return;
    }
    
    // Simular delay de búsqueda en base de datos
    setTimeout(() => {
      const filtered = existingProjects.filter(project => 
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.keyElements.toLowerCase().includes(query.toLowerCase())
      );
      
      setFilteredProjects(filtered);
      setIsSearching(false);
      addLog('info', `Búsqueda completada: ${filtered.length} proyecto(s) encontrado(s)`);
    }, 300);
  };
  
  const handleSelectProject = (project) => {
    addLog('success', `Proyecto seleccionado: ${project.title}`);
    loadExistingProject(project);
    setProjectType('continuation');
    navigate('/phase-1');
  };
  
  const handleSelectType = (type) => {
    if (type === 'continuation') {
      setShowProjectSearch(true);
      addLog('info', 'Activando búsqueda de proyectos existentes');
      return;
    }
    
    setSelectedType(type);
    setProjectType(type);
    addLog('success', `Tipo de proyecto seleccionado: ${type}`);
    navigate('/phase-1');
  };
  
  if (showProjectSearch) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header de Búsqueda */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Buscar Proyecto Existente
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra tu proyecto para continuar donde lo dejaste
          </p>
        </div>
        
        {/* Campo de Búsqueda */}
        <Card padding="lg" className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                <span className="flex items-center">
                  <Search className="w-4 h-4 mr-2 text-emerald-500" />
                  Buscar en tus proyectos
                </span>
              </label>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Busca por título, descripción o elementos clave..."
                  className="w-full pl-10"
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Filtros rápidos */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium mr-2">Filtros rápidos:</span>
              <button 
                onClick={() => handleSearch('narrativa')}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
              >
                Narrativas
              </button>
              <button 
                onClick={() => handleSearch('ficción')}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
              >
                Ciencia Ficción
              </button>
              <button 
                onClick={() => handleSearch('misterio')}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
              >
                Misterio
              </button>
              <button 
                onClick={() => handleSearch('')}
                className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full hover:bg-gray-200 transition-colors"
              >
                ✕ Limpiar
              </button>
            </div>
          </div>
        </Card>
        
        {/* Resultados de Búsqueda */}
        {searchQuery && (
          <Card padding="lg" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-emerald-500" />
                Proyectos encontrados
              </h3>
              <span className="text-sm text-gray-500">
                {filteredProjects.length} resultado{filteredProjects.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No se encontraron proyectos</p>
                <p className="text-sm">Prueba con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleSelectProject(project)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{project.title}</h4>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded">
                          {project.phase}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {project.lastModified}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">🎯 Audiencia:</span>
                        <p className="text-gray-600 mt-1">{project.targetAudience}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">🔑 Elementos:</span>
                        <p className="text-gray-600 mt-1">{project.keyElements}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Continuar proyecto
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
        
        {/* Botón Volver */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setShowProjectSearch(false);
              setSearchQuery('');
              setFilteredProjects([]);
              addLog('info', 'Volviendo a selección de tipo de proyecto');
            }}
          >
            ← Volver a tipos de proyecto
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ¿Qué tipo de proyecto quieres crear?
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Selecciona el tipo de proyecto que mejor se adapte a tu visión creativa. 
          Cada opción está optimizada para diferentes flujos de trabajo.
        </p>
      </div>
      
      {/* Grid de Tipos de Proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {projectTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              hover
              className={`relative overflow-hidden transition-all duration-300 ${
                isSelected ? 'ring-2 ring-primary-500 shadow-lg scale-105' : ''
              }`}
            >
              {/* Badge */}
              {type.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {type.badge}
                  </span>
                </div>
              )}
              
              {/* Icon */}
              <div className={`bg-gradient-to-r ${type.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
              <p className="text-gray-600 mb-6">{type.description}</p>
              
              {/* Features */}
              <ul className="space-y-2 mb-8">
                {type.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.gradient} mr-3`} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* Special indicator for continuation */}
              {type.searchEnabled && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="text-sm text-emerald-800 font-medium">
                      Incluye búsqueda de proyectos
                    </span>
                  </div>
                </div>
              )}
              
              {/* Button */}
              <Button
                variant="primary"
                className="w-full"
                rightIcon={type.searchEnabled ? <Search className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                onClick={() => handleSelectType(type.id)}
              >
                {type.searchEnabled ? 'Buscar proyectos' : 'Seleccionar'}
              </Button>
            </Card>
          );
        })}
      </div>
      
      {/* Estadisticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{existingProjects.length}</div>
          <div className="text-sm text-gray-600">Proyectos guardados</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">
            {existingProjects.filter(p => p.phase !== 'Fase 1').length}
          </div>
          <div className="text-sm text-gray-600">En desarrollo</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(existingProjects.map(p => p.type)).size}
          </div>
          <div className="text-sm text-gray-600">Géneros explorados</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTypeSelector;