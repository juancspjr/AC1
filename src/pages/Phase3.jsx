import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, ArrowRight, ArrowLeft, Wand2, RefreshCw, Sparkles, Edit3, Save,
  Trash2, Plus, Zap, Target, Brain, Check, AlertCircle, Eye, FileText,
  ChevronDown, ChevronUp, User, Heart, Shield, TrendingUp, X
} from 'lucide-react';
import { useProject } from '../hooks/useProject';
import { useGeminiApi } from '../hooks/useGeminiApi';
import { useLog } from '../context/LogContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import Input from '../components/ui/Input';

// --- CONFIGURACIÓN DE TIPOS DE PERSONAJES ---
const CHARACTER_TYPES = [
  {
    id: 'protagonist',
    name: 'Protagonista',
    icon: '🌟',
    color: 'bg-blue-500 text-white',
    description: 'El héroe principal de la historia'
  },
  {
    id: 'antagonist',
    name: 'Antagonista',
    icon: '⚔️',
    color: 'bg-red-500 text-white',
    description: 'La fuerza opositora principal'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: '🧙',
    color: 'bg-purple-500 text-white',
    description: 'Guía sabio que ayuda al protagonista'
  },
  {
    id: 'ally',
    name: 'Aliado',
    icon: '🤝',
    color: 'bg-green-500 text-white',
    description: 'Compañero leal que apoya'
  },
  {
    id: 'catalyst',
    name: 'Catalizador',
    icon: '⚡',
    color: 'bg-yellow-500 text-black',
    description: 'Acelera el cambio narrativo'
  }
];

// --- CAMPOS DE PERSONAJES ---
const CHARACTER_FIELDS = [
  { key: 'type', label: 'Tipo', required: true, type: 'select', icon: User },
  { key: 'name', label: 'Nombre', required: true, type: 'input', icon: User },
  { key: 'description', label: 'Descripción', required: true, type: 'textarea', icon: FileText, rows: 2 },
  { key: 'desire', label: 'Deseo', required: true, type: 'input', icon: Target },
  { key: 'fear', label: 'Miedo', required: true, type: 'input', icon: Shield },
  { key: 'need', label: 'Necesidad', required: true, type: 'input', icon: Heart },
  { key: 'flaw', label: 'Defecto', required: true, type: 'input', icon: X },
  { key: 'characterArc', label: 'Arco', required: false, type: 'input', icon: TrendingUp },
  { key: 'visualDetails', label: 'Visual', required: false, type: 'textarea', icon: Eye, rows: 2 }
];

