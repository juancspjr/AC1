import React, { useState, useMemo } from 'react';
import { useLog } from '../../context/LogContext';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Copy, Filter, Pause, Play, AlertTriangle } from 'lucide-react';
import Button from './Button';

const LogPanel = () => {
  const { logs, stickyErrorsCount, clearLogs, clearStickyErrors, isVisible, toggleVisibility, isPaused, togglePause } = useLog();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  
  // Filtrar logs según el nivel seleccionado
  const filteredLogs = useMemo(() => {
    if (filterLevel === 'all') return logs;
    return logs.filter(log => log.type === filterLevel);
  }, [logs, filterLevel]);
  
  // Solo errores y warnings importantes
  const importantLogs = useMemo(() => {
    return logs.filter(log => log.type === 'error' || log.type === 'warning');
  }, [logs]);

  // Errores muy recientes (menos de 5 segundos)
  const recentErrors = useMemo(() => {
    const fiveSecondsAgo = Date.now() - 5000;
    return logs.filter(log => 
      log.type === 'error' && 
      log.timestamp.getTime() > fiveSecondsAgo
    );
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return '💬';
      default: return '💬';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-800 bg-red-100 border-red-500 shadow-lg';
      case 'warning': return 'text-yellow-800 bg-yellow-100 border-yellow-500';
      case 'success': return 'text-green-800 bg-green-100 border-green-500';
      case 'info': return 'text-blue-700 bg-blue-50 border-blue-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const copyLogs = () => {
    const logText = filteredLogs.map(log => {
      const timestamp = log.timestamp.toLocaleString('es-ES', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return `[${timestamp}] ${log.type.toUpperCase()}: ${log.message}${log.details ? '\n  Detalles: ' + (typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)) : ''}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(logText);
  };
  
  const getFilterButtonClass = (level) => {
    const count = logs.filter(l => level === 'all' || l.type === level).length;
    return `px-3 py-1 text-xs rounded-md transition-all duration-200 font-medium ${
      filterLevel === level 
        ? 'bg-blue-600 text-white shadow-md transform scale-105' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
    } ${count > 0 ? '' : 'opacity-50'}`;
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleVisibility}
          variant="secondary"
          size="sm"
          className={`shadow-xl transition-all duration-500 transform ${
            recentErrors.length > 0 
              ? 'bg-red-600 border-red-700 text-white animate-bounce scale-110 shadow-red-400' 
              : stickyErrorsCount > 0 
              ? 'bg-orange-500 border-orange-600 text-white animate-pulse shadow-orange-300' 
              : 'hover:scale-105'
          }`}
          leftIcon={<Terminal className="w-4 h-4" />}
        >
          {recentErrors.length > 0 ? (
            <>🔥 {recentErrors.length} ERROR{recentErrors.length > 1 ? 'ES' : ''} NUEVO{recentErrors.length > 1 ? 'S' : ''}</>
          ) : stickyErrorsCount > 0 ? (
            <>⚠️ {stickyErrorsCount} Error{stickyErrorsCount > 1 ? 'es' : ''} Guardado{stickyErrorsCount > 1 ? 's' : ''}</>
          ) : (
            <>Debug Panel ({logs.length})</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 bg-white border-2 border-gray-400 rounded-tl-xl shadow-2xl transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className={`flex items-center justify-between text-white px-4 py-3 rounded-tl-xl ${
        recentErrors.length > 0 
          ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' 
          : stickyErrorsCount > 0 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
          : 'bg-gradient-to-r from-gray-700 to-gray-800'
      }`}>
        <div className="flex items-center space-x-3">
          <Terminal className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">
              {isPaused ? '⏸️ DEBUG PAUSADO' : '🔍 DEBUG PANEL'}
            </span>
            <span className="text-xs opacity-90">
              {filteredLogs.length} logs {stickyErrorsCount > 0 && `(🔴 ${stickyErrorsCount} errores fijos)`}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {stickyErrorsCount > 0 && (
            <button
              onClick={clearStickyErrors}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors font-medium"
              title="Limpiar errores guardados"
            >
              Limpiar {stickyErrorsCount} Error{stickyErrorsCount > 1 ? 'es' : ''}
            </button>
          )}
          
          <button
            onClick={copyLogs}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Copiar todos los logs filtrados"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={togglePause}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isPaused ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'hover:bg-white hover:bg-opacity-20'
            }`}
            title={isPaused ? 'Reanudar logging' : 'Pausar logging para debugging'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={clearLogs}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Limpiar todos los logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title={isExpanded ? 'Contraer panel' : 'Expandir panel completo'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleVisibility}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Ocultar panel de debugging"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 flex items-center space-x-3 border-b text-sm">
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700 font-semibold">Filtros:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterLevel('all')}
            className={getFilterButtonClass('all')}
          >
            Todos ({logs.length})
          </button>
          <button
            onClick={() => setFilterLevel('error')}
            className={getFilterButtonClass('error')}
          >
            🔴 Errores ({logs.filter(l => l.type === 'error').length})
          </button>
          <button
            onClick={() => setFilterLevel('warning')}
            className={getFilterButtonClass('warning')}
          >
            ⚠️ Avisos ({logs.filter(l => l.type === 'warning').length})
          </button>
          <button
            onClick={() => setFilterLevel('success')}
            className={getFilterButtonClass('success')}
          >
            ✅ Éxitos ({logs.filter(l => l.type === 'success').length})
          </button>
          <button
            onClick={() => setFilterLevel('info')}
            className={getFilterButtonClass('info')}
          >
            💬 Info ({logs.filter(l => l.type === 'info').length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        id="log-panel-content"
        className={`overflow-y-auto transition-all duration-300 bg-gray-50 ${
          isExpanded ? 'h-[500px] w-[700px]' : 'h-80 w-[500px]'
        }`}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">
                {filterLevel === 'all' 
                  ? 'Panel de debugging limpio' 
                  : `Sin logs de tipo "${filterLevel}"`
                }
              </div>
              <div className="text-sm mt-1">
                {filterLevel === 'all' 
                  ? 'Los errores se guardarán automáticamente aquí' 
                  : 'Cambia el filtro o realiza una acción'
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {filteredLogs.slice().reverse().map((log) => {
              const isVeryRecent = (Date.now() - log.timestamp.getTime()) < 3000;
              const isError = log.type === 'error';
              
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border-l-4 transition-all duration-700 ${
                    getLogColor(log.type)
                  } ${
                    isVeryRecent && isError
                      ? 'ring-4 ring-red-400 ring-opacity-50 animate-pulse transform scale-105' 
                      : isError
                      ? 'ring-2 ring-red-300 ring-opacity-30'
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0 mt-1">{getLogIcon(log.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs font-mono bg-black bg-opacity-10 px-3 py-1 rounded-full text-gray-700 font-bold">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {isVeryRecent && isError && (
                          <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full animate-bounce font-bold shadow-lg">
                            🔥 RECÉN DETECTADO
                          </span>
                        )}
                        {isError && !isVeryRecent && (
                          <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-bold">
                            📌 ERROR GUARDADO
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-base leading-relaxed select-all cursor-text mb-2">
                        {log.message}
                      </div>
                      {log.details && (
                        <details className="mt-3" open={isError}>
                          <summary className="text-sm cursor-pointer text-gray-700 hover:text-gray-900 font-medium mb-2 flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Detalles técnicos completos</span>
                          </summary>
                          <div className="mt-3 text-sm bg-gray-900 text-green-400 p-4 rounded-lg font-mono max-h-48 overflow-y-auto border border-gray-700">
                            <pre className="whitespace-pre-wrap select-all cursor-text leading-relaxed">
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogPanel;