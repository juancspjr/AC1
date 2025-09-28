import { useState, useCallback } from 'react';
import axios from 'axios';

// Configuración base para n8n
const N8N_BASE_URL = process.env.REACT_APP_N8N_BASE_URL || 'http://localhost:5678';
const N8N_WEBHOOK_BASE = process.env.REACT_APP_N8N_WEBHOOK_BASE || 'http://localhost:5678/webhook';

// URLs de webhooks específicos
const WEBHOOKS = {
  phase1: process.env.REACT_APP_N8N_WEBHOOK_PHASE1 || '/narrative-generator/phase1',
  phase2: process.env.REACT_APP_N8N_WEBHOOK_PHASE2 || '/narrative-generator/phase2',
  phase3: process.env.REACT_APP_N8N_WEBHOOK_PHASE3 || '/narrative-generator/phase3',
  phase4: process.env.REACT_APP_N8N_WEBHOOK_PHASE4 || '/narrative-generator/phase4',
  coherence: process.env.REACT_APP_N8N_WEBHOOK_COHERENCE || '/narrative-generator/coherence-check',
  series: process.env.REACT_APP_N8N_WEBHOOK_SERIES || '/narrative-generator/series-management'
};

// Hook personalizado para n8n API
export const useN8nApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cliente axios configurado
  const apiClient = axios.create({
    baseURL: N8N_WEBHOOK_BASE,
    timeout: 30000, // 30 seconds timeout for AI operations
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para manejo de errores
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('n8n API Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      setError(errorMessage);
      throw error;
    }
  );

  // Función genérica para llamar webhooks
  const callWebhook = useCallback(async (webhookPath, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(webhookPath, {
        ...data,
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId()
      });

      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  // Fase 1: Mejorar idea con IA
  const generatePhase1 = useCallback(async (data) => {
    return callWebhook(WEBHOOKS.phase1, {
      action: 'improve_idea',
      idea: data.idea,
      projectType: data.projectType,
      parentContext: data.parentContext,
      targetAudience: data.targetAudience,
      keyElements: data.keyElements
    });
  }, [callWebhook]);

  // Fase 2: Sugerencias de estilo
  const generatePhase2 = useCallback(async (data) => {
    return callWebhook(WEBHOOKS.phase2, {
      action: 'suggest_styles',
      improvedIdea: data.improvedIdea,
      projectContext: data.projectContext,
      parentStyles: data.parentStyles,
      userPreferences: data.userPreferences
    });
  }, [callWebhook]);

  // Fase 3: Generar personajes
  const generatePhase3 = useCallback(async (data) => {
    return callWebhook(WEBHOOKS.phase3, {
      action: 'generate_characters',
      projectContext: data.projectContext,
      numberOfCharacters: data.numberOfCharacters || 3,
      existingCharacters: data.existingCharacters || [],
      persistentCharacters: data.persistentCharacters || []
    });
  }, [callWebhook]);

  // Fase 4: Estructura narrativa
  const generatePhase4 = useCallback(async (data) => {
    return callWebhook(WEBHOOKS.phase4, {
      action: 'generate_structure',
      projectContext: data.projectContext,
      characters: data.characters,
      styleData: data.styleData,
      continuityElements: data.continuityElements
    });
  }, [callWebhook]);

  // Análisis de coherencia para series
  const analyzeCoherence = useCallback(async (data) => {
    return callWebhook(WEBHOOKS.coherence, {
      action: 'analyze_coherence',
      currentProject: data.currentProject,
      parentProject: data.parentProject,
      changes: data.changes
    });
  }, [callWebhook]);

  // Gestión de series
  const manageSeries = useCallback(async (data) => {
    return callWebhook(WEBHOOKS.series, {
      action: data.action, // 'create_series', 'add_chapter', 'get_series_data'
      seriesData: data.seriesData,
      projectData: data.projectData
    });
  }, [callWebhook]);

  // Función genérica para generación con IA
  const generateWithAI = useCallback(async (phase, data) => {
    switch (phase) {
      case 'phase1':
        return generatePhase1(data);
      case 'phase2':
        return generatePhase2(data);
      case 'phase3':
        return generatePhase3(data);
      case 'phase4':
        return generatePhase4(data);
      default:
        throw new Error(`Fase no válida: ${phase}`);
    }
  }, [generatePhase1, generatePhase2, generatePhase3, generatePhase4]);

  // Validar conexión con n8n
  const validateConnection = useCallback(async () => {
    try {
      const response = await axios.get(`${N8N_BASE_URL}/healthz`);
      return response.status === 200;
    } catch (error) {
      console.error('n8n connection error:', error);
      return false;
    }
  }, []);

  // Generar ID de sesión único
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return {
    isLoading,
    error,
    generateWithAI,
    generatePhase1,
    generatePhase2,
    generatePhase3,
    generatePhase4,
    analyzeCoherence,
    manageSeries,
    validateConnection,
    callWebhook
  };
};