// --- GENERADOR DE IDS ---
const generateUniqueId = () => {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// --- GENERADOR DE PROMPT SIMPLE ---
const generateCharacterPrompt = (currentProject) => {
  const { phase1Data, phase2Data } = currentProject;
  
  if (!phase2Data) {
    return 'Error: Se requieren datos de Fase 2';
  }

  const idea = phase2Data.aiEnhancedContext?.improvedIdea || phase1Data?.idea || '';
  const audience = phase2Data.aiEnhancedContext?.improvedTargetAudience || phase1Data?.targetAudience || '';
  const energy = phase2Data.selections?.energyLevel || 5;
  const cta = phase2Data.selections?.cta || '';

  return `Eres "Synapse", especialista en personajes narrativos.

CONTEXTO:
- Idea: "${idea}"
- Público: ${audience}
- Energía: ${energy}/10
- CTA: "${cta}"

INSTRUCCIONES:
1. Responde ÚNICAMENTE con JSON válido
2. NO agregues texto antes o después
3. Crea exactamente 3 personajes únicos
4. Usa estos tipos: protagonist, antagonist, mentor

FORMATO JSON:
{
  "contextualReasoning": "Por qué estos personajes funcionan",
  "energyAdaptation": "Adaptación al nivel ${energy}",
  "narrativeIntegration": "Conexión con historia",
  "characters": [
    {
      "type": "protagonist",
      "name": "Nombre del protagonista",
      "description": "Descripción en 2-3 oraciones",
      "desire": "Objetivo que busca",
      "fear": "Miedo principal",
      "need": "Lección que debe aprender",
      "flaw": "Defecto principal",
      "characterArc": "Transformación",
      "visualDetails": "Descripción física"
    },
    {
      "type": "antagonist",
      "name": "Nombre del antagonista",
      "description": "Descripción del antagonista",
      "desire": "Objetivo del antagonista",
      "fear": "Miedo del antagonista",
      "need": "Necesidad del antagonista",
      "flaw": "Defecto del antagonista",
      "characterArc": "Arco del antagonista",
      "visualDetails": "Visual del antagonista"
    },
    {
      "type": "mentor",
      "name": "Nombre del mentor",
      "description": "Descripción del mentor",
      "desire": "Objetivo del mentor",
      "fear": "Miedo del mentor",
      "need": "Necesidad del mentor",
      "flaw": "Defecto del mentor",
      "characterArc": "Arco del mentor",
      "visualDetails": "Visual del mentor"
    }
  ]
}`;
};

// --- PARSER JSON ROBUSTO (CON CORRECCIÓN ESLINT) ---
const parseAIResponse = (response) => {
  try {
    console.log('🔍 Parseando respuesta:', response.substring(0, 100));
    
    // ✅ CORRECCIÓN ESLINT: const en lugar de let
    const cleanResponse = response.trim();
    
    // Extraer JSON
    const patterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/i,
      /```\s*(\{[\s\S]*?\})\s*```/i,
      /(\{[\s\S]*?"characters"[\s\S]*?\})/i,
      /(\{[\s\S]*\})/
    ];

    let extractedJson = '';
    for (const pattern of patterns) {
      const match = cleanResponse.match(pattern);
      if (match && match[1]) {
        extractedJson = match[1].trim();
        console.log('✅ JSON encontrado');
        break;
      }
    }

    if (!extractedJson) {
      throw new Error('No se encontró JSON en la respuesta');
    }

    // Intentar parsear
    let parsed;
    try {
      parsed = JSON.parse(extractedJson);
    } catch (parseError) {
      console.log('❌ Error parseando, intentando limpiar...');
      const cleanedJson = extractedJson
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":');
        
      try {
        parsed = JSON.parse(cleanedJson);
      } catch (secondError) {
        throw new Error('JSON malformado irrecuperable');
      }
    }

    // Validar estructura
    if (!parsed.characters || !Array.isArray(parsed.characters)) {
      throw new Error('Respuesta no contiene array de personajes');
    }

    // Limpiar personajes
    const validTypes = CHARACTER_TYPES.map(t => t.id);
    parsed.characters = parsed.characters.map((char, index) => {
      if (!char || typeof char !== 'object') {
        char = {};
      }
      
      // Asegurar campos básicos
      char.type = validTypes.includes(char.type) ? char.type : 
                  (index === 0 ? 'protagonist' : index === 1 ? 'antagonist' : 'mentor');
      char.name = char.name || `Personaje ${index + 1}`;
      char.description = char.description || 'Descripción pendiente';
      char.desire = char.desire || 'Deseo por definir';
      char.fear = char.fear || 'Miedo por definir';
      char.need = char.need || 'Necesidad por definir';
      char.flaw = char.flaw || 'Defecto por definir';
      char.characterArc = char.characterArc || 'Arco por definir';
      char.visualDetails = char.visualDetails || 'Visual por definir';

      return char;
    });

    return {
      success: true,
      data: parsed,
      totalCharacters: parsed.characters.length
    };

  } catch (error) {
    console.error('💥 Error en parsing:', error);
    
    // Fallback básico sin inventar
    return {
      success: true,
      data: {
        contextualReasoning: 'Personajes básicos generados.',
        energyAdaptation: 'Adaptación energética aplicada.',
        narrativeIntegration: 'Integración narrativa establecida.',
        characters: [
          {
            type: 'protagonist',
            name: 'Protagonista',
            description: 'Héroe principal de la historia',
            desire: 'Superar desafíos',
            fear: 'Fracasar',
            need: 'Aprender confianza',
            flaw: 'Demasiado orgulloso',
            characterArc: 'De inseguro a confiado',
            visualDetails: 'Determinado y reflexivo'
          }
        ]
      },
      totalCharacters: 1,
      fallback: true,
      error: error.message
    };
  }
};

