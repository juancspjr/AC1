import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, ArrowRight, ArrowLeft, Wand2, RefreshCw, Sparkles, 
  Check, AlertCircle, Brain, Eye, Zap, Target, Heart, Users, 
  FileText, Palette, Video, ChevronDown, ChevronUp, Play,
  TrendingUp, Volume2, Film, Download, Repeat, Shield, X
} from 'lucide-react';
import { useProject } from '../hooks/useProject';
import { useGeminiApi } from '../hooks/useGeminiApi';
import { useLog } from '../context/LogContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// --- TÉCNICAS NARRATIVAS COMPLETAS ---
const NARRATIVE_TECHNIQUES = [
  { 
    id: 'storytelling_hook', 
    name: 'Storytelling estructurado con gancho inicial (Hook)', 
    description: 'Frase o pregunta poderosa que capta atención inmediata',
    scale: { min: 1, max: 10, default: 7 },
    impact: 'Retención desde el primer segundo',
    reference: 'Shawn Ryan, Jordan Peele, Christopher Nolan'
  },
  { 
    id: 'narrative_chain', 
    name: 'Cadena de pensamiento narrativo (Narrative Chain-of-Thought)', 
    description: 'Construcción lógica con ritmo y suspenso emocional',
    scale: { min: 1, max: 10, default: 8 },
    impact: 'Coherencia y impacto emocional',
    reference: 'Phoebe Waller-Bridge, Vince Gilligan, Aaron Sorkin'
  },
  { 
    id: 'emotional_cta', 
    name: 'Llamados a la acción emocionales y participativos', 
    description: 'CTAs que conectan con emociones y generan reacción',
    scale: { min: 1, max: 10, default: 6 },
    impact: 'Engagement y participación activa',
    reference: 'Gary Vaynerchuk, Simon Sinek, Tony Robbins'
  },
  { 
    id: 'contextual_personalization', 
    name: 'Personalización y segmentación contextual', 
    description: 'Adaptación a intereses y tendencias específicas',
    scale: { min: 1, max: 10, default: 7 },
    impact: 'Relevancia y cercanía percibida',
    reference: 'Netflix Algorithm, Spotify Discover'
  },
  { 
    id: 'micro_stories', 
    name: 'Estructura en formato "micro-historias" o cápsulas', 
    description: 'Contenidos breves con principio, nudo y desenlace',
    scale: { min: 1, max: 10, default: 9 },
    impact: 'Viralización rápida en redes sociales',
    reference: 'Black Mirror, TikTok Storytellers'
  },
  { 
    id: 'contrast_surprise', 
    name: 'Técnica de contraste y sorpresa', 
    description: 'Elementos inesperados combinando familiaridad con novedad',
    scale: { min: 1, max: 10, default: 8 },
    impact: 'Mantenimiento de interés cognitivo y emocional',
    reference: 'Christopher Nolan, M. Night Shyamalan'
  },
  { 
    id: 'audience_interaction', 
    name: 'Interacción con la audiencia simulada', 
    description: 'Diálogos y preguntas retóricas para narrativa interactiva',
    scale: { min: 1, max: 10, default: 6 },
    impact: 'Mayor engagement y participación',
    reference: 'Ryan Reynolds, MrBeast'
  },
  { 
    id: 'visual_sensory', 
    name: 'Lenguaje visual y sensorial', 
    description: 'Descripciones vívidas que ayuden a visualizar y sentir',
    scale: { min: 1, max: 10, default: 7 },
    impact: 'Experiencia inmersiva multimedia',
    reference: 'Guillermo del Toro, Denis Villeneuve'
  },
  { 
    id: 'story_remixing', 
    name: 'Story remixing y cross-media linkage', 
    description: 'Mezcla de formatos y referencias culturales populares',
    scale: { min: 1, max: 10, default: 8 },
    impact: 'Resonancia viral y boca a boca digital',
    reference: 'Ready Player One, Marvel Studios'
  },
  { 
    id: 'auto_consistency', 
    name: 'Auto-consistencia y revisión iterativa', 
    description: 'Revisión múltiple para coherencia global y claridad',
    scale: { min: 1, max: 10, default: 9 },
    impact: 'Calidad profesional y claridad máxima',
    reference: 'Aaron Sorkin, Charlie Kaufman'
  }
];

