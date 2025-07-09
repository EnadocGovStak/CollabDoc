import React from 'react';
import './FormPreview.css';

/**
 * FormPreview component shows a preview of the form data
 * before final submission
 */
const FormPreview = ({ formData, template, onEdit }) => {
  if (!formData || !template) {
    return null;
  }

  // Group fields by category
  const groupedFields = template.mergeFields.reduce((groups, field) => {
    const category = field.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
    return groups;
  }, {});

  // Sort categories to show important ones first
  const categoryOrder = ['Personal', 'Company', 'Employment', 'Legal', 'Finance', 'Project', 'Other'];
  const sortedCategories = Object.keys(groupedFields).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  // Format value based on field type
  const formatValue = (field, value) => {
    if (!value && value !== 0) return '-';
    
    switch (field.type) {
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return value;
        }
      case 'number':
        return Number(value).toLocaleString();
      default:
        return value;
    }
  };

  return (
    <div className="form-preview">
      <div className="preview-header">
        <h3>Preview Information</h3>
        <button 
          type="button" 
          className="edit-button"
          onClick={onEdit}
        >
          Edit Information
        </button>
      </div>
      
      {sortedCategories.map(category => {
        const fields = groupedFields[category];
        const hasValues = fields.some(field => formData[field.name]);
        
        if (!hasValues) return null;
        
        return (
          <div key={category} className="preview-section">
            <h4 className="preview-category">{category}</h4>
            <div className="preview-fields">
              {fields.map(field => {
                const value = formData[field.name];
                if (!value && value !== 0) return null;
                
                return (
                  <div key={field.name} className="preview-field">
                    <div className="preview-field-name">{field.name}:</div>
                    <div className="preview-field-value">
                      {formatValue(field, value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FormPreview;
