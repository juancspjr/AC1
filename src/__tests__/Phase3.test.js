import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useMemo } from 'react'; // Para simular useMemo
import Phase3, { parseEnhancedAIResponse, generateEnhancedCharacterPrompt, createEmptyCharacter, analysisMemo } from '../pages/Phase3'; // Exportar funciones para test (agrega exports en Phase3.jsx si necesario: export { parseEnhancedAIResponse, etc. }; export const analysisMemo = (characters) => { /* lógica de useMemo */ }; )

// Mock constants (importar si necesario)
const MOCK_CHARACTER_TYPES = [ /* Copia de CHARACTER_TYPES del archivo */ ];
const MOCK_PROJECT = {
  phase1Data: { idea: 'Test idea', targetAudience: 'Adults' },
  phase2Data: { selections: { energyLevel: 5 }, cta: 'Call to action' }
};

// Test parseEnhancedAIResponse (crítico para IA errors)
describe('parseEnhancedAIResponse', () => {
  test('parsea JSON válido con bloques code', () => {
    const mockResponse = `\`\`\`json
    {
      "characters": [
        { "type": "protagonist", "name": "Elena", "description": "Test desc", "desire": "Goal", "fear": "Fear", "need": "Need", "flaw": "Flaw" }
      ]
    }
    \`\`\``;
    const result = parseEnhancedAIResponse(mockResponse);
    expect(result.success).toBe(true);
    expect(result.data.characters.length).toBe(1);
    expect(result.data.characters[0].name).toBe('Elena');
    expect(result.totalCharacters).toBe(1);
  });

  test('parsea JSON standalone sin bloques', () => {
    const mockResponse = '{ "characters": [{ "type": "antagonist", "name": "Villain" }] }';
    const result = parseEnhancedAIResponse(mockResponse);
    expect(result.success).toBe(true);
    expect(result.data.characters[0].type).toBe('antagonist');
  });

  test('fallback a texto plano genera personajes básicos', () => {
    const mockResponse = 'Personaje 1: Elena es protagonista. Personaje 2: Villano antagonista.';
    const result = parseEnhancedAIResponse(mockResponse);
    expect(result.success).toBe(true);
    expect(result.fallback).toBe(true);
    expect(result.data.characters.length).toBe(2); // De split
    expect(result.data.characters[0].type).toBe('protagonist');
  });

  test('fallback vacío crea defaults', () => {
    const mockResponse = 'Respuesta sin personajes.';
    const result = parseEnhancedAIResponse(mockResponse);
    expect(result.success).toBe(true);
    expect(result.fallback).toBe(true);
    expect(result.data.characters.length).toBe(2); // Defaults: protagonist + antagonist
    expect(result.data.characters[0].name).toBe('Protagonista Principal');
  });

  test('maneja JSON malformado y completa campos', () => {
    const mockResponse = '{ "characters": [{ "name": "Test", "type": "invalid" }] }'; // Tipo inválido, campos faltantes
    const result = parseEnhancedAIResponse(mockResponse);
    expect(result.success).toBe(true);
    expect(result.data.characters[0].type).toBe('protagonist'); // Default fix
    expect(result.data.characters[0].desire).toBe('desire por completar'); // Auto-complete
  });

  test('error en array vacío', () => {
    const mockResponse = '{ "characters": [] }';
    const result = parseEnhancedAIResponse(mockResponse);
    expect(result.success).toBe(false);
    expect(result.error).toContain('al menos un personaje');
  });
});

// Test generateEnhancedCharacterPrompt
describe('generateEnhancedCharacterPrompt', () => {
  test('genera prompt suggestion con contexto', () => {
    const prompt = generateEnhancedCharacterPrompt(MOCK_PROJECT, 'suggestion');
    expect(prompt).toContain('Eres "Synapse"');
    expect(prompt).toContain('Crea EXACTAMENTE 3 personajes');
    expect(prompt).toContain('"type": "protagonist"'); // Formato JSON
    expect(prompt).toContain('Nivel de Energía: 5/10');
  });

  test('genera prompt optimization con existing', () => {
    const existing = [{ name: 'Test', type: 'protagonist' }];
    const prompt = generateEnhancedCharacterPrompt(MOCK_PROJECT, 'optimization', existing);
    expect(prompt).toContain('PERSONAJES EXISTENTES:');
    expect(prompt).toContain('1. Test (protagonist)');
  });

  test('throw si no phase2Data', () => {
    expect(() => generateEnhancedCharacterPrompt({ phase1Data: {} }, 'suggestion')).toThrow('Se requieren datos de Fase 2');
  });
});

// Test analysisMemo (lógica de useMemo)
describe('analysisMemo', () => {
  test('calcula analysis con personajes completos', () => {
    const completeChars = [{ type: 'protagonist', name: 'Test', description: 'Desc', desire: 'D', fear: 'F', need: 'N', flaw: 'Fl' }];
    const analysis = analysisMemo(completeChars);
    expect(analysis.hasCharacters).toBe(true);
    expect(analysis.incompleteCharacters).toBe(0);
    expect(analysis.canContinue).toBe(true);
    expect(analysis.mode).toBe('optimization'); // >0 chars
  });

  test('detecta incompletos', () => {
    const incomplete = [{ type: 'protagonist', name: '' }]; // Falta name
    const analysis = analysisMemo(incomplete);
    expect(analysis.incompleteCharacters).toBe(1);
    expect(analysis.canContinue).toBe(false);
  });

  test('sin personajes: modo suggestion', () => {
    const analysis = analysisMemo([]);
    expect(analysis.mode).toBe('suggestion');
    expect(analysis.canContinue).toBe(false);
  });
});

// Test createEmptyCharacter
describe('createEmptyCharacter', () => {
  test('crea estructura vacía con ID único y defaults', () => {
    const char = createEmptyCharacter();
    expect(char.id).toMatch(/^char_\d+_/); // ID pattern
    expect(char.type).toBe('protagonist');
    expect(char.aiGenerated).toBe(false);
    expect(char.createdAt).toBeDefined(); // ISO string
    // Todos required vacíos
    ['name', 'description', 'desire', 'fear', 'need', 'flaw'].forEach(field => {
      expect(char[field]).toBe('');
    });
  });
});

// Test componente Phase3 (shallow, sin hooks externos)
describe('Phase3 Component', () => {
  test('renderiza sin crash', () => {
    const { container } = render(<Phase3 />);
    expect(container).toBeInTheDocument();
  });

  // Más tests para hooks si mock useProject/useGeminiApi
  // e.g., test('handleGenerateCharacters logs y setea state', async () => { ... });
});
