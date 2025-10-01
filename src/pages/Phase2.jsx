import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, Target, Palette, Video, FileText, Users, ArrowRight, ArrowLeft, 
  Wand2, RefreshCw, Sparkles, Check, AlertCircle, Brain, TrendingUp, 
  Eye, Volume2, Heart, Play
} from 'lucide-react';
import { useProject } from '../hooks/useProject';
import { useGeminiApi } from '../hooks/useGeminiApi';
import { useLog } from '../context/LogContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Configuración de niveles de energía
const ENERGY_LEVELS = [
  { level: 1, label: 'Contemplativo', description: 'Ritmo pausado y reflexivo', color: 'bg-blue-100 text-blue-800', icon: '🧘' },
  { level: 2, label: 'Sereno', description: 'Tranquilo con momentos de tensión', color: 'bg-cyan-100 text-cyan-800', icon: '🌊' },
  { level: 3, label: 'Moderado', description: 'Equilibrio entre calma y acción', color: 'bg-green-100 text-green-800', icon: '🌱' },
  { level: 4, label: 'Dinámico', description: 'Ritmo activo con variaciones', color: 'bg-lime-100 text-lime-800', icon: '⚡' },
  { level: 5, label: 'Equilibrado', description: 'Balance perfecto de energías', color: 'bg-yellow-100 text-yellow-800', icon: '⚖️' },
  { level: 6, label: 'Enérgico', description: 'Alto dinamismo y engagement', color: 'bg-orange-100 text-orange-800', icon: '🔥' },
  { level: 7, label: 'Intenso', description: 'Ritmo frenético y potente', color: 'bg-red-100 text-red-800', icon: '🚀' },
  { level: 8, label: 'Explosivo', description: 'Máxima intensidad narrativa', color: 'bg-pink-100 text-pink-800', icon: '💥' },
  { level: 9, label: 'Frenético', description: 'Velocidad extrema e impacto', color: 'bg-purple-100 text-purple-800', icon: '🌪️' },
  { level: 10, label: 'Apocalíptico', description: 'Intensidad absoluta e inmersiva', color: 'bg-black text-white', icon: '🌋' }
];

const OUTPUT_FORMATS = [
  { id: 'tiktok-reels', name: 'TikTok/Reels', icon: '📱', description: '15-60s verticales', category: 'social' },
  { id: 'youtube-short', name: 'YouTube Shorts', icon: '▶️', description: 'Hasta 60s verticales', category: 'social' },
  { id: 'instagram-story', name: 'Instagram Story', icon: '📸', description: 'Stories 15s cada una', category: 'social' },
  { id: 'youtube-video', name: 'YouTube Video', icon: '🎥', description: '3-15 minutos', category: 'video' },
  { id: 'podcast-episode', name: 'Podcast', icon: '🎧', description: 'Audio narrativo', category: 'audio' },
  { id: 'short-film', name: 'Cortometraje', icon: '🎬', description: '5-30 minutos', category: 'film' },
  { id: 'web-series', name: 'Serie Web', icon: '📺', description: 'Episodios múltiples', category: 'series' },
  { id: 'carousel', name: 'Carrusel', icon: '🎠', description: 'Slides narrativos', category: 'social' },
  { id: 'interactive-story', name: 'Historia Interactiva', icon: '🎯', description: 'Con decisiones', category: 'interactive' },
  { id: 'video-ad', name: 'Video Publicitario', icon: '📢', description: '30-90s comercial', category: 'commercial' }
];

const NARRATIVE_STYLES = [
  { id: 'drama', name: 'Drama', icon: '🎭', description: 'Conflictos emocionales profundos' },
  { id: 'comedy', name: 'Comedia', icon: '😂', description: 'Humor y situaciones divertidas' },
  { id: 'thriller', name: 'Thriller', icon: '😱', description: 'Suspenso y tensión constante' },
  { id: 'mystery', name: 'Misterio', icon: '🔍', description: 'Enigmas y revelaciones' },
  { id: 'action', name: 'Acción', icon: '💥', description: 'Movimiento y adrenalina' },
  { id: 'romance', name: 'Romance', icon: '💕', description: 'Relaciones y emociones íntimas' },
  { id: 'sci-fi', name: 'Ciencia Ficción', icon: '🚀', description: 'Tecnología y futurismo' },
  { id: 'fantasy', name: 'Fantasía', icon: '🧙', description: 'Mundos mágicos y sobrenaturales' },
  { id: 'horror', name: 'Horror', icon: '👻', description: 'Miedo y elementos terroríficos' },
  { id: 'documentary', name: 'Documental', icon: '📋', description: 'Narrativa real y educativa' }
];

