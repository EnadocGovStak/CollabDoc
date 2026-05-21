const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const fieldLibraryPath = path.join(dataDir, 'field-library.json');

const VALID_TYPES = new Set(['text', 'textarea', 'number', 'email', 'date', 'select', 'dropdown']);

const ensureFieldLibraryFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(fieldLibraryPath)) {
    fs.writeFileSync(fieldLibraryPath, JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      fields: []
    }, null, 2));
  }
};

const readLibrary = () => {
  ensureFieldLibraryFile();
  return JSON.parse(fs.readFileSync(fieldLibraryPath, 'utf8'));
};

const writeLibrary = (library) => {
  ensureFieldLibraryFile();
  fs.writeFileSync(fieldLibraryPath, JSON.stringify({
    ...library,
    updatedAt: new Date().toISOString()
  }, null, 2));
};

const humanizeFieldName = (name = '') => name
  .replace(/_/g, ' ')
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^./, value => value.toUpperCase());

const inferType = (name = '') => {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('email')) return 'email';
  if (normalizedName.includes('date')) return 'date';
  if (
    normalizedName.includes('amount') ||
    normalizedName.includes('salary') ||
    normalizedName.includes('budget') ||
    normalizedName.includes('rate') ||
    normalizedName.includes('days') ||
    normalizedName.includes('hours')
  ) {
    return 'number';
  }
  if (
    normalizedName.includes('address') ||
    normalizedName.includes('description') ||
    normalizedName.includes('purpose') ||
    normalizedName.includes('terms') ||
    normalizedName.includes('conditions')
  ) {
    return 'textarea';
  }

  return 'text';
};

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];

  return options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }

    return {
      label: option.label || option.value,
      value: option.value || option.label
    };
  }).filter(option => option.label && option.value);
};

const normalizeField = (field) => {
  const name = String(field?.name || '').trim();
  if (!name) return null;

  const type = VALID_TYPES.has(field.type) ? field.type : inferType(name);

  return {
    name,
    label: field.label || humanizeFieldName(name),
    type,
    category: field.category || 'General',
    required: field.required === true,
    defaultValue: field.defaultValue || '',
    description: field.description || '',
    options: normalizeOptions(field.options),
    validation: field.validation || {},
    exampleValue: field.exampleValue || '',
    managed: true,
    libraryId: name
  };
};

const getAllFields = (filters = {}) => {
  const library = readLibrary();
  const query = filters.q?.toLowerCase();
  const category = filters.category?.toLowerCase();
  const type = filters.type?.toLowerCase();

  return (library.fields || [])
    .map(normalizeField)
    .filter(Boolean)
    .filter(field => !query || [field.name, field.label, field.description, field.category]
      .some(value => value?.toLowerCase().includes(query)))
    .filter(field => !category || field.category.toLowerCase() === category)
    .filter(field => !type || field.type.toLowerCase() === type)
    .sort((first, second) => first.category.localeCompare(second.category) || first.label.localeCompare(second.label));
};

const getFieldByName = (fieldName) => {
  const normalizedName = String(fieldName || '').toLowerCase();
  return getAllFields().find(field => field.name.toLowerCase() === normalizedName) || null;
};

const getLibrarySummary = () => {
  const fields = getAllFields();
  return {
    count: fields.length,
    categories: [...new Set(fields.map(field => field.category))].sort(),
    types: [...new Set(fields.map(field => field.type))].sort()
  };
};

const upsertField = (fieldData) => {
  const normalizedField = normalizeField(fieldData);
  if (!normalizedField) {
    return { success: false, error: 'Field name is required' };
  }

  const library = readLibrary();
  const fields = library.fields || [];
  const existingIndex = fields.findIndex(field => field.name.toLowerCase() === normalizedField.name.toLowerCase());
  const fieldToSave = {
    ...normalizedField,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    fields[existingIndex] = {
      ...fields[existingIndex],
      ...fieldToSave
    };
  } else {
    fields.push({
      ...fieldToSave,
      createdAt: new Date().toISOString()
    });
  }

  writeLibrary({ ...library, fields });

  return {
    success: true,
    field: fieldToSave
  };
};

const createUnmanagedField = (fieldName, existingDefinition = {}) => {
  const name = String(existingDefinition.name || fieldName || '').trim();

  return {
    name,
    label: existingDefinition.label || humanizeFieldName(name),
    type: existingDefinition.type || inferType(name),
    category: existingDefinition.category || 'Unmanaged Fields',
    required: existingDefinition.required === true,
    defaultValue: existingDefinition.defaultValue || '',
    description: existingDefinition.description || 'Detected from template content. Add it to the field library to govern reuse and validation.',
    options: normalizeOptions(existingDefinition.options),
    validation: existingDefinition.validation || {},
    exampleValue: existingDefinition.exampleValue || '',
    managed: false,
    migrationStatus: 'missing-library-definition'
  };
};

const enrichFieldDefinition = (fieldName, existingDefinition = {}) => {
  const name = String(existingDefinition.name || fieldName || '').trim();
  const managedField = getFieldByName(name);

  if (!managedField) {
    return createUnmanagedField(name, existingDefinition);
  }

  return {
    name: managedField.name,
    label: managedField.label,
    type: managedField.type,
    category: managedField.category,
    required: typeof existingDefinition.required === 'boolean' ? existingDefinition.required : managedField.required,
    description: managedField.description || existingDefinition.description,
    defaultValue: existingDefinition.defaultValue || managedField.defaultValue,
    options: normalizeOptions(managedField.options?.length ? managedField.options : existingDefinition.options),
    validation: {
      ...managedField.validation,
      ...(existingDefinition.validation || {})
    },
    exampleValue: existingDefinition.exampleValue || managedField.exampleValue,
    managed: true,
    libraryId: managedField.name
  };
};

const analyzeTemplateFields = (template, extractedFields = []) => {
  const existingDefinitions = Array.isArray(template?.mergeFields) ? template.mergeFields : [];
  const existingByName = new Map(existingDefinitions.map(field => [String(field.name).toLowerCase(), field]));
  const orderedNames = [];

  [...extractedFields, ...existingDefinitions.map(field => field.name)]
    .filter(Boolean)
    .forEach(fieldName => {
      const key = String(fieldName).toLowerCase();
      if (!orderedNames.some(existingName => existingName.toLowerCase() === key)) {
        orderedNames.push(String(fieldName));
      }
    });

  const mergeFields = orderedNames
    .filter(fieldName => fieldName !== 'signature_field')
    .map(fieldName => enrichFieldDefinition(fieldName, existingByName.get(fieldName.toLowerCase()) || {}));

  const managedFields = mergeFields.filter(field => field.managed);
  const unmanagedFields = mergeFields.filter(field => !field.managed);

  return {
    templateId: template?.id,
    templateName: template?.name,
    extractedFields,
    mergeFields,
    managedFields,
    unmanagedFields,
    unknownFields: unmanagedFields.map(field => field.name),
    managedFieldCount: managedFields.length,
    unmanagedFieldCount: unmanagedFields.length,
    migrationRequired: unmanagedFields.length > 0
  };
};

module.exports = {
  getAllFields,
  getFieldByName,
  getLibrarySummary,
  upsertField,
  enrichFieldDefinition,
  analyzeTemplateFields
};