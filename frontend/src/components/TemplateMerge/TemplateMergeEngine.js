import React, { useState, useEffect } from 'react';

/**
 * Template Merge Engine - Handles template field merging independently
 * This component is completely isolated from the main document editor
 */
class TemplateMergeEngine {
  /**
   * Merge template content with provided data
   * @param {string|object} templateContent - SFDT template content
   * @param {object} mergeData - Data to merge into template
   * @returns {string} Merged content
   */
  static mergeTemplate(templateContent, mergeData = {}) {
    try {
      let content = templateContent;
      
      // Handle null or undefined content
      if (!content) {
        console.warn('Template content is null or undefined, returning empty string');
        return '';
      }
      
      // Handle SFDT object
      if (typeof content === 'object' && content !== null) {
        content = JSON.stringify(content);
      }
      
      // If content is not a string, try to convert it
      if (typeof content !== 'string') {
        console.warn('Template content is not a valid string or object, attempting conversion');
        content = String(content);
      }
      
      // Log merge operation for debugging
      console.log('Merging template with data:', { 
        contentLength: content.length, 
        mergeFieldCount: Object.keys(mergeData).length,
        mergeFields: Object.keys(mergeData)
      });
      
      // Replace merge fields with actual data
      Object.entries(mergeData).forEach(([key, value]) => {
        const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        const replacement = value !== null && value !== undefined ? String(value) : '';
        const before = content;
        content = content.replace(pattern, replacement);
        
        // Log successful replacements
        if (before !== content) {
          console.log(`Replaced merge field {{${key}}} with "${replacement}"`);
        }
      });

      // Ensure content is in proper format for DocumentEditor
      console.log('TemplateMergeEngine: Checking content format after merge...');
      
      // Check if content is already in SFDT format
      if (content.includes('"sfdt"') || content.includes('"sections"')) {
        console.log('TemplateMergeEngine: Content is already in SFDT format');
        return content;
      }
      
      // If content looks like plain text that starts with {"sfdt":"...
      if (content.startsWith('{"sfdt":"') && content.endsWith('"}')) {
        console.log('TemplateMergeEngine: Content is wrapped SFDT string');
        return content;
      }
      
      // If content is plain text, wrap it in SFDT format
      console.log('TemplateMergeEngine: Converting plain text to SFDT format');
      const sfdtWrapped = JSON.stringify({ "sfdt": content });
      console.log('TemplateMergeEngine: Wrapped content sample:', sfdtWrapped.substring(0, 200));
      return sfdtWrapped;
      
    } catch (error) {
      console.error('Error merging template:', error);
      console.error('Template content type:', typeof templateContent);
      console.error('Template content sample:', templateContent?.substring ? templateContent.substring(0, 200) : templateContent);
      return JSON.stringify({ "sfdt": "Error loading template content" });
    }
  }

  /**
   * Extract merge fields from template content
   * @param {string|object} templateContent - Template content to analyze
   * @returns {string[]} Array of field names found in template
   */
  static extractMergeFields(templateContent) {
    try {
      let content = templateContent;
      
      // Handle SFDT object
      if (typeof content === 'object' && content !== null) {
        content = JSON.stringify(content);
      }
      
      if (typeof content !== 'string') {
        return [];
      }
      
      // Find all merge fields in the format {{fieldName}}
      const fieldPattern = /{{\\s*([^}\\s]+)\\s*}}/g;
      const fields = [];
      let match;
      
      while ((match = fieldPattern.exec(content)) !== null) {
        const fieldName = match[1].trim();
        if (!fields.includes(fieldName)) {
          fields.push(fieldName);
        }
      }
      
      return fields;
    } catch (error) {
      console.error('Error extracting merge fields:', error);
      return [];
    }
  }

  /**
   * Validate merge data against required fields
   * @param {object} mergeData - Data to validate
   * @param {array} requiredFields - Array of required field objects
   * @returns {object} Validation result with errors
   */
  static validateMergeData(mergeData, requiredFields = []) {
    const errors = {};
    const warnings = [];
    
    requiredFields.forEach(field => {
      const fieldName = typeof field === 'string' ? field : field.name;
      const isRequired = typeof field === 'object' ? field.required : true;
      
      if (isRequired && (!mergeData[fieldName] || String(mergeData[fieldName]).trim() === '')) {
        errors[fieldName] = `${fieldName} is required`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Preview template with highlighted unfilled fields
   * @param {string|object} templateContent - Template content
   * @param {object} mergeData - Data to merge
   * @returns {string} Preview content with highlighted fields
   */
  static previewTemplate(templateContent, mergeData = {}) {
    try {
      let content = this.mergeTemplate(templateContent, mergeData);
      
      // Highlight remaining unfilled merge fields
      content = content.replace(/{{\\s*([^}\\s]+)\\s*}}/g, '<span class="unfilled-merge-field">[Unfilled: $1]</span>');
      
      return content;
    } catch (error) {
      console.error('Error previewing template:', error);
      return templateContent;
    }
  }
}

/**
 * React hook for template merging functionality
 * @param {object} template - Template object with content and merge fields
 * @returns {object} Merge utilities and state
 */
export const useTemplateMerge = (template) => {
  const [mergeData, setMergeData] = useState({});
  const [mergedContent, setMergedContent] = useState('');
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });
  const [extractedFields, setExtractedFields] = useState([]);

  // Extract fields when template changes
  useEffect(() => {
    if (template?.content) {
      const fields = TemplateMergeEngine.extractMergeFields(template.content);
      setExtractedFields(fields);
    }
  }, [template]);

  // Update merged content when data changes
  useEffect(() => {
    if (template?.content) {
      const merged = TemplateMergeEngine.mergeTemplate(template.content, mergeData);
      setMergedContent(merged);
    }
  }, [template, mergeData]);

  // Validate data when it changes
  useEffect(() => {
    if (template?.mergeFields) {
      const validation = TemplateMergeEngine.validateMergeData(mergeData, template.mergeFields);
      setValidationResult(validation);
    }
  }, [mergeData, template]);

  const updateMergeData = (newData) => {
    setMergeData(prev => ({ ...prev, ...newData }));
  };

  const resetMergeData = () => {
    setMergeData({});
  };

  const previewContent = template?.content 
    ? TemplateMergeEngine.previewTemplate(template.content, mergeData)
    : '';

  return {
    mergeData,
    setMergeData,
    updateMergeData,
    resetMergeData,
    mergedContent,
    previewContent,
    validationResult,
    extractedFields,
    isValid: validationResult.isValid
  };
};

export default TemplateMergeEngine;
