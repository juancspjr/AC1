import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Target, Key, ArrowRight, Wand2, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import Input from '../components/ui/Input';
import { useProject } from '../hooks/useProject';
import { useGeminiApi } from '../hooks/useGeminiApi';
import { useLog } from '../context/LogContext';
import { useNavigate } from 'react-router-dom';

const Phase1 = () => {
  const navigate = useNavigate();
  const { currentProject, updatePhase1, setCurrentPhase } = useProject();
  const { improveIdea, suggestElements, isLoading, error } = useGeminiApi();
  const { addLog } = useLog();
  
  const [formData, setFormData] = useState({
    idea: '',
    improvedIdea: '',
    targetAudience: '',
    keyElements: ''
  });
  
  const [showImprovement, setShowImprovement] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    setCurrentPhase(1);
    addLog('info', 'Iniciando Fase 1: La Idea Principal');
    
    // Cargar datos existentes si es continuación o serie
    if (currentProject?.phase1Data) {
      setFormData(currentProject.phase1Data);
      setShowImprovement(!!currentProject.phase1Data.improvedIdea);
      addLog('info', 'Datos existentes cargados para continuación de proyecto');
    }
  }, [currentProject, setCurrentPhase, addLog]);
  
  const handleGenerateWithAI = async () => {
    if (!formData.idea.trim()) {
      addLog('warning', 'No se puede generar sin una idea base');
      return;
    }
    
    setIsGenerating(true);
    addLog('info', 'Iniciando mejora de idea con Gemini Flash...');
    
    try {
      const context = {
        projectType: currentProject?.type,
        targetAudience: formData.targetAudience,
        keyElements: formData.keyElements,
        parentContext: currentProject?.parentContext
      };
      
      const result = await improveIdea(formData.idea, context);
      
      setFormData(prev => ({
        ...prev,
        improvedIdea: result.improvedIdea
      }));
      
      setShowImprovement(true);
      addLog('success', 'Idea mejorada exitosamente con Gemini');
      
      // Opcionalmente sugerir elementos adicionales
      if (!formData.keyElements.trim()) {
        try {
          addLog('info', 'Generando sugerencias de elementos narrativos...');
          const suggestions = await suggestElements(result.improvedIdea, 'narrative');
          
          // Extraer elementos sugeridos de forma segura
          const lines = suggestions.split('\n');
          const filteredLines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed && (trimmed.includes('-') || trimmed.includes('•') || /^\d+\./.test(trimmed));
          });
          
          const extractedElements = filteredLines
            .map(line => line.replace(/^[-•\d\.\s]+/, '').trim())
            .filter(Boolean)
            .slice(0, 5)
            .join(', ');
            
          if (extractedElements) {
            setFormData(prev => ({
              ...prev,
              keyElements: extractedElements
            }));
            addLog('success', 'Elementos narrativos sugeridos automáticamente');
          }
        } catch (suggestionError) {
          addLog('warning', 'No se pudieron generar sugerencias adicionales');
        }
      }
      
    } catch (err) {
      addLog('error', 'Error al mejorar idea con IA', err.message);
      // Fallback con mensaje informativo
      setFormData(prev => ({
        ...prev,
        improvedIdea: `Error: ${err.message}. Verifica tu API Key de Gemini en el archivo .env`
      }));
      setShowImprovement(true);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleUseImprovedIdea = () => {
    setFormData(prev => ({ ...prev, idea: prev.improvedIdea }));
    setShowImprovement(false);
    addLog('info', 'Idea mejorada aplicada como idea principal');
  };
  
  const handleGenerateAnother = () => {
    addLog('info', 'Generando nueva versión de la idea...');
    handleGenerateWithAI();
  };
  
  const handleContinue = () => {
    if (!formData.idea.trim()) {
      addLog('warning', 'No se puede continuar sin una idea principal');
      return;
    }
    
    const phase1Data = {
      ...formData,
      timestamp: new Date().toISOString(),
      usedAI: showImprovement
    };
    
    updatePhase1(phase1Data);
    addLog('success', 'Fase 1 completada, avanzando a Fase 2');
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
          Comparte tu idea inicial. Gemini Flash te ayudará a refinarla y desarrollarla.
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
              leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              onClick={handleGenerateWithAI}
              disabled={!formData.idea.trim() || isGenerating}
              loading={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? 'Generando con Gemini Flash...' : 'Mejorar con IA'}
            </Button>
            
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {error}
              </div>
            )}
          </div>
        </div>
        
        {/* Idea Mejorada por IA */}
        {showImprovement && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Versión Mejorada por Gemini Flash
            </h3>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{formData.improvedIdea}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUseImprovedIdea}
              >
                Usar esta versión
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGenerateAnother}
                disabled={isGenerating}
                leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              >
                {isGenerating ? 'Generando...' : 'Generar otra versión'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowImprovement(false)}
              >
                Cerrar
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
            <p className="text-xs text-gray-500 mt-1">Separados por comas. Se auto-completan con IA si están vacíos.</p>
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