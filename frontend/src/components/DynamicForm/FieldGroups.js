import React, { useState } from 'react';
import FieldRenderer from './FieldRenderer';
import './FieldGroups.css';

const FieldGroups = ({ fields, values, onChange, onBlur, errors, validationSchema }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  // Group fields by category
  const groupedFields = fields.reduce((groups, field) => {
    const category = field.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
    return groups;
  }, {});

  // Sort categories to show important ones first
  const categoryOrder = ['Personal', 'Company', 'Employment', 'Legal', 'Finance', 'Project', 'General'];
  const sortedCategories = Object.keys(groupedFields).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  const toggleGroup = (category) => {
    setExpandedGroups(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Personal': '👤',
      'Company': '🏢',
      'Employment': '💼',
      'Legal': '⚖️',
      'Finance': '💰',
      'Project': '📋',
      'General': '📄'
    };
    return icons[category] || '📄';
  };

  const getCategoryStats = (categoryFields) => {
    const total = categoryFields.length;
    const filled = categoryFields.filter(field => {
      const value = values[field.name];
      return value && value.toString().trim() !== '';
    }).length;
    const required = categoryFields.filter(field => field.required).length;
    const requiredFilled = categoryFields.filter(field => {
      if (!field.required) return true;
      const value = values[field.name];
      return value && value.toString().trim() !== '';
    }).length;
    
    return { total, filled, required, requiredFilled };
  };

  const getValidationSummary = (categoryFields) => {
    const fieldsWithErrors = categoryFields.filter(field => errors[field.name]);
    return fieldsWithErrors.length;
  };

  // Auto-expand groups that have required fields or errors
  React.useEffect(() => {
    const autoExpand = {};
    sortedCategories.forEach(category => {
      const categoryFields = groupedFields[category];
      const hasRequired = categoryFields.some(field => field.required);
      const hasErrors = categoryFields.some(field => errors[field.name]);
      const stats = getCategoryStats(categoryFields);
      
      // Auto-expand if has required fields, errors, or if it's Personal/Company
      if (hasRequired || hasErrors || ['Personal', 'Company'].includes(category)) {
        autoExpand[category] = true;
      }
    });
    
    setExpandedGroups(prev => ({ ...autoExpand, ...prev }));
  }, [fields, errors]);

  return (
    <div className="field-groups">
      {sortedCategories.map(category => {
        const categoryFields = groupedFields[category];
        const isExpanded = expandedGroups[category];
        const stats = getCategoryStats(categoryFields);
        const errorCount = getValidationSummary(categoryFields);
        const hasRequiredFields = categoryFields.some(field => field.required);
        
        return (
          <div key={category} className={`field-group ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div 
              className={`field-group-header ${hasRequiredFields ? 'has-required' : ''} ${errorCount > 0 ? 'has-errors' : ''}`}
              onClick={() => toggleGroup(category)}
            >
              <div className="group-header-left">
                <span className="group-icon">{getCategoryIcon(category)}</span>
                <h3 className="group-title">{category}</h3>
                {hasRequiredFields && (
                  <span className="required-indicator" title="Contains required fields">*</span>
                )}
              </div>
              
              <div className="group-header-right">
                <div className="group-stats">
                  <span className="fields-filled">{stats.filled}/{stats.total}</span>
                  {stats.required > 0 && (
                    <span className={`required-filled ${stats.requiredFilled === stats.required ? 'complete' : 'incomplete'}`}>
                      ({stats.requiredFilled}/{stats.required} required)
                    </span>
                  )}
                </div>
                
                {errorCount > 0 && (
                  <div className="error-count" title={`${errorCount} field(s) with errors`}>
                    ❌ {errorCount}
                  </div>
                )}
                
                <div className="expand-icon">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="field-group-content">
                <div className="fields-grid">
                  {categoryFields.map(field => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      value={values[field.name] || field.defaultValue || ''}
                      onChange={(value) => onChange(field.name, value)}
                      onBlur={() => onBlur && onBlur(field.name)}
                      error={errors[field.name]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FieldGroups;
