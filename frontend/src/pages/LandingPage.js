import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <img
          className="landing-hero-background"
          src="/images/Media.jpg"
          alt=""
          aria-hidden="true"
        />
        <div className="landing-hero-content">
          <img
            className="landing-brand-image"
            src="/images/Media.jpg"
            alt="evia collab"
          />
          <h1 id="landing-title">evia collab</h1>
          <p className="landing-hero-copy">
            A focused document workspace for drafting, template generation, collaboration, and records-ready document control.
          </p>
          <div className="landing-actions">
            <Link to="/documents" className="landing-primary-action">
              Open Documents
            </Link>
            <Link to="/templates" className="landing-secondary-action">
              Browse Templates
            </Link>
          </div>
        </div>
        <div className="landing-workspace-preview" aria-label="Document workflow overview">
          <div className="landing-preview-header">
            <span>Invoice Template - Generated</span>
            <strong>v1</strong>
          </div>
          <div className="landing-preview-body">
            <div className="landing-preview-sidebar">
              <span>Public</span>
              <span>1 Year</span>
              <span>Draft</span>
            </div>
            <div className="landing-preview-document">
              <h2>INVOICE</h2>
              <p>From: Wasantha Corp</p>
              <p>To: Momoma Coup</p>
              <p>Services: Heritage</p>
              <div className="landing-preview-line" />
              <div className="landing-preview-line short" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-product-band" aria-label="Product capabilities">
        <div className="landing-band-inner">
          <div className="landing-capability">
            <strong>Template driven</strong>
            <span>Generate documents from managed fields and reusable business templates.</span>
          </div>
          <div className="landing-capability">
            <strong>Editor centered</strong>
            <span>Review and refine generated documents in the same workspace.</span>
          </div>
          <div className="landing-capability">
            <strong>Records aware</strong>
            <span>Track classification, retention, versions, and final document state.</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;