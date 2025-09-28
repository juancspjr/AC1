import React, { useState, useMemo } from 'react';
import { useLog } from '../../context/LogContext';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Copy, Filter } from 'lucide-react';
import Button from './Button';

const LogPanel = () => {
  const { logs, clearLogs, isVisible, toggleVisibility } = useLog();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all'); // all, error, warning, success, info
  const [isPaused, setIsPaused] = useState(false);
  
  // Filtrar logs según el nivel seleccionado
  const filteredLogs = useMemo(() => {
    if (filterLevel === 'all') return logs;
    return logs.filter(log => log.type === filterLevel);
  }, [logs, filterLevel]);
  
  // Solo logs importantes (errores y warnings)
  const importantLogs = useMemo(() => {
    return logs.filter(log => log.type === 'error' || log.type === 'warning');
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
      case 'error': return 'text-red-600 bg-red-50 border-red-500';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-500';
      case 'success': return 'text-green-600 bg-green-50 border-green-500';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-500';
      default: return 'text-gray-600 bg-gray-50 border-gray-500';
    }
  };

  const copyLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.type.toUpperCase()}: ${log.message}${log.details ? '\nDetails: ' + JSON.stringify(log.details, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      // Log copiado
    });
  };
  
  const getFilterButtonClass = (level) => {
    return `px-2 py-1 text-xs rounded transition-colors ${
      filterLevel === level 
        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleVisibility}
          variant="secondary"
          size="sm"
          className={`shadow-lg ${
            importantLogs.length > 0 ? 'bg-red-100 border-red-300 text-red-800 animate-pulse' : ''
          }`}
          leftIcon={<Terminal className="w-4 h-4" />}
        >
          {importantLogs.length > 0 ? (
            <>❌ {importantLogs.length} Error{importantLogs.length > 1 ? 'es' : ''}</>
          ) : (
            <>Logs ({logs.length})</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 bg-white border border-gray-300 rounded-tl-lg shadow-xl transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-tl-lg">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4" />
          <span className="font-medium text-sm">Logs</span>
          <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">
            {filteredLogs.length}/{logs.length}
          </span>
          {importantLogs.length > 0 && (
            <span className="bg-red-600 text-xs px-2 py-0.5 rounded-full animate-pulse">
              {importantLogs.length} ❌
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={copyLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Copiar logs filtrados"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 hover:bg-gray-700 rounded ${
              isPaused ? 'bg-yellow-600' : ''
            }`}
            title={isPaused ? 'Reanudar logs' : 'Pausar logs'}
          >
            {isPaused ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Limpiar logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          
          <button
            onClick={toggleVisibility}
            className="p-1 hover:bg-gray-700 rounded"
            title="Ocultar panel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-gray-100 px-4 py-2 flex items-center space-x-2 border-b">
        <Filter className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-600">Filtrar:</span>
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
          ❌ Errores
        </button>
        <button
          onClick={() => setFilterLevel('warning')}
          className={getFilterButtonClass('warning')}
        >
          ⚠️ Avisos
        </button>
        <button
          onClick={() => setFilterLevel('success')}
          className={getFilterButtonClass('success')}
        >
          ✅ Éxito
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
          isExpanded ? 'h-96 w-96' : 'h-48 w-80'
        }`}
        style={{ maxHeight: isExpanded ? '24rem' : '12rem' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {filterLevel === 'all' 
              ? '💬 No hay logs aún...' 
              : `No hay logs de tipo "${filterLevel}"`
            }
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredLogs.slice().reverse().map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-xs border-l-2 ${getLogColor(log.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-sm flex-shrink-0">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      <span className="text-gray-500 text-xs">
                        [{log.timestamp.toLocaleTimeString()}]
                      </span>
                      {' '}
                      <span className="select-text">{log.message}</span>
                    </div>
                    {log.details && (
                      <div className="mt-1 text-xs opacity-75 max-h-20 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono select-text">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogPanel;