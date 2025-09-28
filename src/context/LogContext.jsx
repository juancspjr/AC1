import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  const [lastLogTime, setLastLogTime] = useState(0);

  // Auto-limpieza de logs normales cada 15 segundos
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (!isPaused) {
        setLogs(prev => {
          // Solo mantener logs de los últimos 15 segundos o los importantes
          const cutoff = Date.now() - 15000;
          return prev.filter(log => 
            log.timestamp.getTime() > cutoff || 
            log.type === 'error' || 
            log.type === 'warning'
          ).slice(-20); // Máximo 20 logs normales
        });
      }
    }, 15000);

    return () => clearInterval(cleanup);
  }, [isPaused]);

  // Prevenir spam de logs similares
  const shouldLog = useCallback((type, message) => {
    const now = Date.now();
    const timeDiff = now - lastLogTime;
    
    // Siempre permitir errores y warnings
    if (type === 'error' || type === 'warning') return true;
    
    // Para otros tipos, evitar spam (menos de 100ms entre logs)
    if (timeDiff < 100) return false;
    
    setLastLogTime(now);
    return true;
  }, [lastLogTime]);

  const addLog = useCallback((type, message, details = null) => {
    // Filtrar logs de micro-eventos
    if (!shouldLog(type, message)) return;
    
    const newLog = {
      id: Date.now() + Math.random(),
      type,
      message,
      details,
      timestamp: new Date(),
      isUserAction: type === 'error' || message.includes('Usuario') || message.includes('Clic') || message.includes('API')
    };

    if (isPaused && type !== 'error') {
      return; // No agregar logs normales si está pausado
    }

    // Errores van a lista persistente
    if (type === 'error') {
      setStickyErrors(prev => {
        // Evitar duplicados exactos
        const exists = prev.find(err => err.message === message && err.type === type);
        if (exists) return prev;
        
        return [...prev, newLog].slice(-10); // Máximo 10 errores sticky
      });
    }

    // Logs normales
    setLogs(prevLogs => {
      // Evitar duplicados recientes
      const recent = prevLogs.filter(log => 
        Date.now() - log.timestamp.getTime() < 1000
      );
      
      const isDuplicate = recent.find(log => 
        log.message === message && log.type === type
      );
      
      if (isDuplicate && type !== 'error') return prevLogs;
      
      return [...prevLogs, newLog].slice(-25);
    });
  }, [isPaused, shouldLog]);

  // Limpiar solo errores sticky
  const clearStickyErrors = useCallback(() => {
    setStickyErrors([]);
  }, []);

  // Limpiar todos los logs
  const clearLogs = useCallback(() => {
    setLogs([]);
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

  const value = {
    logs: allLogs,
    stickyErrorsCount: stickyErrors.length,
    addLog,
    clearLogs,
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