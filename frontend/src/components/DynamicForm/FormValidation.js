import React from 'react';
import './FormValidation.css';

/**
 * FormValidation component displays field validation errors in real-time
 * Provides visual feedback on form validation status
 */
const FormValidation = ({ 
  errors, 
  touched, 
  showSummary = true,
  highlightFields = true 
}) => {
  // Count the number of errors
  const errorCount = Object.keys(errors).length;
  
  // Check if we have any errors to show
  const hasErrors = errorCount > 0;
  
  // Filter to only show errors for fields that have been touched
  const touchedErrors = touched 
    ? Object.keys(errors)
      .filter(fieldName => touched[fieldName])
      .reduce((acc, fieldName) => {
        acc[fieldName] = errors[fieldName];
        return acc;
      }, {})
    : errors;
    
  // Count errors that are for touched fields
  const touchedErrorCount = Object.keys(touchedErrors).length;
  
  if (!hasErrors || !showSummary) {
    return null;
  }
  
  return (
    <div className="form-validation">
      <div className={`validation-summary ${touchedErrorCount > 0 ? 'has-errors' : ''}`}>
        {touchedErrorCount > 0 ? (
          <>
            <div className="validation-icon">⚠️</div>
            <div className="validation-message">
              <h4>Please fix the following issues:</h4>
              <ul className="validation-error-list">
                {Object.entries(touchedErrors).map(([fieldName, error]) => (
                  <li key={fieldName} className="validation-error-item">
                    <a 
                      href={`#${fieldName}`} 
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(fieldName)?.focus();
                      }}
                    >
                      {error}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : errorCount > 0 ? (
          <div className="validation-pending">
            <div className="validation-icon">ℹ️</div>
            <div className="validation-message">
              There are {errorCount} field(s) that need attention.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FormValidation;
