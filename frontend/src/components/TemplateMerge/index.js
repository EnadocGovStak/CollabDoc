// Template Merge Components - Completely isolated from main document editor
export { default as TemplateMergeEngine, useTemplateMerge } from './TemplateMergeEngine';
export { default as TemplateMergeForm } from './TemplateMergeForm';
export { default as TemplateMergePreview } from './TemplateMergePreview';

// Re-export commonly used utilities
export const mergeTemplate = (templateContent, mergeData) => {
  const TemplateMergeEngine = require('./TemplateMergeEngine').default;
  return TemplateMergeEngine.mergeTemplate(templateContent, mergeData);
};

export const extractMergeFields = (templateContent) => {
  const TemplateMergeEngine = require('./TemplateMergeEngine').default;
  return TemplateMergeEngine.extractMergeFields(templateContent);
};

export const validateMergeData = (mergeData, requiredFields) => {
  const TemplateMergeEngine = require('./TemplateMergeEngine').default;
  return TemplateMergeEngine.validateMergeData(mergeData, requiredFields);
};