// --- GENERADOR PROJECT ID ÚNICO (EVITA DUPLICADOS) ---
const generateProjectId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substr(2, 8).toUpperCase();
  const randomPart2 = Math.random().toString(36).substr(2, 8).toUpperCase();
  const machineId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `VIRAL-${timestamp}-${randomPart1}-${randomPart2}-${machineId}`;
};

// --- GENERADOR DE RELACIONES ---
const generateCharacterRelationships = (characters) => {
  if (!characters || characters.length === 0) return [];
  
  const relationships = [];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const char1 = characters[i];
      const char2 = characters[j];
      
      let relationType = '';
      let conflictSource = '';
      
      if ((char1.type === 'protagonist' && char2.type === 'antagonist') || 
          (char1.type === 'antagonist' && char2.type === 'protagonist')) {
        relationType = 'Conflicto Principal';
        conflictSource = `${char1.desire} vs ${char2.desire}`;
      } else if ((char1.type === 'protagonist' && char2.type === 'mentor') || 
                 (char1.type === 'mentor' && char2.type === 'protagonist')) {
        relationType = 'Mentor-Discípulo';
        conflictSource = `Enseñanza: ${char2.need || char1.need}`;
      } else {
        relationType = 'Tensión Secundaria';
        conflictSource = `Choque: ${char1.flaw} vs ${char2.flaw}`;
      }
      
      relationships.push({
        character1: char1.name || `Personaje ${i + 1}`,
        character2: char2.name || `Personaje ${j + 1}`,
        type: relationType,
        conflict: conflictSource
      });
    }
  }
  return relationships;
};

