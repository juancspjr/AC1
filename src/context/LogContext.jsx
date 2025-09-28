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

  const addLog = useCallback((type, message, details = null) => {
    const newLog = {
      id: Date.now() + Math.random(),
      type, // 'info', 'success', 'warning', 'error'
      message,
      details,
      timestamp: new Date()
    };

    setLogs(prevLogs => {
      // Mantener solo los últimos 100 logs
      const updatedLogs = [...prevLogs, newLog].slice(-100);
      return updatedLogs;
    });

    // Auto-scroll si es necesario
    setTimeout(() => {
      const logPanel = document.getElementById('log-panel-content');
      if (logPanel) {
        logPanel.scrollTop = logPanel.scrollHeight;
      }
    }, 100);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const value = {
    logs,
    addLog,
    clearLogs,
    isVisible,
    toggleVisibility
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};