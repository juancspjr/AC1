import React, { createContext, useContext, useState, useCallback } from 'react';

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
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingLogs, setPendingLogs] = useState([]);

  const addLog = useCallback((type, message, details = null) => {
    const newLog = {
      id: Date.now() + Math.random(),
      type, // 'info', 'success', 'warning', 'error'
      message,
      details,
      timestamp: new Date(),
      persistent: type === 'error' || type === 'warning' // Errores y warnings persisten más tiempo
    };

    if (isPaused) {
      // Si está pausado, guardamos en buffer
      setPendingLogs(prev => [...prev, newLog]);
      return;
    }

    setLogs(prevLogs => {
      // Para errores y warnings, mantenemos más tiempo
      const maxLogs = newLog.persistent ? 200 : 100;
      const updatedLogs = [...prevLogs, newLog].slice(-maxLogs);
      return updatedLogs;
    });

    // Auto-scroll solo si no hay errores recientes
    if (type !== 'error' && type !== 'warning') {
      setTimeout(() => {
        const logPanel = document.getElementById('log-panel-content');
        if (logPanel) {
          logPanel.scrollTop = logPanel.scrollHeight;
        }
      }, 100);
    }
  }, [isPaused]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setPendingLogs([]);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const newPaused = !prev;
      if (!newPaused && pendingLogs.length > 0) {
        // Al reanudar, procesamos logs pendientes
        setLogs(prevLogs => {
          const combined = [...prevLogs, ...pendingLogs];
          return combined.slice(-200); // Más espacio para recuperar logs
        });
        setPendingLogs([]);
      }
      return newPaused;
    });
  }, [pendingLogs]);

  // Función para destacar errores importantes
  const addPersistentError = useCallback((message, details = null) => {
    addLog('error', message, details);
    // Forzamos visibilidad si hay error crítico
    if (!isVisible) {
      setIsVisible(true);
    }
  }, [addLog, isVisible]);

  const value = {
    logs,
    addLog,
    addPersistentError,
    clearLogs,
    isVisible,
    toggleVisibility,
    isPaused,
    togglePause,
    pendingLogsCount: pendingLogs.length
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};