// --- PROMPT OPTIMIZADO (REDUCIDO PERO COMPLETO) ---
const generateOptimizedPhase4Prompt = (projectData, selectedTechniques, projectId) => {
  // EXTRAER DATOS ESENCIALES
  const safeGet = (path, defaultValue = '') => {
    try {
      const keys = path.split('.');
      let current = projectData;
      for (const key of keys) {
        current = current?.[key];
      }
      return current || defaultValue;
    } catch {
      return defaultValue;
    }
  };
  
  const ideaBase = safeGet('phase1Data.idea');
  const ideaRefinada = safeGet('phase2Data.aiEnhancedContext.improvedIdea') || 
                       safeGet('phase2Data.aiEnhancedContext.enhancedContext.improvedIdea');
  const publicoDetallado = safeGet('phase2Data.aiEnhancedContext.improvedTargetAudience') || 
                           safeGet('phase2Data.aiEnhancedContext.enhancedContext.improvedTargetAudience');
  const ctaSeleccionado = safeGet('phase2Data.selections.cta');
  const nivelEnergia = safeGet('phase2Data.selections.energyLevel', 5);
  
  // ESTRATEGIA COMPLETA
  const razonamientoIA = safeGet('phase2Data.aiEnhancedContext.deliberation');
  const integracionEnergia = safeGet('phase2Data.aiEnhancedContext.energyIntegration');
  const integracionViral = safeGet('phase2Data.aiEnhancedContext.viralIntegration');
  
  const formatosSalida = safeGet('phase2Data.selections.outputFormats', []);
  const estilosNarrativos = safeGet('phase2Data.selections.narrativeStyles', []);
  const estilosVisuales = safeGet('phase2Data.selections.visualStyles', []);
  const estructuras = safeGet('phase2Data.selections.structures', []);
  
  const characters = safeGet('phase3Data.characters', []);
  const relationships = generateCharacterRelationships(characters);
  const activeTechniques = selectedTechniques.filter(tech => tech.active);
  
  return `Eres ARISTOTELES-AI, maestro estratega narrativo que combina genialidad de Aaron Sorkin, Christopher Nolan y Vince Gilligan.

# PROJECT: ${projectId}

## NÚCLEO NARRATIVO (30% + 70%)
IDEA_BASE_30: "${ideaBase}"
IDEA_REFINADA_70: "${ideaRefinada}"
PÚBLICO_DETALLADO: "${publicoDetallado}"

## ESTRATEGIA SELECCIONADA
RAZONAMIENTO_IA: "${razonamientoIA}"
INTEGRACIÓN_ENERGÍA: "${integracionEnergia}"
INTEGRACIÓN_VIRAL: "${integracionViral}"
NIVEL_ENERGÍA: ${nivelEnergia}/10

FORMATOS: ${formatosSalida.slice(0, 3).join(', ')}
ESTILOS: ${estilosNarrativos.slice(0, 2).join(', ')}
VISUALES: ${estilosVisuales.slice(0, 2).join(', ')}
CTA_BASE: "${ctaSeleccionado}"

## ELENCO PRINCIPAL
${characters.slice(0, 4).map((char, i) => `${char.name || `Personaje ${i+1}`} (${char.type}): ${char.description || 'Desarrollar'} | Desea: ${char.desire} | Teme: ${char.fear} | Necesita: ${char.need} | Defecto: ${char.flaw}`).join('\n')}

## RELACIONES
${relationships.slice(0, 3).map(rel => `${rel.character1} ↔ ${rel.character2}: ${rel.type}`).join('\n')}

## TÉCNICAS APLICADAS
${activeTechniques.slice(0, 5).map(tech => `${tech.name}: ${tech.currentScale}/10 (${tech.reference})`).join('\n')}

# INSTRUCCIONES

CREA estructura narrativa VIRAL y COMPLETA aplicando:
- Ponderación 30% idea base + 70% idea refinada
- Integra orgánicamente: "${integracionEnergia}" 
- Aplica viralmente: "${integracionViral}"
- Mantén energía: ${nivelEnergia}/10
- Desarrolla TODOS los personajes y relaciones
- Usa técnicas de referencia con niveles especificados

# FORMATO OBLIGATORIO

Responde ÚNICAMENTE en este formato:

# Proyecto: ${projectId}

🎬 ACTO 1: El Planteamiento
[Historia completa 3-4 párrafos. Gancho devastador estilo ${activeTechniques.find(t => t.id === 'storytelling_hook')?.reference || 'Christopher Nolan'}. Presenta personajes: ${characters.map(c => c.name || 'Sin nombre').join(', ')} con motivaciones. Establece conflicto principal. Energía ${nivelEnergia}/10.]

⚔️ ACTO 2: La Confrontación
[Historia completa 4-5 párrafos. Desarrolla relaciones: ${relationships.slice(0, 2).map(r => `${r.character1} vs ${r.character2}`).join(', ')}. Escalada dramática usando técnicas de ${activeTechniques.find(t => t.id === 'contrast_surprise')?.reference || 'Nolan'}. Obstáculos basados en miedos. Puntos de giro.]

🎯 ACTO 3: La Resolución
[Historia completa 3-4 párrafos. Clímax emocional estilo ${activeTechniques.find(t => t.id === 'visual_sensory')?.reference || 'Denis Villeneuve'}. Resuelve arcos: ${characters.map(c => `${c.name}: aprende ${c.need}`).join(' | ')}. Transformaciones completadas.]

💖 CTA Integrado Final
[Refina "${ctaSeleccionado}" integrado NATURALMENTE estilo ${activeTechniques.find(t => t.id === 'emotional_cta')?.reference || 'Simon Sinek'}. Conecta con "${publicoDetallado}". Emocional, no comercial.]

# Fase: 5 – Activación n8n

CRÍTICO: Los 4 elementos son OBLIGATORIOS. Cada acto debe ser HISTORIA COMPLETA, no resumen. VOZ HUMANA inspirada en creadores referenciados.`;

  return prompt;
};

