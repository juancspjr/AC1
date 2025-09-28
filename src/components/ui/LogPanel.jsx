import React, { useState } from 'react';
import { useLog } from '../../context/LogContext';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Copy } from 'lucide-react';
import Button from './Button';

const LogPanel = () => {
  const { logs, clearLogs, isVisible, toggleVisibility } = useLog();
  const [isExpanded, setIsExpanded] = useState(false);

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
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.type.toUpperCase()}: ${log.message}${log.details ? '\nDetails: ' + JSON.stringify(log.details, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      // Podríamos agregar una notificación aquí
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleVisibility}
          variant="secondary"
          size="sm"
          className="shadow-lg"
          leftIcon={<Terminal className="w-4 h-4" />}
        >
          Mostrar Logs ({logs.length})
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
          <span className="font-medium text-sm">Procesos en Vivo</span>
          <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={copyLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Copiar logs"
          >
            <Copy className="w-3 h-3" />
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

      {/* Content */}
      <div 
        id="log-panel-content"
        className={`overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'h-96 w-96' : 'h-48 w-80'
        }`}
        style={{ maxHeight: isExpanded ? '24rem' : '12rem' }}
      >
        {logs.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            💬 No hay logs aún...
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-xs border-l-2 ${
                  log.type === 'error' ? 'border-red-500' :
                  log.type === 'warning' ? 'border-yellow-500' :
                  log.type === 'success' ? 'border-green-500' :
                  'border-blue-500'
                } ${getLogColor(log.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-sm">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      [{log.timestamp.toLocaleTimeString()}] {log.message}
                    </div>
                    {log.details && (
                      <div className="mt-1 text-xs opacity-75 max-h-20 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono">
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