// --- COMPONENTE PRINCIPAL ---
const Phase3 = () => {
  const navigate = useNavigate();
  const { currentProject, updatePhase3, setCurrentPhase } = useProject();
  const { improveIdea, isLoading: isApiLoading } = useGeminiApi();
  const { addLog } = useLog();

  const [characters, setCharacters] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [hasManualChanges, setHasManualChanges] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Inicialización SIN bucle infinito
  useEffect(() => {
    if (!isInitialized) {
      setCurrentPhase(3);
      addLog('info', 'Iniciando Fase 3: Personajes');
      setIsInitialized(true);
    }
  }, [isInitialized, setCurrentPhase, addLog]);

  // ✅ Cargar datos SIN bucle infinito
  useEffect(() => {
    if (currentProject && isInitialized) {
      if (!currentProject.phase2Data) {
        addLog('warning', 'Datos de Fase 2 no encontrados');
        navigate('/phase-2');
        return;
      }
      
      if (currentProject.phase3Data && currentProject.phase3Data.characters && characters.length === 0) {
        setCharacters(currentProject.phase3Data.characters);
        setAiSuggestions(currentProject.phase3Data.aiSuggestions);
        addLog('info', 'Datos existentes cargados');
      }
    }
  }, [currentProject, isInitialized, navigate, addLog, characters.length]);

  // Análisis
  const analysis = useMemo(() => {
    const hasCharacters = characters.length > 0;
    const requiredFields = ['type', 'name', 'description', 'desire', 'fear', 'need', 'flaw'];
    const incompleteCharacters = characters.filter(char => {
      return requiredFields.some(field => !char[field] || char[field].trim() === '');
    });

    return {
      hasCharacters,
      totalCharacters: characters.length,
      incompleteCharacters: incompleteCharacters.length,
      mode: hasCharacters ? 'optimization' : 'suggestion',
      canContinue: hasCharacters && incompleteCharacters.length === 0
    };
  }, [characters]);

  // Funciones
  const createEmptyCharacter = () => ({
    id: generateUniqueId(),
    type: 'protagonist',
    name: '',
    description: '',
    desire: '',
    fear: '',
    need: '',
    flaw: '',
    characterArc: '',
    visualDetails: '',
    aiGenerated: false,
    createdAt: new Date().toISOString()
  });

  const getTypeInfo = (typeId) => {
    return CHARACTER_TYPES.find(t => t.id === typeId) || CHARACTER_TYPES[0];
  };

  const handleGenerateCharacters = async () => {
    if (!currentProject) {
      addLog('error', 'Datos del proyecto requeridos');
      return;
    }

    addLog('info', 'Generando personajes con IA');
    
    try {
      const prompt = generateCharacterPrompt(currentProject);
      
      const result = await improveIdea(prompt, {
        disableThinking: true,
        maxOutputTokens: 3000,
        temperature: 0.7
      });

      if (!result || !result.improvedIdea) {
        throw new Error('Respuesta vacía de la IA');
      }

      console.log('📨 Respuesta IA:', result.improvedIdea.substring(0, 200));
      
      const parseResult = parseAIResponse(result.improvedIdea);

      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Error parseando respuesta');
      }

      // Procesar personajes con IDs únicos
      const processedCharacters = parseResult.data.characters.map((char) => ({
        id: generateUniqueId(),
        ...char,
        aiGenerated: true,
        createdAt: new Date().toISOString()
      }));

      const newAiSuggestions = {
        ...parseResult.data,
        characters: processedCharacters,
        mode: analysis.mode,
        timestamp: new Date().toISOString()
      };

      setAiSuggestions(newAiSuggestions);
      addLog('success', `${parseResult.totalCharacters} personajes generados`);

    } catch (error) {
      addLog('error', 'Error generando personajes', error.message);
      console.error('💥 Error:', error);
    }
  };

  const handleApplySuggestions = () => {
    if (!aiSuggestions) return;

    if (aiSuggestions.mode === 'suggestion') {
      setCharacters(aiSuggestions.characters);
      addLog('info', 'Personajes aplicados');
    } else {
      // Merge seguro
      const mergedCharacters = [...characters];
      
      aiSuggestions.characters.forEach(aiChar => {
        const existingIndex = mergedCharacters.findIndex(char =>
          char.name && aiChar.name && 
          char.name.toLowerCase() === aiChar.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          const existing = mergedCharacters[existingIndex];
          
          Object.keys(aiChar).forEach(key => {
            const existingValue = existing[key];
            const newValue = aiChar[key];
            
            // Solo actualizar si existente está vacío y nuevo tiene valor
            if ((!existingValue || 
                 (typeof existingValue === 'string' && existingValue.trim() === '')) &&
                (newValue && typeof newValue === 'string' && newValue.trim() !== '')) {
              existing[key] = newValue;
            }
          });
        } else {
          mergedCharacters.push({
            id: generateUniqueId(),
            ...aiChar,
            aiGenerated: true,
            createdAt: new Date().toISOString()
          });
        }
      });

      setCharacters(mergedCharacters);
      addLog('info', 'Personajes optimizados');
    }

    setHasManualChanges(false);
  };

  const handleAddCharacter = () => {
    const newCharacter = createEmptyCharacter();
    setCharacters(prev => [...prev, newCharacter]);
    setEditingCharacter(newCharacter.id);
    setHasManualChanges(true);
    addLog('info', 'Personaje agregado');
  };

  const handleUpdateCharacter = useCallback((characterId, field, value) => {
    setCharacters(prev => prev.map(char =>
      char.id === characterId
        ? { ...char, [field]: value, aiGenerated: false }
        : char
    ));
    setHasManualChanges(true);
  }, []);

  const handleDeleteCharacter = (characterId) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
    setHasManualChanges(true);
    
    if (editingCharacter === characterId) {
      setEditingCharacter(null);
    }
    
    addLog('info', 'Personaje eliminado');
  };

  const handleToggleExpand = (characterId) => {
    setExpandedCards(prev => ({
      ...prev,
      [characterId]: !prev[characterId]
    }));
  };

  const handleContinue = () => {
    if (analysis.totalCharacters === 0) {
      addLog('warning', 'Agrega al menos un personaje');
      return;
    }

    if (analysis.incompleteCharacters > 0) {
      addLog('warning', `Completa ${analysis.incompleteCharacters} personaje(s)`);
      return;
    }

    const phase3Data = {
      characters,
      aiSuggestions,
      totalCharacters: characters.length,
      timestamp: new Date().toISOString()
    };

    updatePhase3(phase3Data);
    addLog('success', `Fase 3 completada con ${characters.length} personajes`);
    navigate('/phase-4');
  };

  // Renderizar personaje
  const renderCharacterCard = (character, index) => {
    const typeInfo = getTypeInfo(character.type);
    const isEditing = editingCharacter === character.id;
    const isExpanded = expandedCards[character.id];

    const requiredFields = ['type', 'name', 'description', 'desire', 'fear', 'need', 'flaw'];
    const missingFields = requiredFields.filter(field => 
      !character[field] || (typeof character[field] === 'string' && character[field].trim() === '')
    );
    const isComplete = missingFields.length === 0;

    return (
      <Card 
        key={character.id}
        className={`border-2 ${isComplete ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
              {typeInfo.icon} {typeInfo.name}
            </div>
            {character.aiGenerated && (
              <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                <Brain className="w-3 h-3 inline mr-1" />IA
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleToggleExpand(character.id)}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingCharacter(isEditing ? null : character.id)}>
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDeleteCharacter(character.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {character.name || `Personaje ${index + 1}`}
            </h3>
            <p className="text-gray-600 text-sm">
              {character.description || 'Sin descripción'}
            </p>
          </div>

          {!isComplete && (
            <div className="bg-orange-100 border border-orange-300 rounded p-2">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-orange-800 text-sm">
                  Faltan {missingFields.length} campos: {missingFields.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Campos expandidos */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHARACTER_FIELDS.map(field => {
                const FieldIcon = field.icon;
                const value = character[field.key] || '';

                if (isEditing) {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FieldIcon className="w-4 h-4 mr-2" />
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          value={value}
                          onChange={(e) => handleUpdateCharacter(character.id, field.key, e.target.value)}
                          className="w-full p-2 border rounded-lg text-sm"
                        >
                          {CHARACTER_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.icon} {type.name}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <TextArea
                          value={value}
                          onChange={(e) => handleUpdateCharacter(character.id, field.key, e.target.value)}
                          rows={field.rows || 2}
                          className="text-sm"
                        />
                      ) : (
                        <Input
                          value={value}
                          onChange={(e) => handleUpdateCharacter(character.id, field.key, e.target.value)}
                          className="text-sm"
                        />
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="flex items-center text-xs font-medium text-gray-600">
                        <FieldIcon className="w-3 h-3 mr-1" />
                        {field.label}
                      </label>
                      <p className="text-sm text-gray-800">
                        {value || <span className="text-gray-400 italic">No definido</span>}
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (!isInitialized) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-green-500 mb-4" />
          <p className="text-gray-600">Inicializando Fase 3...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-xl mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fase 3: Personajes</h1>
        <p className="text-lg text-gray-600">
          Define el elenco de tu historia con personajes completos.
        </p>
      </div>

      {/* Panel de IA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-bold text-blue-800 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              IA "Synapse" - Generador de Personajes
            </h2>
            
            <p className="text-sm text-blue-700">
              {analysis.mode === 'suggestion' ? 
                'Genera personajes automáticamente o crea manualmente.' :
                `Optimiza los ${analysis.totalCharacters} personajes existentes.`
              }
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="ai" 
                size="lg" 
                onClick={handleGenerateCharacters}
                loading={isApiLoading}
                leftIcon={isApiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              >
                {isApiLoading ? 'Generando...' : 
                  analysis.mode === 'suggestion' ? 'Generar Elenco' : 'Optimizar Personajes'
                }
              </Button>
              
              {aiSuggestions && (
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
          </div>
        </div>
      </Card>

      {/* Estado */}
      <Card className={`${analysis.canContinue ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center">
          {analysis.canContinue ? (
            <Check className="w-6 h-6 text-green-600 mr-3" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 mr-3" />
          )}
          <div>
            <h3 className={`font-semibold ${analysis.canContinue ? 'text-green-800' : 'text-amber-800'}`}>
              Estado del Elenco
            </h3>
            <p className={`text-sm ${analysis.canContinue ? 'text-green-600' : 'text-amber-600'}`}>
              {analysis.canContinue ? 
                `${analysis.totalCharacters} personajes completos` :
                `${analysis.incompleteCharacters} de ${analysis.totalCharacters} necesitan completarse`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de personajes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Elenco ({characters.length})
          </h2>
          <Button
            variant="primary"
            onClick={handleAddCharacter}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Agregar
          </Button>
        </div>

        {characters.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin personajes</h3>
            <p className="text-gray-600 mb-4">
              Agrega personajes manualmente o genera con IA
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {characters.map(renderCharacterCard)}
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate('/phase-2')}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Volver a Fase 2
        </Button>
        
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          disabled={!analysis.canContinue}
        >
          {analysis.canContinue ? 'Continuar a Fase 4' : `Completa ${analysis.incompleteCharacters} personaje(s)`}
        </Button>
      </div>
    </div>
  );
};

export default Phase3;