const VISUAL_STYLES = [
  { id: 'cinematic', name: 'Cinematográfico', icon: '🎬', description: 'Estética de película' },
  { id: 'minimalist', name: 'Minimalista', icon: '⚪', description: 'Limpio y esencial' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', description: 'Neón y distopía' },
  { id: 'vintage', name: 'Vintage', icon: '📸', description: 'Nostálgico y retro' },
  { id: 'neon-noir', name: 'Neón Noir', icon: '🌆', description: 'Oscuro con neón' },
  { id: 'pop-art', name: 'Pop Art', icon: '🎨', description: 'Colores vibrantes' },
  { id: 'spider-verse', name: 'Spider-Verse', icon: '🕷️', description: 'Cómic animado' },
  { id: 'documentary', name: 'Documental', icon: '📹', description: 'Realista y natural' }
];

const STRUCTURES = [
  { id: 'three-act', name: 'Tres Actos', icon: '🏛️', description: 'Estructura clásica' },
  { id: 'hero-journey', name: 'Viaje del Héroe', icon: '⚔️', description: 'Aventura épica' },
  { id: 'non-linear', name: 'No Linear', icon: '🌀', description: 'Narrativa fragmentada' },
  { id: 'circular', name: 'Circular', icon: '🔄', description: 'Retorna al inicio' }
];

// Prompt simplificado
const generateEnhancedPrompt = (phase1Data, formData, mode) => {
  const energyInfo = ENERGY_LEVELS.find(e => e.level === formData.energyLevel) || ENERGY_LEVELS[4];
  
  return `Eres "Aristoteles AI", estratega narrativo viral.

CONTEXTO ACTUAL:
Idea: "${phase1Data.idea}"
Elementos: "${phase1Data.keyElements}"  
Audiencia: "${phase1Data.targetAudience}"
Energía: ${formData.energyLevel}/10 (${energyInfo.label})
CTA Base: "${formData.cta}"

MODO: ${mode.toUpperCase()}

INSTRUCCIONES:
Responde ÚNICAMENTE en JSON válido:

{
  "deliberation": "Razonamiento estratégico breve",
  "energyIntegration": "Cómo aplicar energía ${formData.energyLevel}",  
  "viralIntegration": "Elementos virales sutiles",
  "enhancedContext": {
    "improvedIdea": "Idea refinada potente (70% peso)",
    "improvedKeyElements": "Elementos clave refinados", 
    "improvedTargetAudience": "Audiencia detallada (70% peso)"
  },
  "selections": {
    "outputFormats": ["formato1", "formato2"],
    "narrativeStyles": ["estilo1", "estilo2"], 
    "visualStyles": ["visual1", "visual2"],
    "structures": ["estructura1"],
    "cta": "CTA optimizado emocional"
  }
}

CRÍTICO: Mejora SIGNIFICATIVAMENTE idea, elementos y audiencia. CTA debe ser emocional.`;
};

// Parser simplificado
const parseEnhancedStrategy = (response) => {
  try {
    // Limpiar respuesta
    const cleanResponse = response.trim();
    
    // Buscar JSON
    const patterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/i,
      /```\s*(\{[\s\S]*?\})\s*```/i,
      /(\{[\s\S]*\})/
    ];

    let extractedJson = '';
    for (const pattern of patterns) {
      const match = cleanResponse.match(pattern);
      if (match && match[1]) {
        extractedJson = match[1].trim();
        break;
      }
    }

    if (!extractedJson) {
      throw new Error('No se encontró JSON');
    }

    const parsed = JSON.parse(extractedJson);
    
    // Validar estructura básica
    if (!parsed.enhancedContext) {
      throw new Error('Estructura incompleta');
    }

    // Asegurar campos mínimos
    parsed.deliberation = parsed.deliberation || 'Estrategia generada';
    parsed.energyIntegration = parsed.energyIntegration || 'Integración aplicada';
    parsed.viralIntegration = parsed.viralIntegration || 'Elementos virales incluidos';
    
    parsed.enhancedContext.improvedIdea = parsed.enhancedContext.improvedIdea || parsed.enhancedContext.enhancedIdea || 'Idea mejorada';
    parsed.enhancedContext.improvedKeyElements = parsed.enhancedContext.improvedKeyElements || parsed.enhancedContext.enhancedKeyElements || 'Elementos refinados';
    parsed.enhancedContext.improvedTargetAudience = parsed.enhancedContext.improvedTargetAudience || parsed.enhancedContext.enhancedTargetAudience || 'Audiencia detallada';

    parsed.selections = parsed.selections || {
      outputFormats: [],
      narrativeStyles: [],
      visualStyles: [],
      structures: [],
      cta: 'CTA optimizado'
    };

    return {
      success: true,
      data: parsed
    };

  } catch (error) {
    // Fallback básico
    return {
      success: false,
      fallback: {
        deliberation: 'Estrategia básica aplicada',
        energyIntegration: 'Energía integrada',
        viralIntegration: 'Elementos virales aplicados',
        enhancedContext: {
          improvedIdea: 'Idea potenciada',
          improvedKeyElements: 'Elementos optimizados', 
          improvedTargetAudience: 'Audiencia refinada'
        },
        selections: {
          outputFormats: ['tiktok-reels'],
          narrativeStyles: ['drama'],
          visualStyles: ['cinematic'],
          structures: ['three-act'],
          cta: 'Descubre tu potencial'
        }
      }
    };
  }
};

