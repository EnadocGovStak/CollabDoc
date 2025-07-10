import React, { useState, useEffect } from 'react';
import TemplateMergeEngine from './TemplateMergeEngine';
import './TemplateMergeForm.css';

/**
 * Template Merge Form Component
 * Handles form input for template merge fields
 * Completely isolated from the main document editor
 */
const TemplateMergeForm = ({ 
  template, 
  mergeData = {}, 
  onDataChange,
  onSubmit,
  submitLabel = 'Generate Document',
  showValidation = true,
  enableAutoSave = true
}) => {
  const [formData, setFormData] = useState(mergeData);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when external mergeData changes
  useEffect(() => {
    setFormData(mergeData);
  }, [mergeData]);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && template?.id) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(`template_form_${template.id}`, JSON.stringify({
            data: formData,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.warn('Failed to auto-save form data:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, template?.id, enableAutoSave]);

  // Load saved form data on mount
  useEffect(() => {
    if (enableAutoSave && template?.id && Object.keys(formData).length === 0) {
      try {
        const saved = localStorage.getItem(`template_form_${template.id}`);
        if (saved) {
          const { data } = JSON.parse(saved);
          setFormData(data);
          if (onDataChange) {
            onDataChange(data);
          }
        }
      } catch (error) {
        console.warn('Failed to load saved form data:', error);
      }
    }
  }, [template?.id, enableAutoSave]);

  // Validate form when data changes
  useEffect(() => {
    if (showValidation && template?.mergeFields) {
      const validation = TemplateMergeEngine.validateMergeData(formData, template.mergeFields);
      setValidationErrors(validation.errors);
    }
  }, [formData, template?.mergeFields, showValidation]);

  const handleFieldChange = (fieldName, value) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!onSubmit) return;

    // Mark all fields as touched for validation display
    const allFields = (template?.mergeFields || []).reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {});
    setTouchedFields(allFields);

    // Check validation
    if (showValidation && Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      
      // Clear auto-saved data on successful submit
      if (enableAutoSave && template?.id) {
        localStorage.removeItem(`template_form_${template.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const { name, type = 'text', required = false, description, options } = field;
    const value = formData[name] || '';
    const hasError = showValidation && touchedFields[name] && validationErrors[name];

    const commonProps = {
      id: `field-${name}`,
      name: name,
      value: value,
      onChange: (e) => handleFieldChange(name, e.target.value),
      onBlur: () => handleFieldBlur(name),
      className: `merge-field-input ${hasError ? 'error' : ''}`
    };

    let inputElement;

    switch (type) {
      case 'textarea':
        inputElement = (
          <textarea
            {...commonProps}
            placeholder={`Enter ${name}`}
            rows={3}
          />
        );
        break;
      
      case 'select':
        inputElement = (
          <select {...commonProps}>
            <option value="">Select {name}</option>
            {(options || []).map(option => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
        break;
      
      case 'number':
        inputElement = (
          <input
            {...commonProps}
            type="number"
            placeholder={`Enter ${name}`}
          />
        );
        break;
      
      case 'date':
        inputElement = (
          <input
            {...commonProps}
            type="date"
          />
        );
        break;
      
      case 'email':
        inputElement = (
          <input
            {...commonProps}
            type="email"
            placeholder={`Enter ${name}`}
          />
        );
        break;
      
      default:
        inputElement = (
          <input
            {...commonProps}
            type="text"
            placeholder={`Enter ${name}`}
          />
        );
    }

    return (
      <div key={name} className="merge-field-group">
        <label htmlFor={`field-${name}`} className="merge-field-label">
          {name}
          {required && <span className="required-indicator">*</span>}
        </label>
        
        {description && (
          <div className="field-description">{description}</div>
        )}
        
        {inputElement}
        
        {hasError && (
          <div className="field-error">{validationErrors[name]}</div>
        )}
      </div>
    );
  };

  if (!template?.mergeFields || template.mergeFields.length === 0) {
    return (
      <div className="template-merge-form">
        <div className="no-fields">
          <p>This template has no merge fields.</p>
        </div>
      </div>
    );
  }

  // Group fields by category
  const fieldGroups = template.mergeFields.reduce((groups, field) => {
    const category = field.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
    return groups;
  }, {});

  const isFormValid = Object.keys(validationErrors).length === 0;

  return (
    <div className="template-merge-form">
      <form onSubmit={handleSubmit} className="merge-form">
        {Object.entries(fieldGroups).map(([category, fields]) => (
          <div key={category} className="field-group-section">
            <h3 className="group-title">{category}</h3>
            <div className="fields-grid">
              {fields.map(renderField)}
            </div>
          </div>
        ))}
        
        <div className="form-actions">
          {showValidation && !isFormValid && (
            <div className="validation-summary">
              <p className="error-text">Please fill in all required fields.</p>
            </div>
          )}
          
          {onSubmit && (
            <button 
              type="submit" 
              className={`submit-btn ${!isFormValid || isSubmitting ? 'disabled' : ''}`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Generating...' : submitLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TemplateMergeForm;
