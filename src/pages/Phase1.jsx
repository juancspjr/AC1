import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Target, Key, ArrowRight, Wand2, RefreshCw, Edit3, Save, RotateCcw } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});
  
  useEffect(() => {
    setCurrentPhase(1);
    addLog('info', 'Iniciando Fase 1: La Idea Principal');
    
    // Cargar datos existentes si es continuación o serie
    if (currentProject?.phase1Data) {
      setFormData(currentProject.phase1Data);
      setOriginalData(currentProject.phase1Data);
      setShowImprovement(!!currentProject.phase1Data.improvedIdea);
      addLog('info', 'Datos existentes cargados para continuación de proyecto');
    }
  }, [currentProject, setCurrentPhase, addLog]);
  
  // ✅ FUNCIÓN CRÍTICA: Manejar cambios en TODOS los campos sin restricciones
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    if (!isEditing) {
      setIsEditing(true);
      addLog('info', `Editando campo: ${field}`);
    }
  };
  
  const handleSaveChanges = () => {
    setOriginalData(formData);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    addLog('success', 'Cambios guardados exitosamente');
  };
  
  const handleDiscardChanges = () => {
    setFormData(originalData);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    addLog('info', 'Cambios descartados, datos restaurados');
  };
  
  const handleGenerateWithAI = async () => {
    if (!formData.idea.trim()) {
      addLog('warning', 'No se puede generar sin una idea base');
      return;
    }
    
    setIsGenerating(true);
    addLog('info', 'Iniciando mejora de idea con Gemini 2.5 Flash...');
    
    try {
      // Prompt mejorado que SIEMPRE completa todos los campos
      const enhancedPrompt = `Como experto en narrativa, analiza y mejora esta idea:

IDEA ORIGINAL: "${formData.idea}"

Devuelve EXACTAMENTE en este formato (completando TODOS los campos obligatoriamente):

<IDEA_MEJORADA>
[Una versión mejorada y más específica de la idea en máximo 80 palabras]
</IDEA_MEJORADA>

<PUBLICO_OBJETIVO>
[Define específicamente para qué tipo de audiencia está dirigida esta historia - edad, intereses, demografía]
</PUBLICO_OBJETIVO>

<ELEMENTOS_CLAVE>
[Lista 5-7 elementos narrativos separados por comas: temas, conflictos, símbolos, géneros]
</ELEMENTOS_CLAVE>`;
      
      const context = {
        projectType: currentProject?.type || 'narrativa',
        currentAudience: formData.targetAudience,
        currentElements: formData.keyElements
      };
      
      const result = await improveIdea(enhancedPrompt, {
        temperature: 0.8,
        maxOutputTokens: 800,
        disableThinking: true
      });
      
      // Extraer información usando regex para garantizar completitud
      const improvedIdeaMatch = result.improvedIdea.match(/<IDEA_MEJORADA>(.*?)<\/IDEA_MEJORADA>/s);
      const audienceMatch = result.improvedIdea.match(/<PUBLICO_OBJETIVO>(.*?)<\/PUBLICO_OBJETIVO>/s);
      const elementsMatch = result.improvedIdea.match(/<ELEMENTOS_CLAVE>(.*?)<\/ELEMENTOS_CLAVE>/s);
      
      const updatedData = {
        improvedIdea: improvedIdeaMatch ? improvedIdeaMatch[1].trim() : result.improvedIdea,
        targetAudience: audienceMatch ? audienceMatch[1].trim() : formData.targetAudience || 'Audiencia general interesada en narrativas creativas',
        keyElements: elementsMatch ? elementsMatch[1].trim() : formData.keyElements || 'drama, desarrollo de personajes, conflicto interno'
      };
      
      setFormData(prev => ({
        ...prev,
        ...updatedData
      }));
      
      setOriginalData({...formData, ...updatedData});
      setShowImprovement(true);
      addLog('success', 'Idea mejorada exitosamente con todos los campos completados');
      
    } catch (err) {
      addLog('error', 'Error al mejorar idea con IA', err.message);
      setFormData(prev => ({
        ...prev,
        improvedIdea: `Error: ${err.message}. Verifica tu configuración de Gemini.`
      }));
      setShowImprovement(true);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateAnother = async () => {
    if (!formData.idea.trim()) return;
    
    setIsGenerating(true);
    addLog('info', 'Generando versión alternativa con parámetros diferentes...');
    
    try {
      // Usar parámetros diferentes para generar variación
      const alternativePrompt = `Reinterpreta creativamente esta idea con un enfoque diferente:

"${formData.idea}"

Crea una versión completamente nueva en este formato:

<IDEA_MEJORADA>
[Nueva interpretación creativa de la idea con enfoque diferente]
</IDEA_MEJORADA>

<PUBLICO_OBJETIVO>
[Audiencia específica para esta nueva versión]
</PUBLICO_OBJETIVO>

<ELEMENTOS_CLAVE>
[Nuevos elementos narrativos que complementen esta versión]
</ELEMENTOS_CLAVE>`;

      const result = await improveIdea(alternativePrompt, {
        temperature: 1.1, // Más creatividad
        maxOutputTokens: 800,
        disableThinking: false // Permitir thinking para más creatividad
      });
      
      // Extraer información de la nueva versión
      const improvedIdeaMatch = result.improvedIdea.match(/<IDEA_MEJORADA>(.*?)<\/IDEA_MEJORADA>/s);
      const audienceMatch = result.improvedIdea.match(/<PUBLICO_OBJETIVO>(.*?)<\/PUBLICO_OBJETIVO>/s);
      const elementsMatch = result.improvedIdea.match(/<ELEMENTOS_CLAVE>(.*?)<\/ELEMENTOS_CLAVE>/s);
      
      const alternativeData = {
        improvedIdea: improvedIdeaMatch ? improvedIdeaMatch[1].trim() : result.improvedIdea,
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
    setFormData(prev => ({ ...prev, idea: prev.improvedIdea }));
    setShowImprovement(false);
    setOriginalData(formData);
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
      usedAI: showImprovement,
      editedManually: isEditing || hasUnsavedChanges
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
          Comparte tu idea inicial. Gemini 2.5 Flash te ayudará a refinarla. <strong>✏️ Todos los campos son editables siempre</strong>.
        </p>
      </div>
      
      {/* Formulario Principal */}
      <Card padding="lg" className="space-y-8">
        {/* Botones de control si hay cambios sin guardar */}
        {hasUnsavedChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Edit3 className="w-5 h-5 text-amber-500 mr-2" />
              <span className="text-amber-800 font-medium">Tienes cambios sin guardar</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveChanges}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Guardar cambios
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscardChanges}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Descartar
              </Button>
            </div>
          </div>
        )}
        
        {/* Campo Principal: Tu Idea - ✅ COMPLETAMENTE EDITABLE */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
              Tu Idea (requerido) - ✏️ <em>Libre edición siempre</em>
            </span>
          </label>
          <TextArea
            value={formData.idea}
            onChange={(e) => handleInputChange('idea', e.target.value)}
            placeholder="Describe tu idea narrativa... Ej: Un grupo de hackers descubre que pueden alterar recuerdos digitales"
            rows={4}
            className={`w-full transition-all duration-200 ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
            required
            disabled={isGenerating}  // ✅ Solo durante generación
          />
          
          {/* Botón Generar con IA */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="ai"
              size="lg"
              leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              onClick={handleGenerateWithAI}
              disabled={!formData.idea.trim() || isGenerating}
              loading={isGenerating}
            >
              {isGenerating ? 'Generando con Gemini 2.5...' : 'Mejorar con IA'}
            </Button>
            
            {showImprovement && (
              <Button
                variant="secondary"
                size="lg"
                leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                onClick={handleGenerateAnother}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generando otra...' : 'Otra versión'}
              </Button>
            )}
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
        
        {/* Idea Mejorada por IA - ✅ COMPLETAMENTE EDITABLE */}
        {showImprovement && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Versión Mejorada por Gemini 2.5 Flash - ✏️ <em>Editable libremente</em>
            </h3>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <TextArea
                value={formData.improvedIdea}
                onChange={(e) => handleInputChange('improvedIdea', e.target.value)}
                className={`w-full border-0 resize-none bg-transparent focus:ring-2 focus:ring-purple-300 ${isEditing ? 'ring-2 ring-purple-300' : ''}`}
                rows={4}
                placeholder="Idea mejorada aparecerá aquí... También puedes editarla libremente"
                disabled={isGenerating}  // ✅ SOLO durante generación - PROBLEMA SOLUCIONADO
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleUseImprovedIdea}
                leftIcon={<ArrowRight className="w-4 h-4" />}
              >
                Usar esta versión
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleGenerateAnother}
                disabled={isGenerating}
                leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              >
                {isGenerating ? 'Generando...' : 'Otra versión'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowImprovement(false)}
              >
                Cerrar sugerencia
              </Button>
            </div>
          </div>
        )}
        
        {/* Campos Editables SIEMPRE - ✅ SIN RESTRICCIONES JAMÁS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              <span className="flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-500" />
                  Público Objetivo - ✏️ <em>Libre edición</em>
                </span>
              </span>
            </label>
            <TextArea
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Ej: Jóvenes de 18-25 años interesados en tecnología y ciencia ficción"
              rows={3}
              className={`w-full transition-all duration-200 ${isEditing ? 'ring-2 ring-emerald-300 border-emerald-300' : ''}`}
              disabled={isGenerating}  // ✅ SOLO durante generación - PROBLEMA SOLUCIONADO
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              <span className="flex items-center justify-between">
                <span className="flex items-center">
                  <Key className="w-4 h-4 mr-2 text-amber-500" />
                  Elementos Clave - ✏️ <em>Libre edición</em>
                </span>
              </span>
            </label>
            <TextArea
              value={formData.keyElements}
              onChange={(e) => handleInputChange('keyElements', e.target.value)}
              placeholder="Ej: memoria, identidad, tecnología, traición, descubrimiento"
              rows={3}
              className={`w-full transition-all duration-200 ${isEditing ? 'ring-2 ring-amber-300 border-amber-300' : ''}`}
              disabled={isGenerating}  // ✅ SOLO durante generación - PROBLEMA SOLUCIONADO
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Separados por comas. Editables libremente en cualquier momento.
            </p>
          </div>
        </div>
        
        {/* Indicadores de estado */}
        <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${formData.idea.trim() ? 'text-green-600' : 'text-gray-400'}`}>
              ✅ Idea: {formData.idea.trim() ? 'Completada' : 'Pendiente'}
            </span>
            <span className={`flex items-center ${formData.targetAudience.trim() ? 'text-green-600' : 'text-gray-400'}`}>
              🎯 Audiencia: {formData.targetAudience.trim() ? 'Definida' : 'Pendiente'}
            </span>
            <span className={`flex items-center ${formData.keyElements.trim() ? 'text-green-600' : 'text-gray-400'}`}>
              🔑 Elementos: {formData.keyElements.trim() ? 'Definidos' : 'Pendientes'}
            </span>
          </div>
          
          {hasUnsavedChanges && (
            <span className="text-amber-600 font-medium animate-pulse">
              ⚠️ Cambios sin guardar
            </span>
          )}
        </div>
        
        {/* Mensaje de editabilidad SIEMPRE visible */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Edit3 className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <span className="text-blue-800 font-medium">✅ TODOS los campos son editables SIEMPRE</span>
              <p className="text-blue-600 text-sm mt-1">
                Puedes modificar cualquier campo en cualquier momento, incluso después de que la IA haya generado contenido.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Navegación */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {isEditing && "💡 Editando - Todos los campos responden a tus cambios"}
        </div>
        
        <div className="flex space-x-3">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleSaveChanges}
              leftIcon={<Save className="w-5 h-5" />}
            >
              Guardar cambios
            </Button>
          )}
          
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
    </div>
  );
};

export default Phase1;