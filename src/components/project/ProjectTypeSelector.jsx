import React, { useState } from 'react';
import { Plus, Repeat, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';

const ProjectTypeSelector = () => {
  const navigate = useNavigate();
  const { setProjectType } = useProject();
  const [selectedType, setSelectedType] = useState(null);
  
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
      features: ['Mantén el progreso', 'Edita fases previas', 'Optimiza tu trabajo']
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
  
  const handleSelectType = (type) => {
    setSelectedType(type);
    setProjectType(type);
    navigate('/phase-1');
  };
  
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
              
              {/* Button */}
              <Button
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => handleSelectType(type.id)}
              >
                Seleccionar
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTypeSelector;