import React, { useState, useMemo } from 'react';
import { useLog } from '../../context/LogContext';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Copy, Filter, Pause, Play, AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

const LogPanel = () => {
  const { logs, counts, clearAllLogs, clearStickyErrors, isVisible, toggleVisibility, isPaused, togglePause } = useLog();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  
  // Filtrar logs según el nivel seleccionado
  const filteredLogs = useMemo(() => {
    if (filterLevel === 'all') return logs;
    return logs.filter(log => log.type === filterLevel);
  }, [logs, filterLevel]);
  
  // Errores muy recientes (menos de 3 segundos)
  const recentErrors = useMemo(() => {
    const threeSecondsAgo = Date.now() - 3000;
    return logs.filter(log => 
      log.type === 'error' && 
      log.timestamp.getTime() > threeSecondsAgo
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
      case 'error': return 'text-red-800 bg-red-50 border-red-400 shadow-lg shadow-red-100';
      case 'warning': return 'text-yellow-800 bg-yellow-50 border-yellow-400 shadow-md shadow-yellow-100';
      case 'success': return 'text-green-800 bg-green-50 border-green-400 shadow-md shadow-green-100';
      case 'info': return 'text-blue-700 bg-blue-50 border-blue-300 shadow-sm shadow-blue-100';
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
      
      let details = '';
      if (log.details) {
        if (typeof log.details === 'string') {
          details = `\nDetalles: ${log.details}`;
        } else {
          details = `\nDetalles: ${JSON.stringify(log.details, null, 2)}`;
        }
      }
      
      if (log.stack && log.type === 'error') {
        details += `\nStack Trace:\n${log.stack}`;
      }
      
      return `[${timestamp}] ${log.type.toUpperCase()}: ${log.message}${details}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(logText);
  };
  
  const getFilterButtonClass = (level) => {
    const count = level === 'all' ? counts.total : counts[level] || 0;
    return `px-3 py-1.5 text-xs rounded-lg transition-all duration-200 font-semibold border ${
      filterLevel === level 
        ? 'bg-blue-600 text-white shadow-lg border-blue-700 transform scale-105' 
        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:shadow-md'
    } ${count > 0 ? '' : 'opacity-50 cursor-not-allowed'}`;
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Formato mejorado de detalles de error
  const formatErrorDetails = (log) => {
    if (!log.details && !log.stack) return null;
    
    let formatted = '';
    
    if (log.details) {
      formatted += '=== DETALLES DEL ERROR ===\n';
      if (typeof log.details === 'string') {
        formatted += log.details;
      } else {
        formatted += `URL: ${log.details.url || 'N/A'}\n`;
        formatted += `Timestamp: ${log.details.timestamp || 'N/A'}\n`;
        formatted += `User Agent: ${log.details.userAgent || 'N/A'}\n`;
        if (log.details.response) {
          formatted += `\nRESPUESTA DE API:\n${JSON.stringify(log.details.response, null, 2)}`;
        }
        if (log.details.request) {
          formatted += `\nREQUEST ENVIADO:\n${JSON.stringify(log.details.request, null, 2)}`;
        }
      }
    }
    
    if (log.stack) {
      formatted += '\n\n=== STACK TRACE ===\n';
      formatted += log.stack;
    }
    
    return formatted;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleVisibility}
          variant="secondary"
          size="sm"
          className={`shadow-xl transition-all duration-500 transform border-2 ${
            recentErrors.length > 0 
              ? 'bg-red-600 border-red-700 text-white animate-bounce scale-110 shadow-red-400' 
              : counts.errors > 0 
              ? 'bg-orange-500 border-orange-600 text-white animate-pulse shadow-orange-300' 
              : 'hover:scale-105 bg-white border-gray-300'
          }`}
          leftIcon={<Terminal className="w-4 h-4" />}
        >
          {recentErrors.length > 0 ? (
            <>🔥 {recentErrors.length} ERROR{recentErrors.length > 1 ? 'ES' : ''} NUEVO{recentErrors.length > 1 ? 'S' : ''}</>
          ) : counts.errors > 0 ? (
            <>⚠️ {counts.errors} Error{counts.errors > 1 ? 'es' : ''} Guardado{counts.errors > 1 ? 's' : ''}</>
          ) : (
            <>Debug Panel ({counts.total})</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 bg-white border-2 border-gray-400 rounded-tl-2xl shadow-2xl transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className={`flex items-center justify-between text-white px-4 py-3 rounded-tl-2xl ${
        recentErrors.length > 0 
          ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' 
          : counts.errors > 0 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
          : 'bg-gradient-to-r from-gray-700 to-gray-800'
      }`}>
        <div className="flex items-center space-x-3">
          <Terminal className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="font-bold text-base">
              {isPaused ? '⏸️ DEBUG PAUSADO' : '🔍 DEBUG ACTIVO'}
            </span>
            <span className="text-xs opacity-90">
              Total: {counts.total} | Errores: {counts.errors} | Info: {counts.info}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botón LIMPIAR TODO prominente */}
          <button
            onClick={clearAllLogs}
            disabled={counts.total === 0}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
              counts.total > 0 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
            title="Eliminar TODOS los logs y errores guardados"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🗑️ LIMPIAR TODO ({counts.total})</span>
          </button>
          
          {counts.errors > 0 && (
            <button
              onClick={clearStickyErrors}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-md transition-colors font-medium"
              title="Limpiar solo errores guardados"
            >
              Limpiar {counts.errors} Error{counts.errors > 1 ? 'es' : ''}
            </button>
          )}
          
          <button
            onClick={copyLogs}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Copiar logs con stack traces completos"
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
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 flex items-center space-x-3 border-b">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-gray-700 font-bold text-sm">Filtros:</span>
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={() => setFilterLevel('all')}
            className={getFilterButtonClass('all')}
            disabled={counts.total === 0}
          >
            📊 Todos ({counts.total})
          </button>
          <button
            onClick={() => setFilterLevel('error')}
            className={getFilterButtonClass('error')}
            disabled={counts.errors === 0}
          >
            🔴 Errores ({counts.errors})
          </button>
          <button
            onClick={() => setFilterLevel('warning')}
            className={getFilterButtonClass('warning')}
            disabled={counts.warnings === 0}
          >
            ⚠️ Avisos ({counts.warnings})
          </button>
          <button
            onClick={() => setFilterLevel('success')}
            className={getFilterButtonClass('success')}
            disabled={counts.success === 0}
          >
            ✅ Éxitos ({counts.success})
          </button>
          <button
            onClick={() => setFilterLevel('info')}
            className={getFilterButtonClass('info')}
            disabled={counts.info === 0}
          >
            💬 Info ({counts.info})
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        id="log-panel-content"
        className={`overflow-y-auto transition-all duration-300 bg-gradient-to-b from-gray-50 to-white ${
          isExpanded ? 'h-[600px] w-[800px]' : 'h-96 w-[600px]'
        }`}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center p-8">
              <Terminal className="w-16 h-16 mx-auto mb-6 opacity-30" />
              <div className="text-xl font-semibold mb-2">
                {counts.total === 0 
                  ? '🧹 Panel completamente limpio' 
                  : filterLevel === 'all' 
                  ? 'Panel de debugging vacío'
                  : `Sin logs de tipo "${filterLevel}"`
                }
              </div>
              <div className="text-sm">
                {counts.total === 0 
                  ? 'Los errores se capturarán automáticamente' 
                  : 'Cambia el filtro o realiza una acción'
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredLogs.slice().reverse().map((log) => {
              const isVeryRecent = (Date.now() - log.timestamp.getTime()) < 2000;
              const isError = log.type === 'error';
              const errorDetails = formatErrorDetails(log);
              
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border-l-4 transition-all duration-700 ${
                    getLogColor(log.type)
                  } ${
                    isVeryRecent && isError
                      ? 'ring-4 ring-red-400 ring-opacity-60 animate-pulse transform scale-[1.02]' 
                      : isError
                      ? 'ring-2 ring-red-300 ring-opacity-40'
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl flex-shrink-0 mt-1">{getLogIcon(log.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xs font-mono bg-black bg-opacity-10 px-3 py-1.5 rounded-full text-gray-800 font-bold">
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
                      <div className="font-bold text-lg leading-relaxed select-all cursor-text mb-3 text-gray-800">
                        {log.message}
                      </div>
                      {errorDetails && (
                        <details className="mt-4" open={isError}>
                          <summary className="text-sm cursor-pointer text-gray-700 hover:text-gray-900 font-bold mb-3 flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <span>🔍 Detalles técnicos completos y stack trace</span>
                          </summary>
                          <div className="mt-4 text-sm bg-black text-green-400 p-4 rounded-lg font-mono max-h-64 overflow-y-auto border-2 border-gray-800">
                            <pre className="whitespace-pre-wrap select-all cursor-text leading-relaxed">
                              {errorDetails}
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