const Phase2 = () => {
  const navigate = useNavigate();
  const { currentProject, updatePhase2, setCurrentPhase } = useProject();
  const { improveIdea, isLoading: isApiLoading } = useGeminiApi();
  const { addLog } = useLog();

  const [formData, setFormData] = useState({
    energyLevel: 5,
    outputFormats: [],
    narrativeStyles: [],
    visualStyles: [],
    structures: [],
    cta: ''
  });
  
  const [aiStrategy, setAiStrategy] = useState(null);
  const [hasManualChanges, setHasManualChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ INICIALIZACIÓN SIN BUCLE
  useEffect(() => {
    if (!isInitialized) {
      setCurrentPhase(2);
      addLog('info', 'Iniciando Fase 2: Estrategia de Contenido');
      setIsInitialized(true);
    }
  }, []); // ✅ EMPTY DEPENDENCY ARRAY

  // ✅ CARGAR DATOS SIN BUCLE
  useEffect(() => {
    if (currentProject && isInitialized) {
      if (!currentProject.phase1Data) {
        addLog('warning', 'Datos de Fase 1 no encontrados');
        navigate('/');
        return;
      }
      
      // Cargar datos existentes solo si no se han cargado
      if (currentProject.phase2Data && !aiStrategy) {
        setFormData(currentProject.phase2Data.selections || formData);
        setAiStrategy(currentProject.phase2Data.aiEnhancedContext);
        addLog('info', 'Datos de Fase 2 cargados');
      }
    }
  }, [currentProject, isInitialized, navigate, addLog]); // ✅ DEPENDENCIES SEGURAS

  // Análisis
  const analysis = useMemo(() => {
    const totalSelections = formData.outputFormats.length + formData.narrativeStyles.length + 
                          formData.visualStyles.length + formData.structures.length;
    return {
      totalSelections,
      hasSelections: totalSelections > 0,
      mode: totalSelections > 0 ? 'optimization' : 'suggestion',
      canContinue: formData.energyLevel > 0
    };
  }, [formData]);

  const currentEnergyInfo = useMemo(() => {
    return ENERGY_LEVELS.find(e => e.level === formData.energyLevel) || ENERGY_LEVELS[4];
  }, [formData.energyLevel]);

  // Handlers
  const handleEnergyChange = (value) => {
    setFormData(prev => ({ ...prev, energyLevel: value }));
    setHasManualChanges(true);
  };

  const handleSelectionToggle = useCallback((category, itemId) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(itemId) 
        ? prev[category].filter(id => id !== itemId)
        : [...prev[category], itemId]
    }));
    setHasManualChanges(true);
  }, []);

  const handleCTAChange = (value) => {
    setFormData(prev => ({ ...prev, cta: value }));
    setHasManualChanges(true);
  };

  const handleGenerateStrategy = async () => {
    if (!currentProject || !currentProject.phase1Data) {
      addLog('error', 'Datos de Fase 1 requeridos');
      return;
    }

    addLog('info', `Generando estrategia - Modo: ${analysis.mode.toUpperCase()}`);
    
    try {
      const prompt = generateEnhancedPrompt(currentProject.phase1Data, formData, analysis.mode);
      
      const result = await improveIdea(prompt, {
        temperature: 0.8,
        maxOutputTokens: 2000,
        disableThinking: true
      });

      const parseResult = parseEnhancedStrategy(result.improvedIdea);
      
      if (parseResult.success) {
        setAiStrategy(parseResult.data);
        addLog('success', 'Estrategia generada exitosamente');
      } else {
        setAiStrategy(parseResult.fallback);
        addLog('warning', 'Estrategia generada con fallback');
      }

    } catch (error) {
      addLog('error', 'Error generando estrategia', error.message);
      console.error('💥 Error:', error);
    }
  };

  const handleApplySuggestions = () => {
    if (!aiStrategy) return;

    setFormData(prev => ({
      ...prev,
      outputFormats: aiStrategy.selections.outputFormats || prev.outputFormats,
      narrativeStyles: aiStrategy.selections.narrativeStyles || prev.narrativeStyles,
      visualStyles: aiStrategy.selections.visualStyles || prev.visualStyles,
      structures: aiStrategy.selections.structures || prev.structures,
      cta: aiStrategy.selections.cta || prev.cta
    }));
    
    setHasManualChanges(false);
    addLog('info', 'Sugerencias aplicadas');
  };

  const handleContinue = () => {
    if (formData.energyLevel === 0) {
      addLog('warning', 'Selecciona un nivel de energía');
      return;
    }

    const phase2Data = {
      selections: formData,
      aiEnhancedContext: aiStrategy,
      timestamp: new Date().toISOString()
    };

    updatePhase2(phase2Data);
    addLog('success', `Fase 2 completada con energía ${formData.energyLevel}/10`);
    navigate('/phase-3');
  };

  // ✅ LOADING LIMPIO
  if (!isInitialized) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-500 mb-4" />
          <p className="text-gray-600">Inicializando Fase 2...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fase 2: Estrategia de Contenido</h1>
        <p className="text-lg text-gray-600">
          Define el ADN de tu historia. La IA adapta todo el contexto a tu nivel de energía y preferencias.
        </p>
      </div>

      {/* Nivel de Energía */}
      <Card padding="xl" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            ⚡ Nivel de Energía Narrativa
          </h2>
          <div className={`px-4 py-2 rounded-full font-bold ${currentEnergyInfo.color}`}>
            {currentEnergyInfo.icon} {formData.energyLevel}/10 - {currentEnergyInfo.label}
          </div>
        </div>
        
        <p className="text-indigo-700 mb-6">
          {currentEnergyInfo.description}
        </p>
        
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={formData.energyLevel}
            onChange={(e) => handleEnergyChange(parseInt(e.target.value))}
            className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between text-sm text-indigo-600">
            <span>🧘 Contemplativo</span>
            <span>⚖️ Equilibrado</span>
            <span>🌋 Apocalíptico</span>
          </div>
        </div>
      </Card>

      {/* Panel de IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-900 flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            IA "Aristoteles" - Estratega Narrativo
          </h2>
        </div>
        
        <p className="text-purple-700 mb-4">
          {analysis.mode === 'suggestion' ? 
            `IA con libertad total - Energía ${formData.energyLevel}: ${currentEnergyInfo.label}` :
            `IA respeta tus ${analysis.totalSelections} preferencias - Energía ${formData.energyLevel}: ${currentEnergyInfo.label}`
          }
        </p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button 
            variant="ai" 
            size="lg"
            onClick={handleGenerateStrategy}
            loading={isApiLoading}
            leftIcon={isApiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          >
            {isApiLoading ? 'Generando...' : analysis.mode === 'suggestion' ? 'Generar Estrategia' : 'Optimizar Estrategia'}
          </Button>
          
          {aiStrategy && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleApplySuggestions}
              leftIcon={<Check className="w-5 h-5" />}
            >
              Aplicar Sugerencias
            </Button>
          )}
        </div>

        {/* Resultados de IA */}
        {aiStrategy && (
          <div className="space-y-4">
            <Card className="bg-white border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">🧠 Razonamiento de la IA:</h3>
              <p className="text-gray-700 text-sm">{aiStrategy.deliberation}</p>
            </Card>
            
            {aiStrategy.energyIntegration && (
              <Card className="bg-white border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">⚡ Integración de Energía:</h3>
                <p className="text-gray-700 text-sm">{aiStrategy.energyIntegration}</p>
              </Card>
            )}
            
            {aiStrategy.viralIntegration && (
              <Card className="bg-white border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">🦠 Integración Viral Sutil:</h3>
                <p className="text-gray-700 text-sm">{aiStrategy.viralIntegration}</p>
              </Card>
            )}

            {aiStrategy.enhancedContext && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">💡 Idea Refinada (70%):</h4>
                  <p className="text-green-700 text-sm">"{aiStrategy.enhancedContext.improvedIdea}"</p>
                </Card>
                
                <Card className="bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🔑 Elementos Clave:</h4>
                  <p className="text-blue-700 text-sm">{aiStrategy.enhancedContext.improvedKeyElements}</p>
                </Card>
                
                <Card className="bg-orange-50 border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">🎯 Audiencia Detallada (70%):</h4>
                  <p className="text-orange-700 text-sm">{aiStrategy.enhancedContext.improvedTargetAudience}</p>
                </Card>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Selecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formatos de Salida */}
        <Card padding="lg" className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center">
            <Video className="w-5 h-5 mr-2" />
            📱 Formatos de Salida
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_FORMATS.map(format => (
              <button
                key={format.id}
                onClick={() => handleSelectionToggle('outputFormats', format.id)}
                className={`p-2 rounded-lg text-left text-sm border-2 transition-all ${
                  formData.outputFormats.includes(format.id)
                    ? 'border-teal-500 bg-teal-100 text-teal-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
                }`}
              >
                <div className="font-semibold">{format.icon} {format.name}</div>
                <div className="text-xs text-gray-600">{format.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Estilos Narrativos */}
        <Card padding="lg" className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            🎭 Estilos Narrativos
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {NARRATIVE_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => handleSelectionToggle('narrativeStyles', style.id)}
                className={`p-2 rounded-lg text-left text-sm border-2 transition-all ${
                  formData.narrativeStyles.includes(style.id)
                    ? 'border-pink-500 bg-pink-100 text-pink-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                }`}
              >
                <div className="font-semibold">{style.icon} {style.name}</div>
                <div className="text-xs text-gray-600">{style.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Estilos Visuales */}
        <Card padding="lg" className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            🎨 Estilos Visuales
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {VISUAL_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => handleSelectionToggle('visualStyles', style.id)}
                className={`p-2 rounded-lg text-left text-sm border-2 transition-all ${
                  formData.visualStyles.includes(style.id)
                    ? 'border-purple-500 bg-purple-100 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-semibold">{style.icon} {style.name}</div>
                <div className="text-xs text-gray-600">{style.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Estructuras */}
        <Card padding="lg" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            🏛️ Estructuras Narrativas
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {STRUCTURES.map(structure => (
              <button
                key={structure.id}
                onClick={() => handleSelectionToggle('structures', structure.id)}
                className={`p-2 rounded-lg text-left text-sm border-2 transition-all ${
                  formData.structures.includes(structure.id)
                    ? 'border-green-500 bg-green-100 text-green-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                }`}
              >
                <div className="font-semibold">{structure.icon} {structure.name}</div>
                <div className="text-xs text-gray-600">{structure.description}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* CTA */}
      <Card padding="xl" className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
          <Heart className="w-6 h-6 mr-2" />
          🧠 Llamado a la Acción (CTA)
        </h3>
        <p className="text-orange-700 mb-4">
          Frase que conecta emocionalmente. La IA puede sugerir opciones neurocientíficas.
        </p>
        
        <div className="space-y-2">
          <textarea
            value={formData.cta}
            onChange={(e) => handleCTAChange(e.target.value)}
            placeholder="💡 IA puede sugerir CTA optimizado"
            className="w-full p-3 border-2 border-orange-200 rounded-lg resize-none focus:border-orange-400 focus:outline-none"
            rows="2"
            maxLength="50"
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Máximo 50 caracteres</span>
            <span className={`text-sm font-medium ${formData.cta.length > 40 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.cta.length}/50
            </span>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      <Card className={`${analysis.canContinue ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center">
          {analysis.canContinue ? (
            <Check className="w-6 h-6 text-green-600 mr-3" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 mr-3" />
          )}
          <div>
            <h3 className={`font-semibold ${analysis.canContinue ? 'text-green-800' : 'text-amber-800'}`}>
              Estado de la Estrategia
            </h3>
            <p className={`text-sm ${analysis.canContinue ? 'text-green-600' : 'text-amber-600'}`}>
              {analysis.totalSelections} selecciones • Energía {formData.energyLevel}/10 • CTA: "{formData.cta || 'Pendiente'}"
            </p>
          </div>
        </div>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Volver al Inicio
        </Button>
        
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          disabled={!analysis.canContinue}
        >
          {analysis.canContinue ? 'Continuar a Fase 3' : `Configura energía para continuar`}
        </Button>
      </div>
    </div>
  );
};

export default Phase2;