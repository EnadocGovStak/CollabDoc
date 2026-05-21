import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Edit3,
  ListFilter,
  Plus,
  RotateCcw,
  Save,
  Search,
  Tags,
  Type
} from 'lucide-react';
import TemplateService from '../services/TemplateService';
import './FieldLibraryPage.css';

const emptyField = {
  name: '',
  label: '',
  type: 'text',
  category: 'General',
  required: false,
  defaultValue: '',
  description: '',
  exampleValue: '',
  optionsText: ''
};

const fieldTypes = ['text', 'textarea', 'number', 'email', 'date', 'select', 'dropdown'];

const formatFieldType = (fieldType) => fieldType
  .split('-')
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const getFieldExample = (field) => field.exampleValue || field.defaultValue || 'No example set';

const toFormField = (field) => ({
  ...emptyField,
  ...field,
  optionsText: (field.options || []).map(option => option.label || option.value || option).join('\n')
});

const toPayload = (formField) => ({
  name: formField.name.trim(),
  label: formField.label.trim(),
  type: formField.type,
  category: formField.category.trim() || 'General',
  required: formField.required,
  defaultValue: formField.defaultValue,
  description: formField.description,
  exampleValue: formField.exampleValue,
  options: ['select', 'dropdown'].includes(formField.type)
    ? formField.optionsText
      .split('\n')
      .map(value => value.trim())
      .filter(Boolean)
    : []
});

