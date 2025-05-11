import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call to get templates
    setTimeout(() => {
      const mockTemplates = [
        { id: 't1', name: 'Project Proposal', description: 'Standard project proposal template with sections for objectives, timeline, and budget.', category: 'Business' },
        { id: 't2', name: 'Meeting Minutes', description: 'Template for documenting meeting discussions, decisions, and action items.', category: 'Administrative' },
        { id: 't3', name: 'Invoice', description: 'Professional invoice template with calculations for subtotal, tax, and total.', category: 'Finance' },
        { id: 't4', name: 'Resume', description: 'Modern resume template with sections for experience, education, and skills.', category: 'Personal' },
        { id: 't5', name: 'Contract Agreement', description: 'Legal contract template with standard terms and conditions.', category: 'Legal' },
      ];
      setTemplates(mockTemplates);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="templates-container">
      <header className="App-header">
        <h1>Document Templates</h1>
        <Link to="/documents" className="back-link">
          Back to Documents
        </Link>
      </header>
      
      <div className="content-container">
        <h2>Start a new document from a template</h2>
        
        {loading ? (
          <LoadingSpinner message="Loading templates..." />
        ) : (
          <div className="templates-grid">
            {templates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-preview">
                  <div className="template-icon">{template.name.charAt(0)}</div>
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <span className="template-category">{template.category}</span>
                  <p>{template.description}</p>
                  <Link to={`/new-document/${template.id}`} className="button primary">
                    Use Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage; 