import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Target, Key, ArrowRight, Wand2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import Input from '../components/ui/Input';
import { useProject } from '../hooks/useProject';
import { useN8nApi } from '../hooks/useN8nApi';
import { useNavigate } from 'react-router-dom';

const Phase1 = () => {
  const navigate = useNavigate();
  const { currentProject, updatePhase1, setCurrentPhase } = useProject();
  const { generateWithAI, isLoading } = useN8nApi();
  
  const [formData, setFormData] = useState({
    idea: '',
    improvedIdea: '',
    targetAudience: '',
    keyElements: ''
  });
  
  const [showImprovement, setShowImprovement] = useState(false);
  
  useEffect(() => {
    setCurrentPhase(1);
    
    // Cargar datos existentes si es continuación o serie
    if (currentProject?.phase1Data) {
      setFormData(currentProject.phase1Data);
      setShowImprovement(!!currentProject.phase1Data.improvedIdea);
    }
  }, [currentProject, setCurrentPhase]);
  
  const handleGenerateWithAI = async () => {
    if (!formData.idea.trim()) return;
    
    try {
      const result = await generateWithAI('phase1', {
        idea: formData.idea,
        projectType: currentProject?.type,
        parentContext: currentProject?.parentContext
      });
      
      setFormData(prev => ({
        ...prev,
        improvedIdea: result.improvedIdea || 'Versión mejorada de tu idea con mayor claridad narrativa y elementos estructurados.',
        targetAudience: result.suggestedAudience || prev.targetAudience,
        keyElements: result.suggestedElements || prev.keyElements
      }));
      
      setShowImprovement(true);
    } catch (error) {
      console.error('Error generating with AI:', error);
      // Fallback en caso de error
      setFormData(prev => ({
        ...prev,
        improvedIdea: 'Versión mejorada de tu idea con mayor claridad narrativa y elementos estructurados. (Modo offline)',
      }));
      setShowImprovement(true);
    }
  };
  
  const handleContinue = () => {
    if (!formData.idea.trim()) return;
    
    updatePhase1(formData);
    navigate('/phase-2');
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fase 1: La Idea Principal</h1>
        <p className="text-lg text-gray-600">
          Comparte tu idea inicial. La IA te ayudará a refinarla y desarrollarla.
        </p>
      </div>
      
      {/* Formulario Principal */}
      <Card padding="lg" className="space-y-8">
        {/* Campo Principal: Tu Idea */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
              Tu Idea (requerido)
            </span>
          </label>
          <TextArea
            value={formData.idea}
            onChange={(e) => setFormData(prev => ({ ...prev, idea: e.target.value }))}
            placeholder="Describe tu idea narrativa... Ej: Un grupo de hackers descubre que pueden alterar recuerdos digitales"
            rows={4}
            className="w-full"
            required
          />
          
          {/* Botón Generar con IA */}
          <div className="mt-4">
            <Button
              variant="ai"
              size="lg"
              leftIcon={<Wand2 className="w-5 h-5" />}
              onClick={handleGenerateWithAI}
              disabled={!formData.idea.trim() || isLoading}
              loading={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Generando con IA...' : 'Mejorar con IA'}
            </Button>
          </div>
        </div>
        
        {/* Idea Mejorada por IA */}
        {showImprovement && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Versión Mejorada por IA
            </h3>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-gray-800 leading-relaxed">{formData.improvedIdea}</p>
            </div>
            <div className="mt-4 flex space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, idea: prev.improvedIdea }))}
              >
                Usar esta versión
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGenerateWithAI}
              >
                Generar otra versión
              </Button>
            </div>
          </div>
        )}
        
        {/* Campos Opcionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              <span className="flex items-center">
                <Target className="w-4 h-4 mr-2 text-emerald-500" />
                Público Objetivo (opcional)
              </span>
            </label>
            <Input
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="Ej: Jóvenes de 18-25 años interesados en tecnología"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              <span className="flex items-center">
                <Key className="w-4 h-4 mr-2 text-amber-500" />
                Elementos Clave (opcional)
              </span>
            </label>
            <Input
              value={formData.keyElements}
              onChange={(e) => setFormData(prev => ({ ...prev, keyElements: e.target.value }))}
              placeholder="Ej: memoria, identidad, tecnología, traición"
            />
            <p className="text-xs text-gray-500 mt-1">Separados por comas</p>
          </div>
        </div>
      </Card>
      
      {/* Navegación */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleContinue}
          disabled={!formData.idea.trim()}
        >
          Continuar a Fase 2
        </Button>
      </div>
    </div>
  );
};

export default Phase1;