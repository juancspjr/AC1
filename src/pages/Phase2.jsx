import React, { useState, useEffect } from 'react';
import { Palette, Target, BookOpen, Settings, ArrowRight, ArrowLeft, Wand2, RefreshCw, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useProject } from '../hooks/useProject';
import { useGeminiApi } from '../hooks/useGeminiApi';
import { useLog } from '../context/LogContext';
import { useNavigate } from 'react-router-dom';

const Phase2 = () => {
  const navigate = useNavigate();
  const { currentProject, updatePhase2, setCurrentPhase } = useProject();
  const { improveIdea, isLoading, error } = useGeminiApi();
  const { addLog } = useLog();
  
  const [formData, setFormData] = useState({
    genre: '',
    style: '',
    structure: '',
    tone: '',
    format: '',
    suggestions: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Definir opciones de géneros
  const genres = [
    {
      id: 'sci-fi',
      name: 'Ciencia Ficción',
      icon: '🚀',
      description: 'Tecnología avanzada, exploración espacial, futurismo',
      example: 'Como en "Blade Runner" o "The Matrix"'
    },
    {
      id: 'fantasy',
      name: 'Fantasía',
      icon: '✨',
      description: 'Magia, criaturas místicas, mundos imaginarios',
      example: 'Como en "El Señor de los Anillos" o "Harry Potter"'
    },
    {
      id: 'thriller',
      name: 'Thriller',
      icon: '🔪',
      description: 'Suspenso, misterio, tensión constante',
      example: 'Como en "Gone Girl" o "El Silencio de los Corderos"'
    },
    {
      id: 'romance',
      name: 'Romance',
      icon: '💖',
      description: 'Amor, relaciones, emociones intensas',
      example: 'Como en "Orgullo y Prejuicio" o "The Notebook"'
    },
    {
      id: 'drama',
      name: 'Drama',
      icon: '🎭',
      description: 'Conflictos humanos, emociones profundas',
      example: 'Como en "Forrest Gump" o "The Shawshank Redemption"'
    },
    {
      id: 'horror',
      name: 'Horror',
      icon: '👻',
      description: 'Miedo, suspenso, elementos sobrenaturales',
      example: 'Como en "El Exorcista" o "Hereditary"'
    },
    {
      id: 'adventure',
      name: 'Aventura',
      icon: '🏔️',
      description: 'Expediciones, exploración, acción',
      example: 'Como en "Indiana Jones" o "Piratas del Caribe"'
    },
    {
      id: 'literary',
      name: 'Literatura',
      icon: '📚',
      description: 'Prosa elaborada, reflexiones profundas',
      example: 'Como en "Cien Años de Soledad" o "1984"'
    }
  ];
  
  // Definir estilos de narración
  const styles = [
    {
      id: 'first-person',
      name: 'Primera Persona',
      description: 'Narrado desde "Yo"',
      example: '"Yo caminaba por la calle cuando.."',
      icon: '🗣️'
    },
    {
      id: 'third-person',
      name: 'Tercera Persona',
      description: 'Narrado desde "Él/Ella"',
      example: '"Ana caminaba por la calle cuando.."',
      icon: '👁️'
    },
    {
      id: 'omniscient',
      name: 'Omnisciente',
      description: 'Narrador que conoce todo',
      example: '"Mientras Ana caminaba, no sabía que Tom la observaba"',
      icon: '🌐'
    },
    {
      id: 'multiple',
      name: 'Múltiples POV',
      description: 'Varios puntos de vista',
      example: 'Capítulos alternando entre personajes',
      icon: '🔄'
    }
  ];
  
  // Definir estructuras narrativas
  const structures = [
    {
      id: 'linear',
      name: 'Lineal',
      description: 'Cronológica, de principio a fin',
      icon: '➡️'
    },
    {
      id: 'flashback',
      name: 'Flashbacks',
      description: 'Saltos al pasado',
      icon: '⏪'
    },
    {
      id: 'circular',
      name: 'Circular',
      description: 'Termina donde empezó',
      icon: '🔄'
    },
    {
      id: 'parallel',
      name: 'Tramas Paralelas',
      description: 'Múltiples historias simultáneas',
      icon: '∦'
    },
    {
      id: 'fragmented',
      name: 'Fragmentada',
      description: 'Piezas que se conectan gradualmente',
      icon: '🧩'
    }
  ];
  
  // Definir tonos
  const tones = [
    {
      id: 'dark',
      name: 'Oscuro',
      description: 'Melancólico, sombrío',
      icon: '🌑',
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'hopeful',
      name: 'Esperanzador',
      description: 'Optimista, inspirador',
      icon: '☀️',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'humorous',
      name: 'Humorístico',
      description: 'Divertido, irónico',
      icon: '😄',
      color: 'from-green-400 to-blue-500'
    },
    {
      id: 'mysterious',
      name: 'Misterioso',
      description: 'Enigmático, intrigante',
      icon: '🔍',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'emotional',
      name: 'Emocional',
      description: 'Intenso, conmovedor',
      icon: '💔',
      color: 'from-pink-500 to-red-500'
    },
    {
      id: 'epic',
      name: 'Épico',
      description: 'Grandioso, heroico',
      icon: '⚔️',
      color: 'from-amber-500 to-red-600'
    }
  ];
  
  // Definir formatos
  const formats = [
    {
      id: 'short-story',
      name: 'Cuento Corto',
      description: '1,000 - 5,000 palabras',
      duration: '10-20 min de lectura',
      icon: '📝'
    },
    {
      id: 'novelette',
      name: 'Novela Corta',
      description: '5,000 - 20,000 palabras',
      duration: '30-60 min de lectura',
      icon: '📖'
    },
    {
      id: 'novel',
      name: 'Novela',
      description: '20,000 - 100,000 palabras',
      duration: '2-8 horas de lectura',
      icon: '📚'
    },
    {
      id: 'series',
      name: 'Serie/Capítulos',
      description: 'Múltiples entregas',
      duration: 'Expandible',
      icon: '📜'
    }
  ];
  
  useEffect(() => {
    setCurrentPhase(2);
    addLog('info', 'Iniciando Fase 2: Estilo y Formato');
    
    // Verificar si tenemos datos de Fase 1
    if (!currentProject?.phase1Data) {
      addLog('warning', 'No se encontraron datos de Fase 1. Redirigiendo...');
      navigate('/phase-1');
      return;
    }
    
    // Cargar datos existentes si es continuación
    if (currentProject?.phase2Data) {
      setFormData(currentProject.phase2Data);
      addLog('info', 'Datos existentes de Fase 2 cargados');
    }
    
    addLog('success', `Idea base: "${currentProject.phase1Data.idea.substring(0, 50)}..."`);
  }, [currentProject, setCurrentPhase, addLog, navigate]);
  
  const handleSelectionChange = (category, value) => {
    setFormData(prev => ({ ...prev, [category]: value }));
    addLog('info', `${category} seleccionado: ${value}`);
  };
  
  const handleGenerateSuggestions = async () => {
    if (!currentProject?.phase1Data?.idea) {
      addLog('warning', 'No se puede generar sin datos de Fase 1');
      return;
    }
    
    setIsGenerating(true);
    addLog('info', 'Generando sugerencias con Gemini 2.5 Flash...');
    
    try {
      const prompt = `Basado en esta idea narrativa: "${currentProject.phase1Data.idea}"

Y considerando:
- Audiencia: ${currentProject.phase1Data.targetAudience || 'General'}
- Elementos: ${currentProject.phase1Data.keyElements || 'Variados'}

Sugiere la mejor combinación de:
1. Género narrativo
2. Estilo de narración
3. Estructura
4. Tono
5. Formato

Explica brevemente por qué esta combinación funcionaría bien para esta historia.`;
      
      const result = await improveIdea(prompt, {
        temperature: 0.7,
        maxOutputTokens: 600
      });
      
      setFormData(prev => ({ ...prev, suggestions: result.improvedIdea }));
      setShowSuggestions(true);
      addLog('success', 'Sugerencias generadas exitosamente');
      
    } catch (err) {
      addLog('error', 'Error al generar sugerencias', err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleContinue = () => {
    if (!formData.genre || !formData.style || !formData.structure || !formData.tone || !formData.format) {
      addLog('warning', 'Por favor completa todas las secciones antes de continuar');
      return;
    }
    
    const phase2Data = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    updatePhase2(phase2Data);
    addLog('success', 'Fase 2 completada, avanzando a Fase 3');
    navigate('/phase-3');
  };
  
  const handleGoBack = () => {
    navigate('/phase-1');
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl mb-4">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Fase 2: Estilo y Formato</h1>
        <p className="text-lg text-gray-600">
          Configura el estilo narrativo y formato de tu historia. Gemini te ayudará con sugerencias personalizadas.
        </p>
        
        {/* Breadcrumb */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span className="text-green-600">Fase 1: Idea ✓</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-purple-600 font-semibold">Fase 2: Estilo</span>
          <ArrowRight className="w-4 h-4" />
          <span>Fase 3: Historia</span>
        </div>
      </div>
      
      {/* Contexto de Fase 1 */}
      {currentProject?.phase1Data && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <BookOpen className="w-5 h-5 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tu idea de Fase 1:</h3>
              <p className="text-blue-800 text-sm italic">"${currentProject.phase1Data.idea}"</p>
              <p className="text-blue-600 text-xs mt-2">
                🎯 {currentProject.phase1Data.targetAudience} • 🔑 {currentProject.phase1Data.keyElements}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Botón de sugerencias IA */}
      <div className="text-center">
        <Button
          variant="ai"
          size="lg"
          onClick={handleGenerateSuggestions}
          disabled={isGenerating}
          loading={isGenerating}
          leftIcon={isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
        >
          {isGenerating ? 'Generando sugerencias...' : 'Obtener sugerencias con IA'}
        </Button>
      </div>
      
      {/* Sugerencias de IA */}
      {showSuggestions && formData.suggestions && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start">
            <Sparkles className="w-5 h-5 text-purple-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-3">Sugerencias de Gemini 2.5 Flash:</h3>
              <div className="text-purple-800 text-sm whitespace-pre-wrap">{formData.suggestions}</div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Selección de Género */}
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Target className="w-6 h-6 mr-2 text-emerald-600" />
          1. Selecciona el Género Narrativo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.id}
              onClick={() => handleSelectionChange('genre', genre.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                formData.genre === genre.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                  : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="text-2xl mb-2">{genre.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{genre.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{genre.description}</p>
              <p className="text-xs text-gray-500 italic">{genre.example}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Selección de Estilo */}
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          2. Elige el Estilo de Narración
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {styles.map((style) => (
            <div
              key={style.id}
              onClick={() => handleSelectionChange('style', style.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                formData.style === style.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{style.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{style.name}</h3>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm italic text-gray-700">{style.example}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Selección de Estructura */}
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">3. Estructura Narrativa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {structures.map((structure) => (
            <div
              key={structure.id}
              onClick={() => handleSelectionChange('structure', structure.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                formData.structure === structure.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="text-2xl mb-2">{structure.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{structure.name}</h3>
              <p className="text-sm text-gray-600">{structure.description}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Selección de Tono */}
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">4. Tono y Ambiente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tones.map((tone) => (
            <div
              key={tone.id}
              onClick={() => handleSelectionChange('tone', tone.id)}
              className={`relative overflow-hidden p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                formData.tone === tone.id
                  ? 'border-amber-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-amber-300 hover:shadow-md'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${tone.color} opacity-10`}></div>
              <div className="relative">
                <div className="text-2xl mb-2">{tone.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{tone.name}</h3>
                <p className="text-sm text-gray-600">{tone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Selección de Formato */}
      <Card padding="lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">5. Formato Final</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formats.map((format) => (
            <div
              key={format.id}
              onClick={() => handleSelectionChange('format', format.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                formData.format === format.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="text-2xl mb-2">{format.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{format.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{format.description}</p>
              <p className="text-xs text-gray-500">{format.duration}</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Resumen de Selección */}
      {(formData.genre || formData.style || formData.structure || formData.tone || formData.format) && (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu configuración:</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-medium text-emerald-700">Género:</span>
              <p className="text-gray-600">{formData.genre ? genres.find(g => g.id === formData.genre)?.name : 'No seleccionado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Estilo:</span>
              <p className="text-gray-600">{formData.style ? styles.find(s => s.id === formData.style)?.name : 'No seleccionado'}</p>
            </div>
            <div>
              <span className="font-medium text-purple-700">Estructura:</span>
              <p className="text-gray-600">{formData.structure ? structures.find(s => s.id === formData.structure)?.name : 'No seleccionado'}</p>
            </div>
            <div>
              <span className="font-medium text-amber-700">Tono:</span>
              <p className="text-gray-600">{formData.tone ? tones.find(t => t.id === formData.tone)?.name : 'No seleccionado'}</p>
            </div>
            <div>
              <span className="font-medium text-indigo-700">Formato:</span>
              <p className="text-gray-600">{formData.format ? formats.find(f => f.id === formData.format)?.name : 'No seleccionado'}</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="lg"
          onClick={handleGoBack}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Volver a Fase 1
        </Button>
        
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          disabled={!formData.genre || !formData.style || !formData.structure || !formData.tone || !formData.format}
        >
          Continuar a Fase 3
        </Button>
      </div>
    </div>
  );
};

export default Phase2;