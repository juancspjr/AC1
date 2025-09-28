import React, { useState, useMemo } from 'react';
import { useLog } from '../../context/LogContext';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Copy, Filter, Pause, Play } from 'lucide-react';
import Button from './Button';

const LogPanel = () => {
  const { logs, clearLogs, isVisible, toggleVisibility, isPaused, togglePause, pendingLogsCount } = useLog();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all'); // all, error, warning, success, info
  
  // Filtrar logs según el nivel seleccionado
  const filteredLogs = useMemo(() => {
    if (filterLevel === 'all') return logs;
    return logs.filter(log => log.type === filterLevel);
  }, [logs, filterLevel]);
  
  // Solo logs importantes (errores y warnings)
  const importantLogs = useMemo(() => {
    return logs.filter(log => log.type === 'error' || log.type === 'warning');
  }, [logs]);

  // Logs críticos recientes (menos de 30 segundos)
  const recentCriticalLogs = useMemo(() => {
    const thirtySecondsAgo = Date.now() - 30000;
    return logs.filter(log => 
      (log.type === 'error' || log.type === 'warning') && 
      log.timestamp.getTime() > thirtySecondsAgo
    );
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return '💬';
      default: return '💬';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-700 bg-red-100 border-red-400 shadow-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-100 border-yellow-400 shadow-yellow-200';
      case 'success': return 'text-green-700 bg-green-100 border-green-400 shadow-green-200';
      case 'info': return 'text-blue-700 bg-blue-50 border-blue-300 shadow-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-300 shadow-gray-100';
    }
  };

  const copyLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toLocaleString()}] ${log.type.toUpperCase()}: ${log.message}${log.details ? '\nDetalles: ' + (typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      // Log copiado
    });
  };
  
  const getFilterButtonClass = (level) => {
    return `px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
      filterLevel === level 
        ? 'bg-blue-500 text-white shadow-md' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleVisibility}
          variant="secondary"
          size="sm"
          className={`shadow-lg transition-all duration-300 ${
            recentCriticalLogs.length > 0 
              ? 'bg-red-500 border-red-600 text-white animate-bounce shadow-red-300' 
              : importantLogs.length > 0 
              ? 'bg-yellow-400 border-yellow-500 text-yellow-900 animate-pulse' 
              : ''
          }`}
          leftIcon={<Terminal className="w-4 h-4" />}
        >
          {recentCriticalLogs.length > 0 ? (
            <>🔴 {recentCriticalLogs.length} Error{recentCriticalLogs.length > 1 ? 'es' : ''} Nuevo{recentCriticalLogs.length > 1 ? 's' : ''}</>
          ) : importantLogs.length > 0 ? (
            <>⚠️ {importantLogs.length} Problema{importantLogs.length > 1 ? 's' : ''}</>
          ) : (
            <>Logs ({logs.length})</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 bg-white border border-gray-300 rounded-tl-lg shadow-2xl transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className={`flex items-center justify-between text-white px-4 py-2 rounded-tl-lg ${
        recentCriticalLogs.length > 0 
          ? 'bg-red-600 animate-pulse' 
          : importantLogs.length > 0 
          ? 'bg-yellow-600' 
          : 'bg-gray-800'
      }`}>
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4" />
          <span className="font-medium text-sm">
            {isPaused ? '⏸️ Pausado' : 'Logs Activos'}
          </span>
          <span className="bg-black bg-opacity-30 text-xs px-2 py-0.5 rounded-full">
            {filteredLogs.length}/{logs.length}
          </span>
          {recentCriticalLogs.length > 0 && (
            <span className="bg-red-800 text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
              {recentCriticalLogs.length} 🔥 NUEVOS
            </span>
          )}
          {pendingLogsCount > 0 && (
            <span className="bg-orange-600 text-xs px-2 py-0.5 rounded-full">
              +{pendingLogsCount} pendientes
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={copyLogs}
            className="p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
            title="Copiar logs filtrados"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          <button
            onClick={togglePause}
            className={`p-1 rounded transition-colors ${
              isPaused ? 'bg-orange-600 hover:bg-orange-700' : 'hover:bg-black hover:bg-opacity-20'
            }`}
            title={isPaused ? 'Reanudar logs (hay pendientes)' : 'Pausar logs para debugging'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
            title="Limpiar todos los logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
            title={isExpanded ? 'Contraer panel' : 'Expandir panel'}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          
          <button
            onClick={toggleVisibility}
            className="p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
            title="Ocultar panel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-gray-50 px-4 py-2 flex items-center space-x-2 border-b text-xs">
        <Filter className="w-3 h-3 text-gray-500" />
        <span className="text-gray-600 font-medium">Filtros:</span>
        <button
          onClick={() => setFilterLevel('all')}
          className={getFilterButtonClass('all')}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterLevel('error')}
          className={getFilterButtonClass('error')}
        >
          ❌ Errores ({logs.filter(l => l.type === 'error').length})
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
          ✅ Éxitos
        </button>
        <button
          onClick={() => setFilterLevel('info')}
          className={getFilterButtonClass('info')}
        >
          💬 Info
        </button>
      </div>

      {/* Content */}
      <div 
        id="log-panel-content"
        className={`overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'h-96 w-[500px]' : 'h-64 w-96'
        }`}
        style={{ maxHeight: isExpanded ? '24rem' : '16rem' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {filterLevel === 'all' 
              ? '💬 No hay logs aún...' 
              : `No hay logs de tipo "${filterLevel}"`
            }
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredLogs.slice().reverse().map((log) => {
              const isRecent = (Date.now() - log.timestamp.getTime()) < 10000; // 10 segundos
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border-l-4 shadow-sm transition-all duration-500 ${
                    getLogColor(log.type)
                  } ${
                    isRecent && (log.type === 'error' || log.type === 'warning') 
                      ? 'ring-2 ring-offset-2 ring-red-400 animate-pulse' 
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-mono bg-black bg-opacity-10 px-2 py-0.5 rounded text-gray-600">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {isRecent && (log.type === 'error' || log.type === 'warning') && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                            NUEVO
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-sm leading-relaxed select-all">
                        {log.message}
                      </div>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-gray-600 hover:text-gray-800">
                            🔍 Ver detalles completos
                          </summary>
                          <div className="mt-2 text-xs bg-black bg-opacity-10 p-2 rounded font-mono max-h-32 overflow-y-auto">
                            <pre className="whitespace-pre-wrap select-all text-gray-800">
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