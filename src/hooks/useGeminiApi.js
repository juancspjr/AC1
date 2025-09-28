import { useState, useCallback } from 'react';
import { useLog } from '../context/LogContext';

// Hook para integración directa con Gemini API con debugging completo
export const useGeminiApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addLog } = useLog();

  const callGemini = useCallback(async (prompt, options = {}) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const model = process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash';
    const startTime = Date.now();

    // === VALIDACIÓN COMPLETA DE CONFIGURACIÓN ===
    addLog('info', '🔍 Iniciando validación de configuración Gemini...');
    
    // Validar API Key
    const apiKeyStatus = {
      exists: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      format: apiKey ? (apiKey.startsWith('AIza') ? 'Válido' : 'Formato incorrecto') : 'No encontrada',
      placeholder: apiKey === 'tu_gemini_api_key' || apiKey === 'AIza...' ? 'Es placeholder' : 'Es real'
    };
    
    addLog('info', `🔑 API Key detectada: ${apiKeyStatus.exists ? '✅ SÍ' : '❌ NO'}`, {
      length: apiKeyStatus.length,
      format: apiKeyStatus.format,
      placeholder: apiKeyStatus.placeholder,
      firstChars: apiKey ? `${apiKey.substring(0, 8)}...` : 'N/A',
      file: 'Verificar archivo .env en raíz del proyecto'
    });
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'tu_gemini_api_key' || apiKey === 'AIza...') {
      const errorMsg = '❌ API Key de Gemini no configurada correctamente';
      const errorDetails = {
        problema: 'API Key faltante o es placeholder',
        archivo: '.env (en la raíz del proyecto)',
        variable: 'REACT_APP_GEMINI_API_KEY',
        formato: 'REACT_APP_GEMINI_API_KEY="AIzaSy..."',
        obtencion: 'https://makersuite.google.com/app/apikey',
        solucion: 'Crea/actualiza el archivo .env con tu API Key real'
      };
      addLog('error', errorMsg, errorDetails);
      throw new Error(errorMsg);
    }

    if (apiKey.length < 35) {
      const errorMsg = '❌ API Key parece inválida (muy corta)';
      addLog('error', errorMsg, {
        longitud: apiKey.length,
        esperada: 'Entre 35-45 caracteres',
        formato: 'Debe empezar con "AIza"'
      });
      throw new Error(errorMsg);
    }

    // Validar modelo
    const validModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-flash'];
    addLog('info', `🤖 Modelo configurado: ${model}`, {
      esValido: validModels.includes(model),
      modelosDisponibles: validModels,
      recomendado: 'gemini-1.5-flash'
    });

    setIsLoading(true);
    setError(null);
    addLog('success', `✅ Configuración válida - Iniciando llamada a ${model}`);
    addLog('info', `📝 Prompt enviado (${prompt.length} caracteres)`, {
      preview: `${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`,
      longitudTotal: prompt.length
    });

    try {
      // === PREPARAR REQUEST ===
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
      addLog('info', '🌐 Enviando request a Google Gemini API...', {
        endpoint: endpoint.replace(apiKey, 'KEY_OCULTA'),
        modelo: model,
        configuracion: requestBody.generationConfig,
        seguridad: 'Filtros activados'
      });
      
      // === HACER LLAMADA A API ===
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseTime = Date.now() - startTime;
      addLog('info', `📡 Respuesta HTTP recibida en ${responseTime}ms`, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        },
        tiempoRespuesta: `${responseTime}ms`
      });

      // === MANEJAR ERRORES HTTP ===
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        addLog('error', `🚨 Error HTTP ${response.status}: ${response.statusText}`, {
          codigoHTTP: response.status,
          mensaje: response.statusText,
          respuestaCompleta: errorData,
          endpoint: endpoint.replace(apiKey, 'KEY_OCULTA'),
          posiblesSoluciones: {
            400: 'Modelo inválido o request malformado',
            401: 'API Key inválida o expirada',
            403: 'API Key sin permisos o cuota excedida',
            429: 'Rate limit excedido - espera un momento',
            500: 'Error interno de Google - intenta más tarde'
          }[response.status] || 'Error desconocido'
        });
        
        if (response.status === 400) {
          throw new Error(`❌ Error 400: Verificar modelo '${model}' y formato del request`);
        } else if (response.status === 403) {
          throw new Error('❌ Error 403: API Key inválida o sin permisos');
        } else if (response.status === 429) {
          throw new Error('❌ Error 429: Límite de rate excedido, intenta más tarde');
        } else {
          throw new Error(`❌ Error ${response.status}: ${response.statusText}`);
        }
      }

      // === PROCESAR RESPUESTA EXITOSA ===
      const data = await response.json();
      addLog('success', '🎉 Respuesta JSON válida recibida de Gemini');
      addLog('info', '📊 Analizando respuesta de Gemini...', {
        estructuraCompleta: data,
        candidatos: data.candidates?.length || 0,
        metadataUso: data.usageMetadata || 'No disponible'
      });

      // === VALIDAR ESTRUCTURA DE RESPUESTA ===
      if (!data.candidates || data.candidates.length === 0) {
        addLog('error', '❌ Gemini retornó respuesta vacía (sin candidatos)', {
          respuestaCompleta: data,
          posiblesCausas: [
            'Prompt bloqueado por filtros de seguridad',
            'Modelo sobrecargado temporalmente',
            'Request malformado',
            'Límites de contenido excedidos'
          ]
        });
        throw new Error('❌ Gemini no retornó candidatos de respuesta');
      }

      const candidate = data.candidates[0];
      addLog('info', '🔍 Validando candidato de respuesta...', {
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        tieneContenido: !!(candidate.content && candidate.content.parts)
      });
      
      if (candidate.finishReason === 'SAFETY') {
        addLog('warning', '⚠️ Respuesta bloqueada por filtros de seguridad de Google', {
          razon: candidate.finishReason,
          safetyRatings: candidate.safetyRatings,
          sugerencia: 'Intenta con un prompt más neutro o específico'
        });
        throw new Error('⚠️ Contenido bloqueado por filtros de seguridad de Gemini');
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        addLog('error', '❌ Estructura de respuesta de Gemini malformada', {
          candidatoCompleto: candidate,
          contenidoRecibido: candidate.content,
          partesEncontradas: candidate.content?.parts?.length || 0,
          estructuraEsperada: {
            content: {
              parts: [{ text: 'respuesta aquí' }]
            }
          }
        });
        throw new Error('❌ Respuesta de Gemini vacía o malformada');
      }

      // === EXTRAER TEXTO FINAL ===
      const generatedText = candidate.content.parts[0].text;
      const finalTime = Date.now() - startTime;
      
      addLog('success', `🎉 ¡Texto generado exitosamente en ${finalTime}ms!`, {
        longitudTexto: generatedText.length,
        tiempoTotal: `${finalTime}ms`,
        finishReason: candidate.finishReason,
        usageMetadata: data.usageMetadata,
        preview: `${generatedText.substring(0, 150)}${generatedText.length > 150 ? '...' : ''}`,
        caracteristicas: {
          palabras: generatedText.split(' ').length,
          lineas: generatedText.split('\n').length,
          caracteres: generatedText.length
        }
      });
      
      return {
        text: generatedText,
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        usageMetadata: data.usageMetadata,
        responseTime: finalTime
      };

    } catch (err) {
      const finalTime = Date.now() - startTime;
      const errorMessage = err.message || 'Error desconocido al llamar Gemini';
      
      addLog('error', `🔴 Error final después de ${finalTime}ms: ${errorMessage}`, {
        errorCompleto: err,
        stackTrace: err.stack,
        tiempoTranscurrido: `${finalTime}ms`,
        configuracionUsada: {
          modelo: model,
          apiKeyLength: apiKey?.length,
          endpoint: endpoint?.replace(apiKey, 'KEY_OCULTA')
        },
        debugging: {
          verificarEnv: 'Revisar archivo .env en raíz del proyecto',
          verificarModelo: `Modelo '${model}' debe ser válido`,
          verificarApiKey: 'API Key debe empezar con AIza y tener 35+ chars',
          verificarRed: 'Conexión a internet y firewall'
        }
      });
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      addLog('info', '🏁 Finalizando llamada a Gemini API');
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
      addLog('info', '📝 Iniciando mejora de idea narrativa con Gemini...');
      const result = await callGemini(prompt, {
        temperature: 0.8,
        maxOutputTokens: 300
      });
      
      addLog('success', '✨ Idea mejorada exitosamente');
      return {
        improvedIdea: result.text.trim(),
        originalIdea: idea,
        metadata: result
      };
    } catch (error) {
      addLog('error', '❌ Error al mejorar idea con Gemini', {
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
      narrative: `Basándote en esta idea: "${idea}", sugiere 5 elementos narrativos clave (temas, conflictos, símbolos) que enriquecerían la historia.`,
      characters: `Para esta historia: "${idea}", sugiere 3 tipos de personajes principales que serían ideales.`,
      settings: `Considerando esta narrativa: "${idea}", sugiere 3 escenarios o ambientaciones que complementarían la historia.`
    };

    try {
      addLog('info', `🎭 Generando sugerencias de ${type}...`);
      const result = await callGemini(prompts[type] || prompts.narrative, {
        temperature: 0.9,
        maxOutputTokens: 200
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