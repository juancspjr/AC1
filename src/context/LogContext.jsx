import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Contexto para el sistema de logs global
const LogContext = createContext();

export const useLog = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [stickyErrors, setStickyErrors] = useState([]); // Errores que persisten
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const lastLogTime = useRef(0);
  const logQueue = useRef(new Map()); // Para deduplicación
  const rateLimiter = useRef(new Map()); // Rate limiting por tipo

  // Anti-spam radical y rate limiting
  const shouldLog = useCallback((type, message) => {
    const now = Date.now();
    const messageKey = `${type}:${message}`;
    
    // Verificar rate limiting por tipo (máximo 3 logs por segundo por tipo)
    const typeKey = type;
    const typeLimit = rateLimiter.current.get(typeKey) || { count: 0, resetTime: now };
    
    if (now < typeLimit.resetTime) {
      if (typeLimit.count >= 3) {
        return false; // Rate limit alcanzado
      }
      typeLimit.count++;
    } else {
      // Reset counter cada segundo
      typeLimit.count = 1;
      typeLimit.resetTime = now + 1000;
    }
    rateLimiter.current.set(typeKey, typeLimit);
    
    // Verificar duplicados en los últimos 2 segundos
    const lastSimilar = logQueue.current.get(messageKey);
    if (lastSimilar && (now - lastSimilar < 2000)) {
      return false; // Bloquear duplicado
    }
    
    logQueue.current.set(messageKey, now);
    
    // Limpiar queue viejo cada 5 segundos
    if (now - lastLogTime.current > 5000) {
      const cutoff = now - 2000;
      for (const [key, time] of logQueue.current.entries()) {
        if (time < cutoff) {
          logQueue.current.delete(key);
        }
      }
    }
    
    lastLogTime.current = now;
    return true;
  }, []);

  // Auto-limpieza inteligente cada 30 segundos
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (!isPaused) {
        setLogs(prev => {
          if (prev.length <= 20) return prev; // No limpiar si hay pocos logs
          
          const cutoff = Date.now() - 30000; // 30 segundos
          return prev.filter(log => 
            log.timestamp.getTime() > cutoff || 
            log.type === 'error' || 
            log.type === 'warning'
          ).slice(-30); // Máximo 30 logs
        });
      }
    }, 30000);

    return () => clearInterval(cleanup);
  }, [isPaused]);

  const addLog = useCallback((type, message, details = null) => {
    // Filtrar logs no importantes excepto errores
    if (!shouldLog(type, message) && type !== 'error') return;
    
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      details: details ? {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      } : null,
      timestamp: new Date(),
      stack: type === 'error' ? new Error().stack : null
    };

    if (isPaused && type !== 'error') {
      return; // Solo permitir errores si está pausado
    }

    // Errores van a lista persistente separada
    if (type === 'error') {
      setStickyErrors(prev => {
        const exists = prev.find(err => 
          err.message === message && 
          Math.abs(err.timestamp.getTime() - newLog.timestamp.getTime()) < 1000
        );
        if (exists) return prev;
        
        return [...prev, newLog].slice(-15); // Máximo 15 errores sticky
      });
    }

    // Logs normales
    setLogs(prevLogs => {
      // Evitar duplicados exactos en los últimos 500ms
      const recent = prevLogs.filter(log => 
        Date.now() - log.timestamp.getTime() < 500
      );
      
      const isDuplicate = recent.find(log => 
        log.message === message && log.type === type
      );
      
      if (isDuplicate) return prevLogs;
      
      return [...prevLogs, newLog].slice(-35); // Máximo 35 logs normales
    });
  }, [isPaused, shouldLog]);

  // Limpiar TODOS los logs y errores
  const clearAllLogs = useCallback(() => {
    setLogs([]);
    setStickyErrors([]);
    logQueue.current.clear();
    rateLimiter.current.clear();
  }, []);

  // Limpiar solo errores sticky
  const clearStickyErrors = useCallback(() => {
    setStickyErrors([]);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Combinar logs normales y sticky errors para mostrar
  const allLogs = [...logs, ...stickyErrors].sort((a, b) => a.timestamp - b.timestamp);
  
  // Contadores
  const counts = {
    total: allLogs.length,
    errors: allLogs.filter(log => log.type === 'error').length,
    warnings: allLogs.filter(log => log.type === 'warning').length,
    success: allLogs.filter(log => log.type === 'success').length,
    info: allLogs.filter(log => log.type === 'info').length,
    stickyErrors: stickyErrors.length
  };

  const value = {
    logs: allLogs,
    counts,
    stickyErrorsCount: stickyErrors.length,
    addLog,
    clearAllLogs, // Nueva función para limpiar TODO
    clearStickyErrors,
    isVisible,
    toggleVisibility,
    isPaused,
    togglePause
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};