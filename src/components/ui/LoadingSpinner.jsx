import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizes[size]} 
          animate-spin 
          rounded-full 
          border-2 
          border-gray-300 
          border-t-${colors[color]}
        `} 
      />
    </div>
  );
};

export default LoadingSpinner;