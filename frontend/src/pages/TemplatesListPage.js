import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FilePlus2, Library, PlusCircle, ShieldCheck, Sparkles } from 'lucide-react';
import TemplateService from '../services/TemplateService';
import CategoryFilter from '../components/TemplateSelector/CategoryFilter';
import SearchBar from '../components/TemplateSelector/SearchBar';
import TemplatePreviewModal from '../components/TemplateSelector/TemplatePreviewModal';
import './TemplatesListPage.css';

const TemplatesListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const templatesData = await TemplateService.getTemplates();
        setTemplates(templatesData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(templatesData
          .filter(template => template.category)
          .map(template => template.category))];
        
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Handle template deletion
  const handleDeleteTemplate = async (templateId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      await TemplateService.deleteTemplate(templateId);
      // Update the templates list after deletion
      const updatedTemplates = templates.filter(template => template.id !== templateId);
      setTemplates(updatedTemplates);
      
      // Re-extract categories after deletion
      const uniqueCategories = [...new Set(updatedTemplates
        .filter(template => template.category)
        .map(template => template.category))];
      
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Apply filters whenever search term or category changes
  useEffect(() => {
    let filtered = [...templates];
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(lowercaseTerm) ||
        (template.description && template.description.toLowerCase().includes(lowercaseTerm))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory]);

  // Handle template preview
  const handlePreviewTemplate = async (templateId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setLoading(true);
      const templateData = await TemplateService.getTemplateContent(templateId);
      setSelectedTemplate(templateData);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error('Error loading template for preview:', err);
      alert('Failed to load template for preview');
    } finally {
      setLoading(false);
    }
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewModalOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="templates-list-page">
      <div className="templates-list-header">
        <div>
          <p className="templates-eyebrow">Template Library</p>
          <h1>Document Templates</h1>
          <p className="templates-page-subtitle">
            Standardize governed document workflows with reusable templates, managed fields, and lifecycle policy.
          </p>
        </div>
        <div className="templates-header-actions">
          <Link to="/field-library" className="field-library-button">
            Field Library
          </Link>
          <Link to="/templates/new" className="new-template-button">
            Create New Template
          </Link>
        </div>
      </div>

      <section className="templates-guided-creation" aria-labelledby="templates-guided-title">
        <div className="templates-guided-copy">
          <p className="templates-guided-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            Guided creation
          </p>
          <h2 id="templates-guided-title">Create governed templates with the right fields from the start.</h2>
          <p>
            Build a reusable template, attach lifecycle policy, and keep merge fields aligned with the Field Library before documents are generated.
          </p>
          <div className="templates-guided-actions">
            <Link to="/templates/new" className="templates-guided-primary">
              <FilePlus2 size={17} aria-hidden="true" />
              Start guided creation
            </Link>
            <Link to="/field-library" className="templates-guided-secondary">
              <Library size={17} aria-hidden="true" />
              Review fields
            </Link>
          </div>
        </div>
        <div className="templates-guided-steps" aria-label="Guided creation steps">
          <div className="templates-guided-step">
            <FilePlus2 size={18} aria-hidden="true" />
            <span>Draft template</span>
          </div>
          <div className="templates-guided-step">
            <Library size={18} aria-hidden="true" />
            <span>Add managed fields</span>
          </div>
          <div className="templates-guided-step">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Attach lifecycle policy</span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="loading-message">Loading templates...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : templates.length === 0 ? (
        <div className="empty-message">
          <p>No templates yet. Click "Create New Template" to get started.</p>
          <p className="empty-description">
            Templates are used to merge with documents when finalizing them for signing.
          </p>
        </div>
      ) : (
        <>
          <div className="templates-filters">
            <div className="templates-result-summary">
              <span>{filteredTemplates.length} of {templates.length} templates</span>
            </div>
            <SearchBar onSearch={handleSearch} />
            {categories.length > 0 && (
              <CategoryFilter 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onCategoryChange={handleCategoryChange} 
              />
            )}
          </div>
          
          {filteredTemplates.length === 0 ? (
            <div className="no-results-message">
              <p>No templates match your search criteria.</p>
              <button 
                className="clear-filters-button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="templates-grid">
              <Link to="/templates/new" className="template-card template-card-create" aria-label="Start guided creation for a new template">
                <div className="template-create-icon">
                  <PlusCircle size={30} aria-hidden="true" />
                </div>
                <p className="template-create-eyebrow">Guided creation</p>
                <h3>Start from blank</h3>
                <p>Create a custom template with managed fields and lifecycle policy.</p>
                <span className="template-create-action">
                  Start creating
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </Link>
              {filteredTemplates.map((template) => {
                const category = template.category?.toLowerCase() || 'other';
                const recordsPolicy = template.recordsManagement || {};
                const categoryInitials = (template.category || 'Template').slice(0, 2).toUpperCase();
                
                return (
                  <div 
                    key={template.id} 
                    className={`template-card category-${category}`}
                  >
                    <div className="template-card-preview" aria-hidden="true">
                      <span>{categoryInitials}</span>
                      <div className="template-preview-sheet">
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                    <div className="template-info">
                      <h3>{template.name}</h3>
                      
                      <div className="template-meta">
                        <div className="template-status">
                          <span className="status-text">Template</span>
                        </div>
                        
                        {template.category && (
                          <div className="template-category-badge">
                            {template.category}
                          </div>
                        )}
                      </div>
                      
                      <div className="template-compact-info">
                        {template.description && (
                          <div className="template-description">
                            <p>{template.description}</p>
                          </div>
                        )}
                        
                        <div className="template-dates">
                          <p className="template-date">
                            Modified: {template.modifiedAt 
                              ? new Date(template.modifiedAt).toLocaleDateString()
                              : new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {(recordsPolicy.classification || recordsPolicy.retentionPeriod) && (
                          <div className="template-lifecycle-policy">
                            {recordsPolicy.classification && <span>{recordsPolicy.classification}</span>}
                            {recordsPolicy.retentionPeriod && <span>{recordsPolicy.retentionPeriod}</span>}
                          </div>
                        )}
                        
                        <div className="template-footer">
                          <span className="template-id">
                            ID: {template.id.substring(0, 8)}...
                          </span>
                          <span className="template-fields-count">
                            {template.managedFieldCount ?? template.mergeFieldCount ?? template.mergeFields?.length ?? 0} managed
                          </span>
                        </div>
                        {template.migrationRequired && (
                          <div className="template-migration-alert">
                            {template.unmanagedFieldCount || 0} unmanaged fields
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="template-actions">
                      <Link
                        to={`/templates/${template.id}/generate`}
                        className="template-action-btn template-generate-btn"
                        title="Generate Document"
                      >
                        Generate
                      </Link>
                      <div className="template-secondary-actions">
                        <Link
                          to={`/templates/${template.id}`}
                          className="template-action-btn template-edit-btn"
                          title="Edit Template"
                        >
                          Edit
                        </Link>
                        <button
                          className="template-action-btn template-preview-btn"
                          onClick={(e) => handlePreviewTemplate(template.id, e)}
                          title="Preview Template"
                        >
                          Preview
                        </button>
                        <button
                          className="template-action-btn template-delete-btn"
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          title="Delete Template"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={previewModalOpen}
        template={selectedTemplate}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default TemplatesListPage;