const FieldLibraryPage = () => {
  const [fields, setFields] = useState([]);
  const [summary, setSummary] = useState({ count: 0, categories: [], types: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [formField, setFormField] = useState(emptyField);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await TemplateService.getFieldLibrary();
      setFields(result.fields || []);
      setSummary(result.summary || { count: 0, categories: [], types: [] });
    } catch (loadError) {
      console.error('Error loading field library:', loadError);
      setError('Failed to load field library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const filteredFields = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return fields.filter(field => {
      const matchesQuery = !normalizedQuery || [field.name, field.label, field.description, field.category]
        .some(value => value?.toLowerCase().includes(normalizedQuery));
      const matchesCategory = !category || field.category === category;
      const matchesType = !type || field.type === type;

      return matchesQuery && matchesCategory && matchesType;
    });
  }, [fields, query, category, type]);

  const requiredFieldCount = useMemo(() => fields.filter(field => field.required).length, [fields]);
  const activeFilterCount = [query.trim(), category, type].filter(Boolean).length;

  const handleFieldChange = (event) => {
    const { name, value, type: inputType, checked } = event.target;
    setFormField(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleSelectField = (field) => {
    setFormField(toFormField(field));
    setSaveStatus('');
  };

  const handleReset = () => {
    setFormField(emptyField);
    setSaveStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formField.name.trim()) {
      setSaveStatus('Field name is required');
      return;
    }

    try {
      setSaving(true);
      setSaveStatus('Saving...');
      const result = await TemplateService.upsertFieldLibraryField(toPayload(formField));

      if (!result.success) {
        setSaveStatus(result.error || 'Field save failed');
        return;
      }

      setSaveStatus('Field saved');
      setFormField(toFormField(result.field));
      await loadFields();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="field-library-page">
      <header className="field-library-hero">
        <div className="field-library-hero-copy">
          <p className="field-library-eyebrow">Template foundation</p>
          <h1>Field Library</h1>
          <p>Manage reusable metadata definitions, merge fields, and governance-ready template inputs from one shared catalogue.</p>
        </div>

        <div className="field-library-summary" aria-label="Field library summary">
          <span>
            <strong>{summary.count}</strong>
            <small>Managed fields</small>
          </span>
          <span>
            <strong>{summary.categories.length}</strong>
            <small>Categories</small>
          </span>
          <span>
            <strong>{requiredFieldCount}</strong>
            <small>Required</small>
          </span>
        </div>

        <button className="field-primary-button" type="button" onClick={handleReset}>
          <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          <span>New Field</span>
        </button>
      </header>

      {error && (
        <div className="field-library-error">
          <ListFilter size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="field-library-layout">
        <section className="field-library-main" aria-label="Managed fields">
          <div className="field-library-toolbar">
            <div className="field-search-control">
              <Search size={17} strokeWidth={2.1} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search field names or descriptions"
                aria-label="Search fields"
              />
            </div>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
              <option value="">All categories</option>
              {summary.categories.map(categoryName => (
                <option key={categoryName} value={categoryName}>{categoryName}</option>
              ))}
            </select>
            <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by type">
              <option value="">All types</option>
              {fieldTypes.map(fieldType => (
                <option key={fieldType} value={fieldType}>{fieldType}</option>
              ))}
            </select>
            <span className="field-results-count">{filteredFields.length} shown</span>
          </div>

          {summary.categories.length > 0 && (
            <div className="field-category-chips" aria-label="Field categories">
              <button type="button" className={category ? '' : 'active'} onClick={() => setCategory('')}>All Fields</button>
              {summary.categories.map(categoryName => (
                <button
                  key={categoryName}
                  type="button"
                  className={category === categoryName ? 'active' : ''}
                  onClick={() => setCategory(categoryName)}
                >
                  {categoryName}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="field-library-message">Loading fields...</div>
          ) : filteredFields.length === 0 ? (
            <div className="field-library-message">No fields match the current filters.</div>
          ) : (
            <div className="field-library-table-wrapper">
              <table className="field-library-table">
                <caption className="sr-only">Managed field definitions</caption>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Example</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFields.map(field => (
                    <tr key={field.name}>
                      <td data-label="Field">
                        <div className="field-name-cell">
                          <span className="field-row-icon" aria-hidden="true"><Database size={17} strokeWidth={2.1} /></span>
                          <span>
                            <strong>{field.label}</strong>
                            <small>{field.name}</small>
                            {field.description && <em>{field.description}</em>}
                          </span>
                        </div>
                      </td>
                      <td data-label="Category"><span className="field-category-badge">{field.category}</span></td>
                      <td data-label="Type"><span className="field-type-badge">{formatFieldType(field.type)}</span></td>
                      <td data-label="Required">
                        <span className={`field-required-status${field.required ? ' required' : ''}`}>
                          {field.required ? <CheckCircle2 size={14} aria-hidden="true" /> : null}
                          {field.required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td data-label="Example"><span className="field-example-value">{getFieldExample(field)}</span></td>
                      <td data-label="Action">
                        <button className="field-text-button" type="button" onClick={() => handleSelectField(field)}>
                          <Edit3 size={14} strokeWidth={2.2} aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="field-library-editor" aria-label="Field editor">
          <form onSubmit={handleSubmit}>
            <div className="field-editor-heading">
              <span className="field-editor-icon" aria-hidden="true"><Tags size={18} strokeWidth={2.1} /></span>
              <span>
                <h2>{formField.name ? 'Edit Field' : 'New Field'}</h2>
                <p>{formField.name ? 'Update the managed field definition.' : 'Create a reusable field for template authoring.'}</p>
              </span>
              {saveStatus && <span className="field-save-status">{saveStatus}</span>}
            </div>

            <label>
              Name
              <input name="name" value={formField.name} onChange={handleFieldChange} placeholder="CompanyName" />
            </label>

            <label>
              Label
              <input name="label" value={formField.label} onChange={handleFieldChange} placeholder="Company name" />
            </label>

            <div className="field-form-grid">
              <label>
                Category
                <input name="category" value={formField.category} onChange={handleFieldChange} placeholder="Organization" />
              </label>

              <label>
                Type
                <span className="field-input-with-icon">
                  <Type size={15} aria-hidden="true" />
                <select name="type" value={formField.type} onChange={handleFieldChange}>
                  {fieldTypes.map(fieldType => (
                    <option key={fieldType} value={fieldType}>{fieldType}</option>
                  ))}
                </select>
                </span>
              </label>
            </div>

            <label className="field-checkbox-label">
              <input name="required" type="checkbox" checked={formField.required} onChange={handleFieldChange} />
              Required by default
            </label>

            <label>
              Description
              <textarea name="description" value={formField.description} onChange={handleFieldChange} rows={3} />
            </label>

            <div className="field-form-grid">
              <label>
                Default value
                <input name="defaultValue" value={formField.defaultValue} onChange={handleFieldChange} />
              </label>

              <label>
                Example value
                <input name="exampleValue" value={formField.exampleValue} onChange={handleFieldChange} />
              </label>
            </div>

            {['select', 'dropdown'].includes(formField.type) && (
              <label>
                Options
                <textarea name="optionsText" value={formField.optionsText} onChange={handleFieldChange} rows={5} />
              </label>
            )}

            <div className="field-editor-actions">
              <button type="button" className="field-secondary-button" onClick={handleReset}>
                <RotateCcw size={15} strokeWidth={2.2} aria-hidden="true" />
                <span>Clear</span>
              </button>
              <button type="submit" className="field-primary-button" disabled={saving}>
                <Save size={15} strokeWidth={2.2} aria-hidden="true" />
                <span>{saving ? 'Saving...' : 'Save Field'}</span>
              </button>
            </div>

            {activeFilterCount > 0 && (
              <p className="field-editor-note">{activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'} on the library list.</p>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
};

export default FieldLibraryPage;