// --- PARSER ROBUSTO ---
const parseNarrativeStructure = (response, projectId) => {
  try {
    console.log('🔍 Parser iniciado - Longitud:', response.length);
    
    const result = {
      projectId: projectId,
      act1: '',
      act2: '',
      act3: '', 
      ctaIntegrated: '',
      rawOutput: response.trim(),
      completeness: {
        hasAct1: false,
        hasAct2: false,
        hasAct3: false,
        hasCTA: false,
        totalComplete: false
      }
    };
    
    // EXTRAER ACTOS CON PATRONES MÚLTIPLES
    const act1Patterns = [
      /🎬 ACTO 1[^]*?\n([\s\S]*?)(?=⚔️ ACTO 2|$)/i,
      /ACTO 1[^]*?\n([\s\S]*?)(?=ACTO 2|⚔️|$)/i
    ];
    
    for (const pattern of act1Patterns) {
      const match = response.match(pattern);
      if (match && match[1] && match[1].trim().length > 100) {
        result.act1 = match[1].trim();
        break;
      }
    }
    
    const act2Patterns = [
      /⚔️ ACTO 2[^]*?\n([\s\S]*?)(?=🎯 ACTO 3|$)/i,
      /ACTO 2[^]*?\n([\s\S]*?)(?=ACTO 3|🎯|$)/i
    ];
    
    for (const pattern of act2Patterns) {
      const match = response.match(pattern);
      if (match && match[1] && match[1].trim().length > 150) {
        result.act2 = match[1].trim();
        break;
      }
    }
    
    const act3Patterns = [
      /🎯 ACTO 3[^]*?\n([\s\S]*?)(?=💖 CTA|$)/i,
      /ACTO 3[^]*?\n([\s\S]*?)(?=CTA|💖|$)/i
    ];
    
    for (const pattern of act3Patterns) {
      const match = response.match(pattern);
      if (match && match[1] && match[1].trim().length > 100) {
        result.act3 = match[1].trim();
        break;
      }
    }
    
    const ctaPatterns = [
      /💖 CTA[^]*?\n([\s\S]*?)(?=# Fase|$)/i,
      /CTA[^]*?\n([\s\S]*?)(?=# Fase|$)/i
    ];
    
    for (const pattern of ctaPatterns) {
      const match = response.match(pattern);
      if (match && match[1] && match[1].trim().length > 30) {
        result.ctaIntegrated = match[1].trim();
        break;
      }
    }
    
    // VALIDAR COMPLETITUD
    result.completeness.hasAct1 = result.act1.length > 100;
    result.completeness.hasAct2 = result.act2.length > 150;
    result.completeness.hasAct3 = result.act3.length > 100;
    result.completeness.hasCTA = result.ctaIntegrated.length > 30;
    
    result.completeness.totalComplete = result.completeness.hasAct1 && 
                                        result.completeness.hasAct2 && 
                                        result.completeness.hasAct3 && 
                                        result.completeness.hasCTA;
    
    console.log('✅ Completitud:', result.completeness);
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('💥 Error en parser:', error);
    return {
      success: false,
      data: {
        projectId: projectId,
        act1: '',
        act2: '',
        act3: '',
        ctaIntegrated: '',
        rawOutput: response
      },
      error: error.message
    };
  }
};

// --- COMPONENTE PRINCIPAL (SIN BUCLES INFINITOS) ---
const Phase4 = () => {
  const navigate = useNavigate();
  const { currentProject, updatePhase4, setCurrentPhase } = useProject();
  const { improveIdea, isLoading: isApiLoading } = useGeminiApi();
  const { addLog } = useLog();

  const [selectedTechniques, setSelectedTechniques] = useState(
    NARRATIVE_TECHNIQUES.map(tech => ({ ...tech, currentScale: tech.scale.default, active: true }))
  );
  const [narrativeStructure, setNarrativeStructure] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ summary: true });
  const [projectId, setProjectId] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ INICIALIZACIÓN SIN BUCLE (SOLO UNA VEZ)
  useEffect(() => {
    if (!isInitialized) {
      setCurrentPhase(4);
      addLog('info', 'Iniciando Fase 4: Estructura Narrativa');
      
      // ✅ GENERAR PROJECT ID SOLO UNA VEZ
      const newProjectId = generateProjectId();
      setProjectId(newProjectId);
      console.log('🆔 Project ID generado ÚNICO:', newProjectId);
      
      setIsInitialized(true);
    }
  }, []); // ✅ DEPENDENCY ARRAY VACÍO - SOLO UNA EJECUCIÓN

  // ✅ CARGAR DATOS EXISTENTES SIN BUCLE
  useEffect(() => {
    if (currentProject && isInitialized) {
      if (!currentProject.phase3Data) {
        addLog('warning', 'Fase 3 requerida');
        navigate('/phase-3');
        return;
      }
      
      // Solo cargar si no hay datos ya
      if (currentProject.phase4Data && !narrativeStructure) {
        setNarrativeStructure(currentProject.phase4Data.narrativeStructure);
        setSelectedTechniques(currentProject.phase4Data.techniques || selectedTechniques);
        if (currentProject.phase4Data.projectId && !projectId) {
          setProjectId(currentProject.phase4Data.projectId);
        }
      }
    }
  }, [currentProject, isInitialized, navigate, addLog]); // ✅ DEPENDENCIES SEGURAS

  // RESUMEN COMPLETO
  const projectSummary = useMemo(() => {
    if (!currentProject) return null;
    
    const safeGet = (path, defaultValue = '') => {
      try {
        const keys = path.split('.');
        let current = currentProject;
        for (const key of keys) {
          current = current?.[key];
        }
        return current || defaultValue;
      } catch {
        return defaultValue;
      }
    };
    
    return {
      nucleo: {
        ideaBase30: safeGet('phase1Data.idea'),
        ideaRefinada70: safeGet('phase2Data.aiEnhancedContext.improvedIdea') || 
                        safeGet('phase2Data.aiEnhancedContext.enhancedContext.improvedIdea'),
        audienciaDetallada70: safeGet('phase2Data.aiEnhancedContext.improvedTargetAudience') || 
                              safeGet('phase2Data.aiEnhancedContext.enhancedContext.improvedTargetAudience'),
        elementosRefinados70: safeGet('phase2Data.aiEnhancedContext.improvedKeyElements') || 
                              safeGet('phase2Data.aiEnhancedContext.enhancedContext.improvedKeyElements')
      },
      estrategia: {
        razonamientoIA: safeGet('phase2Data.aiEnhancedContext.deliberation'),
        integracionEnergia: safeGet('phase2Data.aiEnhancedContext.energyIntegration'),
        integracionViral: safeGet('phase2Data.aiEnhancedContext.viralIntegration'),
        nivelEnergia: safeGet('phase2Data.selections.energyLevel', 5),
        formatosSalida: safeGet('phase2Data.selections.outputFormats', []),
        estilosNarrativos: safeGet('phase2Data.selections.narrativeStyles', []),
        estilosVisuales: safeGet('phase2Data.selections.visualStyles', []),
        estructuras: safeGet('phase2Data.selections.structures', []),
        cta: safeGet('phase2Data.selections.cta')
      },
      elenco: {
        total: currentProject.phase3Data?.characters?.length || 0,
        personajes: currentProject.phase3Data?.characters || [],
        relaciones: generateCharacterRelationships(currentProject.phase3Data?.characters || [])
      }
    };
  }, [currentProject]);

  // MANEJADORES
  const handleTechniqueToggle = (techniqueId) => {
    setSelectedTechniques(prev => prev.map(tech => 
      tech.id === techniqueId 
        ? { ...tech, active: !tech.active }
        : tech
    ));
  };

  const handleScaleChange = (techniqueId, scale) => {
    setSelectedTechniques(prev => prev.map(tech => 
      tech.id === techniqueId 
        ? { ...tech, currentScale: scale }
        : tech
    ));
  };

  // ✅ GENERACIÓN OPTIMIZADA (SIN ERROR 1000 CARACTERES)
  const handleGenerateStructure = async () => {
    if (!currentProject) {
      addLog('error', 'Datos del proyecto requeridos');
      return;
    }

    if (!projectId) {
      addLog('warning', 'Project ID no generado, reintentando...');
      const newId = generateProjectId();
      setProjectId(newId);
      return;
    }

    const activeTechniques = selectedTechniques.filter(tech => tech.active);
    if (activeTechniques.length === 0) {
      addLog('warning', 'Selecciona al menos una técnica');
      return;
    }

    addLog('info', 'Generando estructura COMPLETA con prompt optimizado');
    
    try {
      const prompt = generateOptimizedPhase4Prompt(currentProject, selectedTechniques, projectId);
      
      console.log('🎯 Prompt OPTIMIZADO enviado con', prompt.length, 'caracteres'); // ✅ REDUCIDO
      
      const result = await improveIdea(prompt, {
        temperature: 0.8,
        maxOutputTokens: 3500, // ✅ REDUCIDO PERO SUFICIENTE
        disableThinking: true
      });
      
      // ✅ VALIDACIÓN MÁS PERMISIVA
      if (!result || !result.improvedIdea) {
        throw new Error('Respuesta vacía de la IA');
      }
      
      if (result.improvedIdea.trim().length < 500) { // ✅ REDUCIDO DE 1000 A 500
        throw new Error('Respuesta muy corta - se requieren mínimo 500 caracteres');
      }
      
      console.log('📨 Respuesta recibida:', result.improvedIdea.length, 'caracteres');
      
      const parseResult = parseNarrativeStructure(result.improvedIdea, projectId);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }
      
      setNarrativeStructure(parseResult.data);
      
      if (parseResult.data.completeness.totalComplete) {
        addLog('success', '✅ Estructura COMPLETA generada - 4/4 elementos validados');
      } else {
        addLog('warning', `Estructura parcial - ${Object.values(parseResult.data.completeness).filter(Boolean).length}/4 elementos`);
      }
      
    } catch (error) {
      addLog('error', 'Error generando estructura', error.message);
      console.error('💥 Error:', error);
    }
  };

  const handleToggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadTXT = () => {
    if (!narrativeStructure?.completeness?.totalComplete) {
      addLog('warning', 'Solo estructura COMPLETA puede descargarse');
      return;
    }

    try {
      const blob = new Blob([narrativeStructure.rawOutput], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `narrativa-${projectId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addLog('success', 'TXT descargado para n8n');
    } catch (error) {
      addLog('error', 'Error descargando', error.message);
    }
  };

  const handleSendToWebhook = () => {
    if (!narrativeStructure?.completeness?.totalComplete) {
      addLog('warning', 'Solo estructura COMPLETA puede enviarse a n8n');
      return;
    }

    addLog('success', `Estructura enviada a n8n - Proyecto ${projectId} - Fase 5 iniciada`);
  };

  // ✅ LOADING LIMPIO
  if (!isInitialized) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600">Inicializando Fase 4...</p>
        </div>
      </div>
    );
  }

  const isStructureComplete = narrativeStructure?.completeness?.totalComplete || false;
  const hasStructure = !!narrativeStructure;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fase 4: Estructura Narrativa</h1>
        <p className="text-lg text-gray-600">
          Genera los 4 elementos OBLIGATORIOS usando contexto COMPLETO.
        </p>
        <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium inline-block">
          ID: {projectId.split('-').pop()} | Estado: {hasStructure ? 
            `${Object.values(narrativeStructure.completeness).filter(Boolean).length}/4` : 
            'Pendiente'
          }
        </div>
      </div>

      {/* Resumen COMPLETO */}
      {projectSummary && (
        <Card padding="xl" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleToggleSection('summary')}
          >
            <h2 className="text-xl font-bold text-indigo-900 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              📊 Contexto COMPLETO del Proyecto
            </h2>
            {expandedSections.summary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {expandedSections.summary && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Núcleo 30% + 70% */}
              <Card className="bg-white">
                <h3 className="font-semibold text-indigo-800 mb-2">📖 Núcleo (30% + 70%)</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Idea Ponderada:</strong>
                    <div className="bg-blue-50 p-1 rounded mt-1">
                      <span className="text-blue-700">30%:</span> {projectSummary.nucleo.ideaBase30}
                    </div>
                    <div className="bg-green-50 p-1 rounded mt-1">
                      <span className="text-green-700">70%:</span> {projectSummary.nucleo.ideaRefinada70}
                    </div>
                  </div>
                  <div>
                    <strong>Audiencia:</strong>
                    <p className="text-gray-700">{projectSummary.nucleo.audienciaDetallada70}</p>
                  </div>
                </div>
              </Card>

              {/* Estrategia COMPLETA */}
              <Card className="bg-white">
                <h3 className="font-semibold text-indigo-800 mb-2">⚡ Estrategia</h3>
                <div className="space-y-1 text-xs">
                  <div>
                    <strong>🧠 Razonamiento IA:</strong>
                    <p className="text-gray-700 bg-gray-50 p-1 rounded">{projectSummary.estrategia.razonamientoIA}</p>
                  </div>
                  <div>
                    <strong>Integración Energía:</strong>
                    <p className="text-gray-700 bg-gray-50 p-1 rounded">{projectSummary.estrategia.integracionEnergia}</p>
                  </div>
                  <div>
                    <strong>🦠 Viral Sutil:</strong>
                    <p className="text-gray-700 bg-gray-50 p-1 rounded">{projectSummary.estrategia.integracionViral}</p>
                  </div>
                  <div>
                    <strong>Energía:</strong> {projectSummary.estrategia.nivelEnergia}/10
                  </div>
                  <div>
                    <strong>Formatos:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projectSummary.estrategia.formatosSalida.slice(0, 3).map((formato, i) => (
                        <span key={i} className="bg-purple-100 text-purple-700 px-1 rounded">
                          {formato}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>🧠 CTA:</strong> <em>"{projectSummary.estrategia.cta}"</em>
                  </div>
                </div>
              </Card>

              {/* Elenco CON Relaciones */}
              <Card className="bg-white">
                <h3 className="font-semibold text-indigo-800 mb-2">👥 Elenco ({projectSummary.elenco.total})</h3>
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                  {projectSummary.elenco.personajes.slice(0, 4).map((char, i) => (
                    <div key={i} className="bg-gray-50 p-1 rounded">
                      <strong>{char.name || `Personaje ${i+1}`}</strong> ({char.type})
                      <div className="text-gray-600 text-xs">{char.description}</div>
                      <div className="flex gap-1 text-xs">
                        <span className="bg-blue-100 px-1 rounded">↗️{char.desire}</span>
                        <span className="bg-red-100 px-1 rounded">😰{char.fear}</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2">
                    <strong>Relaciones:</strong>
                    {projectSummary.elenco.relaciones.slice(0, 3).map((rel, i) => (
                      <div key={i} className="text-xs bg-yellow-50 p-1 rounded mt-1">
                        {rel.character1} ↔ {rel.character2}: {rel.type}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Card>
      )}

      {/* Técnicas Narrativas */}
      <Card padding="xl" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          🎨 Técnicas Narrativas Avanzadas
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {NARRATIVE_TECHNIQUES.map(technique => (
            <Card 
              key={technique.id} 
              className={`border-2 ${
                selectedTechniques.find(t => t.id === technique.id)?.active
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTechniques.find(t => t.id === technique.id)?.active || false}
                  onChange={() => handleTechniqueToggle(technique.id)}
                  className="mt-1 w-4 h-4 text-purple-600"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {technique.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">{technique.description}</p>
                  <p className="text-xs text-green-700 font-medium mb-1">
                    📺 {technique.reference}
                  </p>
                  
                  {selectedTechniques.find(t => t.id === technique.id)?.active && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Creatividad:</span>
                        <span className="text-xs font-bold text-purple-600">
                          {selectedTechniques.find(t => t.id === technique.id)?.currentScale}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={selectedTechniques.find(t => t.id === technique.id)?.currentScale}
                        onChange={(e) => handleScaleChange(technique.id, parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            variant="ai" 
            size="lg" 
            onClick={handleGenerateStructure}
            loading={isApiLoading}
            leftIcon={isApiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          >
            {isApiLoading ? 'Generando...' : '🎬 Generar Estructura COMPLETA (4/4)'}
          </Button>
        </div>
      </Card>

      {/* Estructura Generada */}
      {hasStructure && (
        <Card padding="xl" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-green-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              📚 Estructura Narrativa
            </h2>
            <div className="text-sm">
              {Object.values(narrativeStructure?.completeness || {}).filter(Boolean).length}/4 ✅
            </div>
          </div>

          <div className="space-y-4">
            {/* Acto 1 */}
            <Card className="bg-blue-50 border-blue-300">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleSection('act1')}
              >
                <h3 className="text-lg font-bold text-blue-900 flex items-center">
                  🎬 ACTO 1: El Planteamiento
                  {narrativeStructure?.completeness?.hasAct1 ? 
                    <Check className="w-4 h-4 text-green-600 ml-2" /> : 
                    <AlertCircle className="w-4 h-4 text-red-600 ml-2" />
                  }
                </h3>
                {expandedSections.act1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              
              {expandedSections.act1 && (
                <div className="mt-3 bg-white p-3 rounded border">
                  <div className="whitespace-pre-wrap text-gray-800 text-sm">
                    {narrativeStructure?.act1 || 'Pendiente de generar'}
                  </div>
                </div>
              )}
            </Card>

            {/* Acto 2 */}
            <Card className="bg-orange-50 border-orange-300">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleSection('act2')}
              >
                <h3 className="text-lg font-bold text-orange-900 flex items-center">
                  ⚔️ ACTO 2: La Confrontación
                  {narrativeStructure?.completeness?.hasAct2 ? 
                    <Check className="w-4 h-4 text-green-600 ml-2" /> : 
                    <AlertCircle className="w-4 h-4 text-red-600 ml-2" />
                  }
                </h3>
                {expandedSections.act2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              
              {expandedSections.act2 && (
                <div className="mt-3 bg-white p-3 rounded border">
                  <div className="whitespace-pre-wrap text-gray-800 text-sm">
                    {narrativeStructure?.act2 || 'Pendiente de generar'}
                  </div>
                </div>
              )}
            </Card>

            {/* Acto 3 */}
            <Card className="bg-purple-50 border-purple-300">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleSection('act3')}
              >
                <h3 className="text-lg font-bold text-purple-900 flex items-center">
                  🎯 ACTO 3: La Resolución
                  {narrativeStructure?.completeness?.hasAct3 ? 
                    <Check className="w-4 h-4 text-green-600 ml-2" /> : 
                    <AlertCircle className="w-4 h-4 text-red-600 ml-2" />
                  }
                </h3>
                {expandedSections.act3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              
              {expandedSections.act3 && (
                <div className="mt-3 bg-white p-3 rounded border">
                  <div className="whitespace-pre-wrap text-gray-800 text-sm">
                    {narrativeStructure?.act3 || 'Pendiente de generar'}
                  </div>
                </div>
              )}
            </Card>

            {/* CTA */}
            <Card className="bg-red-50 border-red-300">
              <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
                💖 CTA Integrado Final
                {narrativeStructure?.completeness?.hasCTA ? 
                  <Check className="w-4 h-4 text-green-600 ml-2" /> : 
                  <AlertCircle className="w-4 h-4 text-red-600 ml-2" />
                }
              </h3>
              <div className="bg-white p-3 rounded border">
                <p className="text-gray-800">
                  {narrativeStructure?.ctaIntegrated || 'Pendiente de generar'}
                </p>
              </div>
            </Card>
          </div>

          {/* Acciones */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={handleDownloadTXT}
              leftIcon={<Download className="w-4 h-4" />}
              disabled={!isStructureComplete}
            >
              Descargar TXT
            </Button>
            
            <Button
              variant="success"
              onClick={handleSendToWebhook}
              leftIcon={<Play className="w-4 h-4" />}
              disabled={!isStructureComplete}
            >
              Activar n8n → Fase 5
            </Button>
          </div>
        </Card>
      )}

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate('/phase-3')}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Volver a Fase 3
        </Button>
        
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            if (isStructureComplete) {
              const phase4Data = {
                narrativeStructure,
                techniques: selectedTechniques,
                projectId,
                timestamp: new Date().toISOString()
              };
              updatePhase4(phase4Data);
              addLog('success', 'Proyecto COMPLETO');
              navigate('/');
            } else {
              addLog('warning', 'Genera estructura COMPLETA primero');
            }
          }}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          disabled={!isStructureComplete}
        >
          {isStructureComplete ? 'Proyecto COMPLETO' : 'Genera estructura (4/4)'}
        </Button>
      </div>
    </div>
  );
};

export default Phase4;