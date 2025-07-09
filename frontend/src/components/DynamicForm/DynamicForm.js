import React, { useState, useEffect } from 'react';
import FieldGroups from './FieldGroups';
import FormValidation from './FormValidation';
import FormPreview from './FormPreview';
import './DynamicForm.css';

const DynamicForm = ({ template, formData, onChange, onSubmit }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [fieldGroups, setFieldGroups] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState(null);

  // Load saved draft from localStorage if available
  useEffect(() => {
    if (template?.id && !Object.keys(formData || {}).length) {
      try {
        const savedDraft = localStorage.getItem(`form_draft_${template.id}`);
        if (savedDraft) {
          const { data, timestamp } = JSON.parse(savedDraft);
          onChange(data);
          setDraftTimestamp(new Date(timestamp));
          setDraftSaved(true);
        }
      } catch (error) {
        console.error('Error loading form draft:', error);
      }
    }
  }, [template?.id]);

  // Group fields by category
  useEffect(() => {
    if (template?.mergeFields) {
      const groups = template.mergeFields.reduce((acc, field) => {
        const category = field.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(field);
        return acc;
      }, {});
      
      setFieldGroups(groups);
    }
  }, [template]);

  // Auto-save draft data to localStorage
  useEffect(() => {
    if (template?.id && formData && Object.keys(formData).length > 0) {
      const draftData = {
        data: formData,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`form_draft_${template.id}`, JSON.stringify(draftData));
      setDraftSaved(true);
      setDraftTimestamp(new Date());
    }
  }, [formData, template?.id]);

  const handleFieldChange = (fieldName, value) => {
    const newFormData = {
      ...formData,
      [fieldName]: value
    };
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    // Mark field as touched
    if (!touchedFields[fieldName]) {
      setTouchedFields(prev => ({
        ...prev,
        [fieldName]: true
      }));
    }
    
    onChange(newFormData);
  };

  const validateField = (field, value) => {
    const errors = [];
    
    // Required field validation
    if (field.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field.name} is required`);
    }
    
    // Type-specific validation
    if (value && value.toString().trim() !== '') {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${field.name} must be a valid email address`);
          }
          break;
        case 'number':
          if (isNaN(value)) {
            errors.push(`${field.name} must be a valid number`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`${field.name} must be a valid date`);
          }
          break;
        case 'dropdown':
          if (field.required && (!value || value === '')) {
            errors.push(`Please select a value for ${field.name}`);
          }
          break;
      }
    }
    
    // Advanced validation rules from field definition
    if (field.validation && value) {
      const { minLength, maxLength, min, max, regex, message } = field.validation;
      
      if (minLength && value.length < minLength) {
        errors.push(`${field.name} must be at least ${minLength} characters`);
      }
      
      if (maxLength && value.length > maxLength) {
        errors.push(`${field.name} must be no more than ${maxLength} characters`);
      }
      
      if (field.type === 'number') {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          errors.push(`${field.name} must be at least ${min}`);
        }
        if (max !== undefined && numValue > max) {
          errors.push(`${field.name} must be no more than ${max}`);
        }
      }
      
      if (regex) {
        try {
          const regexPattern = new RegExp(regex);
          if (!regexPattern.test(value)) {
            errors.push(message || `${field.name} format is invalid`);
          }
        } catch (error) {
          console.error(`Invalid regex pattern for ${field.name}:`, error);
        }
      }
    }
    
    return errors;
  };

  const handleFieldBlur = (fieldName) => {
    const field = template.mergeFields.find(f => f.name === fieldName);
    if (!field) return;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    const value = formData[fieldName];
    const errors = validateField(field, value);
    
    if (errors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: errors[0]
      }));
    }
  };

  const validateAllFields = () => {
    const newErrors = {};
    const newTouchedFields = { ...touchedFields };
    
    template.mergeFields.forEach(field => {
      const value = formData[field.name];
      const errors = validateField(field, value);
      
      if (errors.length > 0) {
        newErrors[field.name] = errors[0];
      }
      
      // Mark all fields as touched
      newTouchedFields[field.name] = true;
    });
    
    setValidationErrors(newErrors);
    setTouchedFields(newTouchedFields);
    
    return Object.keys(newErrors).length === 0;
  };

  const handlePreviewClick = () => {
    const isValid = validateAllFields();
    if (isValid) {
      setIsPreviewMode(true);
    }
  };

  const handleEditClick = () => {
    setIsPreviewMode(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isPreviewMode) {
      // In preview mode, proceed with submission
      if (onSubmit) {
        onSubmit(formData);
      }
    } else {
      // In edit mode, validate and switch to preview if valid
      const isValid = validateAllFields();
      if (isValid) {
        setIsPreviewMode(true);
      }
    }
  };

  const clearDraft = () => {
    if (template?.id) {
      localStorage.removeItem(`form_draft_${template.id}`);
      setDraftSaved(false);
      setDraftTimestamp(null);
      onChange({});
    }
  };

  if (!template?.mergeFields || template.mergeFields.length === 0) {
    return (
      <div className="dynamic-form">
        <div className="no-fields">
          <p>This template doesn't have any merge fields configured.</p>
          <p>You can generate the document as-is, or edit the template to add merge fields.</p>
        </div>
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <form className="dynamic-form" onSubmit={handleSubmit}>
        <FormPreview 
          formData={formData} 
          template={template} 
          onEdit={handleEditClick} 
        />
        
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={handleEditClick}>
            Back to Edit
          </button>
          <button type="submit" className="primary-button">
            Generate Document
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="dynamic-form" onSubmit={handleSubmit}>
      {draftSaved && draftTimestamp && (
        <div className="draft-info">
          <div className="draft-message">
            <span className="draft-icon">💾</span>
            Draft automatically saved ({draftTimestamp.toLocaleTimeString()})
          </div>
          <button 
            type="button" 
            className="clear-draft-button"
            onClick={clearDraft}
          >
            Clear Draft
          </button>
        </div>
      )}
      
      <FormValidation 
        errors={validationErrors}
        touched={touchedFields}
      />
      
      <FieldGroups
        fields={template.mergeFields}
        values={formData}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        errors={validationErrors}
      />
      
      <div className="form-actions">
        <button 
          type="button" 
          className="secondary-button"
          onClick={clearDraft}
          disabled={!draftSaved}
        >
          Reset Form
        </button>
        <button 
          type="button" 
          className="primary-button"
          onClick={handlePreviewClick}
        >
          Preview & Generate
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
