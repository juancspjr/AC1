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
  const { improveIdea, isLoading } = useGeminiApi();
  const { addLog } = useLog();

  // Estados simplificados - sin funciones de guardar/descartar
  const [formData, setFormData] = useState({
    idea: '',
    improvedIdea: '',
    targetAudience: '',
    keyElements: ''
  });
  const [showImprovement, setShowImprovement] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // CORREGIR: useEffect sin loops infinitos
  useEffect(() => {
    if (!isInitialized) {
      setCurrentPhase(1);
      addLog('info', 'Iniciando Fase 1: La Idea Principal');
      setIsInitialized(true);
    }
  }, [isInitialized, setCurrentPhase, addLog]);

  // CORREGIR: Cargar datos una sola vez sin loops
  useEffect(() => {
    if (currentProject && currentProject.phase1Data && !isInitialized) {
      setFormData(currentProject.phase1Data);
      setShowImprovement(!!currentProject.phase1Data.improvedIdea);
      setIsInitialized(true);
    }
  }, [currentProject, isInitialized]);

  // SIMPLIFICAR: Manejo de cambios directo sin complejidad
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateWithAI = async () => {
    if (!formData.idea.trim()) {
      addLog('warning', 'No se puede generar sin una idea base');
      return;
    }

    setIsGenerating(true);
    addLog('info', 'Iniciando mejora de idea con Gemini...');

    try {
      // Prompt simplificado y claro
      const enhancedPrompt = `Como experto en narrativa, analiza y mejora esta idea:

IDEA ORIGINAL: "${formData.idea}"

Responde EXACTAMENTE en este formato:

IDEA_MEJORADA: [Una versión mejorada y más específica de la idea en máximo 80 palabras]

PUBLICO_OBJETIVO: [Define específicamente para qué audiencia - edad, intereses, demografía]

ELEMENTOS_CLAVE: [Lista 5-7 elementos narrativos separados por comas: temas, conflictos, símbolos]`;

      const result = await improveIdea(enhancedPrompt, {
        temperature: 0.8,
        maxOutputTokens: 800,
        disableThinking: true
      });

      // Extraer información usando regex mejorado
      const improvedIdeaMatch = result.improvedIdea.match(/IDEA_MEJORADA:\s*(.*?)(?=\n(?:PUBLICO_OBJETIVO:|$))/s);
      const audienceMatch = result.improvedIdea.match(/PUBLICO_OBJETIVO:\s*(.*?)(?=\n(?:ELEMENTOS_CLAVE:|$))/s);
      const elementsMatch = result.improvedIdea.match(/ELEMENTOS_CLAVE:\s*(.*?)$/s);

      const updatedData = {
        improvedIdea: improvedIdeaMatch ? improvedIdeaMatch[1].trim() : result.improvedIdea.substring(0, 200),
        targetAudience: audienceMatch ? audienceMatch[1].trim() : formData.targetAudience || 'Audiencia general',
        keyElements: elementsMatch ? elementsMatch[1].trim() : formData.keyElements || 'drama, desarrollo, conflicto'
      };

      setFormData(prev => ({
        ...prev,
        ...updatedData
      }));

      setShowImprovement(true);
      addLog('success', 'Idea mejorada exitosamente');

    } catch (err) {
      addLog('error', 'Error al mejorar idea con IA', err.message);
      setFormData(prev => ({
        ...prev,
        improvedIdea: `Error: ${err.message}. Verifica tu configuración.`
      }));
      setShowImprovement(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnother = async () => {
    if (!formData.idea.trim()) return;

    setIsGenerating(true);
    addLog('info', 'Generando versión alternativa...');

    try {
      const alternativePrompt = `Reinterpreta creativamente esta idea con un enfoque diferente:

"${formData.idea}"

Responde en el mismo formato que antes:

IDEA_MEJORADA: [Nueva interpretación creativa con enfoque diferente]
PUBLICO_OBJETIVO: [Audiencia específica para esta nueva versión]
ELEMENTOS_CLAVE: [Nuevos elementos narrativos que complementen esta versión]`;

      const result = await improveIdea(alternativePrompt, {
        temperature: 1.1,
        maxOutputTokens: 800,
        disableThinking: true
      });

      // Misma extracción que antes
      const improvedIdeaMatch = result.improvedIdea.match(/IDEA_MEJORADA:\s*(.*?)(?=\n(?:PUBLICO_OBJETIVO:|$))/s);
      const audienceMatch = result.improvedIdea.match(/PUBLICO_OBJETIVO:\s*(.*?)(?=\n(?:ELEMENTOS_CLAVE:|$))/s);
      const elementsMatch = result.improvedIdea.match(/ELEMENTOS_CLAVE:\s*(.*?)$/s);

      const alternativeData = {
        improvedIdea: improvedIdeaMatch ? improvedIdeaMatch[1].trim() : result.improvedIdea.substring(0, 200),
        targetAudience: audienceMatch ? audienceMatch[1].trim() : 'Audiencia alternativa',
        keyElements: elementsMatch ? elementsMatch[1].trim() : 'elementos alternativos'
      };

      setFormData(prev => ({
        ...prev,
        ...alternativeData
      }));

      addLog('success', 'Versión alternativa generada exitosamente');

    } catch (err) {
      addLog('error', 'Error al generar versión alternativa', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImprovedIdea = () => {
    const newFormData = { ...formData, idea: formData.improvedIdea };
    setFormData(newFormData);
    setShowImprovement(false);
    addLog('info', 'Idea mejorada aplicada como idea principal');
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

  // Loading state durante inicialización
  if (!isInitialized) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Inicializando Fase 1...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fase 1: La Idea Principal</h1>
        <p className="text-lg text-gray-600">
          Comparte tu idea inicial. Gemini te ayudará a refinarla. ✏️ Todos los campos son editables siempre.
        </p>
      </div>

      {/* Formulario Principal */}
      <Card padding="xl">
        <div className="space-y-6">
          {/* Campo Principal: Tu Idea */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
              Tu Idea (requerido) - ✏️ Libre edición siempre
            </label>
            <TextArea
              value={formData.idea}
              onChange={e => handleInputChange('idea', e.target.value)}
              placeholder="Describe tu idea narrativa... Ej: Un grupo de hackers descubre que pueden alterar recuerdos digitales"
              rows={4}
              className="w-full"
              required
            />
          </div>

          {/* Botón Generar con IA */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="ai" 
              size="lg" 
              leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              onClick={handleGenerateWithAI}
              disabled={!formData.idea.trim() || isGenerating}
              loading={isGenerating}
            >
              {isGenerating ? 'Generando con Gemini...' : 'Mejorar con IA'}
            </Button>
            
            {showImprovement && (
              <Button 
                variant="secondary" 
                size="lg" 
                leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                onClick={handleGenerateAnother}
                disabled={isGenerating}
                loading={isGenerating}
              >
                {isGenerating ? 'Generando otra...' : 'Otra versión'}
              </Button>
            )}
          </div>

          {/* Idea Mejorada por IA */}
          {showImprovement && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <label className="block text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Versión Mejorada por Gemini - ✏️ Editable libremente
              </label>
              <TextArea
                value={formData.improvedIdea}
                onChange={e => handleInputChange('improvedIdea', e.target.value)}
                className="w-full border-0 resize-none bg-transparent focus:ring-2 focus:ring-purple-300"
                rows={4}
                placeholder="Idea mejorada aparecerá aquí... También puedes editarla libremente"
              />
              
              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  onClick={handleUseImprovedIdea}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Usar esta versión
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  onClick={handleGenerateAnother}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generando...' : 'Otra versión'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImprovement(false)}
                >
                  Cerrar sugerencia
                </Button>
              </div>
            </div>
          )}

          {/* Campos Editables SIEMPRE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Público Objetivo - ✏️ Libre edición
              </label>
              <TextArea
                value={formData.targetAudience}
                onChange={e => handleInputChange('targetAudience', e.target.value)}
                placeholder="Ej: Jóvenes de 18-25 años interesados en tecnología y ciencia ficción"
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Key className="w-5 h-5 mr-2 text-amber-500" />
                Elementos Clave - ✏️ Libre edición
              </label>
              <TextArea
                value={formData.keyElements}
                onChange={e => handleInputChange('keyElements', e.target.value)}
                placeholder="Ej: memoria, identidad, tecnología, traición, descubrimiento"
                rows={3}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Separados por comas. Editables libremente en cualquier momento.
              </p>
            </div>
          </div>

          {/* Indicadores de estado */}
          <Card padding="md" className="bg-gray-50">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${formData.idea.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={formData.idea.trim() ? 'text-green-700' : 'text-gray-500'}>
                  ✅ Idea: {formData.idea.trim() ? 'Completada' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${formData.targetAudience.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={formData.targetAudience.trim() ? 'text-green-700' : 'text-gray-500'}>
                  🎯 Audiencia: {formData.targetAudience.trim() ? 'Definida' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${formData.keyElements.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={formData.keyElements.trim() ? 'text-green-700' : 'text-gray-500'}>
                  🔑 Elementos: {formData.keyElements.trim() ? 'Definidos' : 'Pendientes'}
                </span>
              </div>
            </div>
          </Card>

          {/* Mensaje de editabilidad */}
          <Card padding="md" className="bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="font-semibold text-blue-800">✅ TODOS los campos son editables SIEMPRE</div>
                <div className="text-sm text-blue-600">
                  Puedes modificar cualquier campo en cualquier momento, incluso después de que la IA haya generado contenido.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Fase 1 de 4 - Definición de la Idea
        </div>
        
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