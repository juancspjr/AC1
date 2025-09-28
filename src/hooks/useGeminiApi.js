import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLog } from '../context/LogContext';

// Hook para integración directa con Gemini 2.5 Flash usando SDK oficial
export const useGeminiApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addLog } = useLog();

  const callGemini = useCallback(async (prompt, options = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const model = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.5-flash';
    const startTime = Date.now();

    // === VALIDACIÓN COMPLETA DE CONFIGURACIÓN ===
    addLog('info', '🔍 Validando configuración Gemini 2.5 Flash...');
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'tu_gemini_api_key' || apiKey.startsWith('AIza...')) {
      const errorMsg = '❌ API Key de Gemini no configurada correctamente';
      const errorDetails = {
        problema: 'API Key faltante o es placeholder',
        archivo: '.env (en la raíz del proyecto)',
        variable: 'REACT_APP_GEMINI_API_KEY',
        formato: 'REACT_APP_GEMINI_API_KEY="AIzaSy..."',
        obtencion: 'https://aistudio.google.com/app/apikey',
        longitud: apiKey ? apiKey.length : 0,
        preview: apiKey ? `${apiKey.substring(0, 8)}...` : 'N/A'
      };
      addLog('error', errorMsg, errorDetails);
      throw new Error(errorMsg);
    }

    addLog('success', `✅ API Key válida detectada (${apiKey.length} chars)`);
    addLog('info', `🤖 Modelo configurado: ${model}`);

    setIsLoading(true);
    setError(null);

    try {
      // === INICIALIZAR SDK OFICIAL GOOGLE GENAI ===
      addLog('info', '🚀 Inicializando SDK oficial @google/genai...');
      
      const ai = new GoogleGenAI({
        apiKey: apiKey
      });

      addLog('info', '📝 Preparando prompt...', {
        longitudPrompt: prompt.length,
        preview: `${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`,
        modelo: model
      });

      // === CONFIGURACIÓN OPTIMIZADA PARA GEMINI 2.5 FLASH ===
      const config = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 800, // Aumentado para Gemini 2.5
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        // Configuración específica para Gemini 2.5 Flash
        thinkingConfig: {
          thinkingBudget: options.disableThinking ? 0 : undefined // Permite thinking por defecto
        }
      };

      addLog('info', '🌐 Enviando request a Gemini 2.5 Flash con SDK oficial...', {
        modelo: model,
        maxTokens: config.maxOutputTokens,
        temperatura: config.temperature,
        thinkingEnabled: config.thinkingConfig.thinkingBudget !== 0
      });
      
      // === LLAMADA CON SDK OFICIAL ===
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config
      });

      const responseTime = Date.now() - startTime;
      addLog('success', `🎉 Respuesta recibida en ${responseTime}ms`, {
        tiempoRespuesta: `${responseTime}ms`,
        modelo: model,
        sdkVersion: '@google/genai v1.0.0'
      });

      // === VALIDAR Y EXTRAER TEXTO ===
      if (!response || !response.text) {
        addLog('error', '❌ SDK retornó respuesta vacía', {
          responseObject: response,
          tipoResponse: typeof response,
          propiedadesDisponibles: response ? Object.keys(response) : []
        });
        throw new Error('❌ Respuesta vacía del SDK oficial');
      }

      const generatedText = response.text.trim();
      
      if (!generatedText || generatedText === '') {
        addLog('error', '❌ Texto generado está vacío', {
          responseCompleta: response,
          longitudTexto: generatedText.length
        });
        throw new Error('❌ Gemini 2.5 retornó texto vacío');
      }
      
      addLog('success', `🎯 ¡Texto generado exitosamente!`, {
        longitudTexto: generatedText.length,
        tiempoTotal: `${responseTime}ms`,
        preview: `${generatedText.substring(0, 120)}${generatedText.length > 120 ? '...' : ''}`,
        estadisticas: {
          palabras: generatedText.split(' ').length,
          lineas: generatedText.split('\n').length,
          caracteres: generatedText.length
        }
      });
      
      return {
        text: generatedText,
        responseTime: responseTime,
        model: model,
        sdk: '@google/genai'
      };

    } catch (err) {
      const finalTime = Date.now() - startTime;
      let errorMessage = err.message || 'Error desconocido al llamar Gemini 2.5';
      
      // Análisis específico del error
      let errorAnalysis = {
        tiempoTranscurrido: `${finalTime}ms`,
        errorOriginal: err.toString(),
        configuracionUsada: {
          modelo: model,
          apiKeyLength: apiKey?.length,
          sdkUsado: '@google/genai v1.0.0'
        }
      };

      // Errores específicos del SDK oficial
      if (err.message?.includes('API key')) {
        errorMessage = '🔑 Error de API Key con SDK oficial';
        errorAnalysis.solucion = 'Verificar REACT_APP_GEMINI_API_KEY en archivo .env';
      } else if (err.message?.includes('model')) {
        errorMessage = '🤖 Error de modelo con Gemini 2.5';
        errorAnalysis.solucion = 'Verificar que gemini-2.5-flash esté disponible en tu región';
      } else if (err.message?.includes('quota') || err.message?.includes('limit')) {
        errorMessage = '📊 Límite de cuota o rate excedido';
        errorAnalysis.solucion = 'Esperar un momento o verificar cuota de API';
      }
      
      addLog('error', `🔴 Error final: ${errorMessage}`, errorAnalysis);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      addLog('info', '🏁 Finalizando llamada a Gemini 2.5 Flash');
    }
  }, [addLog]);

  // Función específica para mejorar ideas narrativas con Gemini 2.5 Flash
  const improveIdea = useCallback(async (idea, context = {}) => {
    // Prompt optimizado para Gemini 2.5 Flash
    const prompt = `Como experto en narrativa, mejora esta idea:\n\n"${idea}"\n\n${context.targetAudience ? `Audiencia: ${context.targetAudience}\n` : ''}${context.keyElements ? `Elementos: ${context.keyElements}\n` : ''}\nDevuelve 2 partes separadas por <break>:\n1. Idea mejorada (máximo 50 palabras)\n2. Lista de elementos clave`;

    try {
      addLog('info', '✨ Mejorando idea con Gemini 2.5 Flash...');
      const result = await callGemini(prompt, {
        temperature: 0.8,
        maxOutputTokens: 400,
        disableThinking: false // Permitir thinking para mejor calidad
      });
      
      addLog('success', '🎯 Idea mejorada exitosamente con Gemini 2.5');
      return {
        improvedIdea: result.text.trim(),
        originalIdea: idea,
        metadata: result
      };
    } catch (error) {
      addLog('error', '❌ Error al mejorar idea con Gemini 2.5', {
        ideaOriginal: idea,
        contexto: context,
        errorDetalle: error.message
      });
      throw error;
    }
  }, [callGemini, addLog]);

  // Función para sugerir elementos adicionales
  const suggestElements = useCallback(async (idea, type = 'narrative') => {
    const prompts = {
      narrative: `Para: "${idea}", sugiere 5 elementos narrativos clave.`,
      characters: `Para: "${idea}", sugiere 3 personajes principales.`,
      settings: `Para: "${idea}", sugiere 3 escenarios ideales.`
    };

    try {
      addLog('info', `🎭 Generando sugerencias de ${type} con Gemini 2.5...`);
      const result = await callGemini(prompts[type] || prompts.narrative, {
        temperature: 0.9,
        maxOutputTokens: 300,
        disableThinking: true // Velocidad para sugerencias
      });
      
      return result.text.trim();
    } catch (error) {
      addLog('error', `❌ Error al sugerir ${type}`, {
        tipo: type,
        idea: idea,
        errorDetalle: error.message
      });
      throw error;
    }
  }, [callGemini, addLog]);

  return {
    isLoading,
    error,
    callGemini,
    improveIdea,
    suggestElements
  };
};