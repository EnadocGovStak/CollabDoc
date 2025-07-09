import React from 'react';
import './FieldRenderer.css';

const FieldRenderer = ({ field, value, onChange, onBlur, error }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const getFieldComponent = () => {
    const commonProps = {
      id: field.name,
      value: value,
      onChange: handleChange,
      onBlur: onBlur,
      placeholder: field.placeholder || `Enter ${field.name}`,
      className: `field-input ${error ? 'error' : ''}`
    };

    switch (field.type) {
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            autoComplete="email"
          />
        );
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
      
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
          />
        );
      
      case 'dropdown':
        return (
          <select {...commonProps}>
            <option value="">Select {field.name}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'text':
      default:
        return (
          <input
            {...commonProps}
            type="text"
            maxLength={field.validation?.maxLength}
          />
        );
    }
  };

  return (
    <div className="field-renderer">
      <label htmlFor={field.name} className="field-label">
        {field.name}
        {field.required && <span className="required">*</span>}
      </label>
      
      {field.description && (
        <div className="field-description">
          {field.description}
        </div>
      )}
      
      {getFieldComponent()}
      
      {error && (
        <div className="field-error">
          {error}
        </div>
      )}
      
      {field.validation?.helpText && (
        <div className="field-help">
          {field.validation.helpText}
        </div>
      )}
    </div>
  );
};

export default FieldRenderer;
