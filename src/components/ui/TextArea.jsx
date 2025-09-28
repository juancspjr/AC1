import React from 'react';

const TextArea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none';
  const errorStyles = error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={`
          ${baseStyles}
          ${errorStyles}
          ${disabledStyles}
        `}
        {...props}
      />
      
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        
        {showCount && maxLength && (
          <div className="text-xs text-gray-500">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextArea;