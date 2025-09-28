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
        maxOutputTokens: options.maxOutputTokens || 1000, // Aumentado significativamente
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

      // === EXTRACCIÓN ROBUSTA DEL TEXTO CON MÚLTIPLES MÉTODOS ===
      addLog('info', '🔍 Analizando estructura de respuesta del SDK...');
      
      let generatedText = '';
      
      // Método 1: Acceso directo (SDK oficial)
      if (response && response.text) {
        generatedText = response.text;
        addLog('success', '✅ Texto extraído con response.text (método directo del SDK)');
      }
      // Método 2: Acceso manual a candidates (estructura raw)
      else if (response && response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          // Buscar la primera parte que no sea "thought"
          for (const part of candidate.content.parts) {
            if (part.text && !part.thought) {
              generatedText = part.text;
              addLog('success', '✅ Texto extraído con candidates[0].content.parts[0].text (método manual)');
              break;
            }
          }
        }
        
        // Si aún no encontramos texto pero hay finishReason MAX_TOKENS
        if (!generatedText && candidate.finishReason === 'MAX_TOKENS') {
          addLog('warning', '⚠️ MAX_TOKENS detectado, reintentando con configuración optimizada...');
          
          // Reintentar con thinking deshabilitado y más tokens
          return await callGemini(prompt, {
            ...options,
            maxOutputTokens: 1500,
            disableThinking: true
          });
        }
      }
      // Método 3: Acceso a response raw completa
      else if (response && typeof response === 'object') {
        addLog('info', '🔍 Explorando estructura completa de respuesta...', {
          responseKeys: Object.keys(response),
          responseType: typeof response,
          responseStructure: JSON.stringify(response, null, 2)
        });
        
        // Buscar texto en cualquier parte de la estructura
        function findTextInObject(obj, path = '') {
          if (typeof obj === 'string' && obj.length > 10) {
            return obj;
          }
          if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
              const result = findTextInObject(value, path + '.' + key);
              if (result) {
                addLog('success', `✅ Texto encontrado en: ${path}.${key}`);
                return result;
              }
            }
          }
          return null;
        }
        
        generatedText = findTextInObject(response);
      }

      // === VALIDACIÓN FINAL DEL TEXTO EXTRAÍDO ===
      if (!generatedText || generatedText.trim() === '') {
        addLog('error', '❌ No se pudo extraer texto de la respuesta del SDK', {
          responseCompleta: response,
          candidatesLength: response?.candidates?.length || 0,
          finishReason: response?.candidates?.[0]?.finishReason || 'N/A',
          contentStructure: response?.candidates?.[0]?.content || 'N/A',
          possibleSolutions: [
            'Verificar estructura de respuesta del SDK',
            'Actualizar @google/genai a versión más reciente',
            'Probar con diferentes parámetros de configuración'
          ]
        });
        throw new Error('❌ No se pudo extraer texto de Gemini 2.5 Flash');
      }
      
      addLog('success', `🎯 ¡Texto extraído exitosamente!`, {
        longitudTexto: generatedText.length,
        tiempoTotal: `${responseTime}ms`,
        preview: `${generatedText.substring(0, 120)}${generatedText.length > 120 ? '...' : ''}`,
        estadisticas: {
          palabras: generatedText.split(' ').length,
          lineas: generatedText.split('\n').length,
          caracteres: generatedText.length
        },
        metodoExtraccion: 'SDK oficial'
      });
      
      return {
        text: generatedText.trim(),
        responseTime: responseTime,
        model: model,
        sdk: '@google/genai'
      };

    } catch (err) {
      const finalTime = Date.now() - startTime;
      let errorMessage = err.message || 'Error desconocido al llamar Gemini 2.5';
      
      addLog('error', `🔴 Error final: ${errorMessage}`, {
        tiempoTranscurrido: `${finalTime}ms`,
        errorOriginal: err.toString(),
        configuracionUsada: {
          modelo: model,
          apiKeyLength: apiKey?.length,
          sdkUsado: '@google/genai v1.0.0'
        }
      });
      
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
    const prompt = `Como experto en narrativa, mejora esta idea:

"${idea}"

${context.targetAudience ? `Audiencia: ${context.targetAudience}\n` : ''}${context.keyElements ? `Elementos: ${context.keyElements}\n` : ''}
Devuelve 2 partes separadas por <break>:
1. Idea mejorada (máximo 50 palabras)
2. Lista de elementos clave`;

    try {
      addLog('info', '✨ Mejorando idea con Gemini 2.5 Flash...');
      const result = await callGemini(prompt, {
        temperature: 0.8,
        maxOutputTokens: 600,
        disableThinking: true // Velocidad para ideas rápidas
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
        maxOutputTokens: 400,
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