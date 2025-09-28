import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'default',
  hover = false,
  border = true,
  shadow = true,
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl transition-all duration-200';
  
  const variants = {
    default: '',
    gradient: 'bg-gradient-to-br from-white to-gray-50',
    glass: 'backdrop-blur-sm bg-white/80',
    colored: 'bg-gradient-to-br from-primary-50 to-purple-50',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50',
    warning: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    error: 'bg-gradient-to-br from-red-50 to-rose-50'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const conditionalStyles = [
    border ? 'border border-gray-200' : '',
    shadow ? 'shadow-sm' : '',
    hover ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer hover:scale-[1.02]' : '',
    onClick ? 'cursor-pointer' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${conditionalStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente especializado para cards de proyecto
export const ProjectCard = ({ 
  title, 
  description, 
  status, 
  lastUpdated,
  type,
  onClick,
  className = '',
  ...props 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new': return '🆕';
      case 'continuation': return '🔄';
      case 'series': return '📚';
      default: return '📄';
    }
  };

  return (
    <Card 
      hover
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Type indicator */}
      <div className="absolute top-4 right-4 text-2xl">
        {getTypeIcon(type)}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-12">
            {title || 'Proyecto sin título'}
          </h3>
          {description && (
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status === 'completed' ? 'Completado' : 
             status === 'in_progress' ? 'En progreso' : 
             status === 'draft' ? 'Borrador' : status}
          </span>
          
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

// Componente para cards de características
export const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  highlight = false,
  className = '',
  ...props 
}) => {
  return (
    <Card 
      variant={highlight ? 'colored' : 'default'}
      hover
      className={`text-center ${className}`}
      {...props}
    >
      <div className="space-y-4">
        <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center ${
          highlight ? 'bg-gradient-to-br from-primary-500 to-purple-500' : 'bg-gray-100'
        }`}>
          <span className={`text-xl ${highlight ? 'text-white' : 'text-gray-600'}`}>
            {icon}
          </span>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default Card;