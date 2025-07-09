import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        <h1>Document Templates</h1>
        <Link to="/templates/new" className="new-template-button">
          Create New Template
        </Link>
      </div>

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
              {filteredTemplates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-content">
                    <div className="template-icon">
                      {template.category === 'Legal' ? '⚖️' :
                       template.category === 'Finance' ? '💰' :
                       template.category === 'HR' ? '👥' :
                       template.category === 'Business' ? '💼' : '📄'}
                    </div>
                    <div className="template-details">
                      <h3 className="template-name">{template.name}</h3>
                      {template.description && (
                        <p className="template-description">{template.description}</p>
                      )}
                      <div className="template-meta">
                        {template.category && (
                          <span className="template-category">{template.category}</span>
                        )}
                        <span className="template-date">
                          {template.modifiedAt 
                            ? `Modified: ${new Date(template.modifiedAt).toLocaleDateString()}` 
                            : `Created: ${new Date(template.createdAt).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="template-actions">
                    <Link 
                      to={`/templates/${template.id}/generate`}
                      className="template-action-btn template-generate-btn"
                      title="Generate Document"
                    >
                      Generate Document
                    </Link>
                    <Link 
                      to={`/templates/${template.id}/edit`}
                      className="template-action-btn template-edit-btn"
                      title="Edit Template"
                    >
                      Edit
                    </Link>
                    <button 
                      className="template-action-btn template-delete-btn" 
                      onClick={(e) => handleDeleteTemplate(template.id, e)}
                      title="Delete Template"
                    >
                      Delete
                    </button>
                    <button 
                      className="template-action-btn template-preview-btn"
                      onClick={(e) => handlePreviewTemplate(template.id, e)}
                      title="Preview Template"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
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