import { useState, useCallback } from 'react';
import { useLog } from '../context/LogContext';

// Hook para integración directa con Gemini API
export const useGeminiApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addLog } = useLog();

  const callGemini = useCallback(async (prompt, options = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const model = process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash';

    addLog('info', `Verificando configuración...`);
    addLog('info', `API Key detectada: ${apiKey ? 'SÍ ✅' : 'NO ❌'}`);
    addLog('info', `Modelo configurado: ${model}`);
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'tu_gemini_api_key') {
      const errorMsg = 'API Key de Gemini no configurada en .env. Verifica que REACT_APP_GEMINI_API_KEY esté en tu archivo .env';
      addLog('error', errorMsg);
      addLog('warning', 'Asegúrate de que tu archivo .env contenga: REACT_APP_GEMINI_API_KEY="AIzaSy..."');
      throw new Error(errorMsg);
    }

    if (apiKey.length < 30) {
      const errorMsg = 'API Key de Gemini parece inválida (muy corta)';
      addLog('error', errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);
    addLog('success', `Configuración válida, iniciando llamada a ${model}...`);
    addLog('info', `Prompt (${prompt.length} chars): "${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''}"`);

    try {
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      addLog('info', `Endpoint: ${endpoint.replace(apiKey, 'KEY_OCULTA')}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      addLog('info', `Response HTTP: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.text();
        addLog('error', `Error HTTP ${response.status}`, errorData);
        
        if (response.status === 400) {
          addLog('error', `Modelo '${model}' puede ser inválido. Modelos válidos: gemini-1.5-flash, gemini-1.5-pro, gemini-pro`);
          throw new Error(`Error 400: Verificar modelo '${model}' y formato del request`);
        } else if (response.status === 403) {
          addLog('error', 'API Key rechazada por Google. Verifica que sea correcta y tenga permisos.');
          throw new Error('Error 403: API Key inválida o sin permisos');
        } else if (response.status === 429) {
          throw new Error('Error 429: Límite de rate excedido, intenta más tarde');
        } else {
          throw new Error(`Error ${response.status}: ${errorData}`);
        }
      }

      const data = await response.json();
      addLog('success', 'Respuesta JSON recibida de Gemini');
      addLog('info', `Candidatos recibidos: ${data.candidates?.length || 0}`);
      
      if (data.usageMetadata) {
        addLog('info', `Tokens usados: ${JSON.stringify(data.usageMetadata)}`);
      }

      if (!data.candidates || data.candidates.length === 0) {
        addLog('error', 'Gemini retornó respuesta vacía (sin candidatos)');
        addLog('warning', 'Posibles causas: prompt bloqueado por filtros, modelo sobrecargado');
        throw new Error('Gemini no retornó candidatos de respuesta');
      }

      const candidate = data.candidates[0];
      
      if (candidate.finishReason === 'SAFETY') {
        addLog('warning', 'Respuesta bloqueada por filtros de seguridad de Google');
        addLog('info', 'Intenta con un prompt más neutro o específico');
        throw new Error('Contenido bloqueado por filtros de seguridad de Gemini');
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        addLog('error', 'Estructura de respuesta de Gemini malformada');
        addLog('info', `Respuesta recibida: ${JSON.stringify(candidate, null, 2)}`);
        throw new Error('Respuesta de Gemini vacía o malformada');
      }

      const generatedText = candidate.content.parts[0].text;
      addLog('success', `✅ Texto generado exitosamente (${generatedText.length} caracteres)`);
      
      return {
        text: generatedText,
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        usageMetadata: data.usageMetadata
      };

    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al llamar Gemini';
      addLog('error', `🔴 Error final: ${errorMessage}`);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      addLog('info', 'Finalizando llamada a Gemini API');
    }
  }, [addLog]);

  // Función específica para mejorar ideas narrativas
  const improveIdea = useCallback(async (idea, context = {}) => {
    const prompt = `
Como experto en narrativa y storytelling, mejora la siguiente idea para hacerla más atractiva, clara y estructurada:

Idea original: "${idea}"

${context.projectType ? `Tipo de proyecto: ${context.projectType}` : ''}
${context.targetAudience ? `Público objetivo: ${context.targetAudience}` : ''}
${context.keyElements ? `Elementos clave: ${context.keyElements}` : ''}

Proporciona una versión mejorada que:
1. Sea más específica y concreta
2. Tenga mayor potencial narrativo
3. Incluya elementos que generen interés
4. Mantenga la esencia original
5. Sea adecuada para el formato y audiencia especificados

Respuesta (máximo 200 palabras):`;

    try {
      const result = await callGemini(prompt, {
        temperature: 0.8,
        maxOutputTokens: 300
      });
      
      return {
        improvedIdea: result.text.trim(),
        originalIdea: idea,
        metadata: result
      };
    } catch (error) {
      addLog('error', 'Error al mejorar idea con Gemini', error.message);
      throw error;
    }
  }, [callGemini, addLog]);

  // Función para sugerir elementos adicionales
  const suggestElements = useCallback(async (idea, type = 'narrative') => {
    const prompts = {
      narrative: `Basándote en esta idea: "${idea}", sugiere 5 elementos narrativos clave (temas, conflictos, símbolos) que enriquecerían la historia.`,
      characters: `Para esta historia: "${idea}", sugiere 3 tipos de personajes principales que serían ideales.`,
      settings: `Considerando esta narrativa: "${idea}", sugiere 3 escenarios o ambientaciones que complementarían la historia.`
    };

    try {
      const result = await callGemini(prompts[type] || prompts.narrative, {
        temperature: 0.9,
        maxOutputTokens: 200
      });
      
      return result.text.trim();
    } catch (error) {
      addLog('error', `Error al sugerir ${type}`, error.message);
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