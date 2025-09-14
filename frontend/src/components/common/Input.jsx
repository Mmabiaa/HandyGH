// src/components/common/Input.jsx
import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      error,
      className = '',
      labelClassName = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label
            htmlFor={name}
            className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          id={name}
          className={`block w-full px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${inputClassName}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;