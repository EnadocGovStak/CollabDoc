import React from 'react';

class SyncfusionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorCount: 0,
      lastError: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      lastError: error.message || 'Unknown error'
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Syncfusion DocumentEditor Error:', error, errorInfo);
    
    // Increment error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));

    // Auto-trigger fallback after 2 errors
    if (this.state.errorCount >= 1 && this.props.onError) {
      console.warn('Multiple Syncfusion errors detected, triggering fallback editor');
      this.props.onError(error);
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state if document changes
    if (prevProps.documentId !== this.props.documentId) {
      this.setState({ hasError: false, errorCount: 0, lastError: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          margin: '10px'
        }}>
          <h3>Document Editor Error</h3>
          <p>The advanced editor encountered an error: {this.state.lastError}</p>
          <p>Switching to fallback editor...</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, errorCount: 0, lastError: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Retry Advanced Editor
          </button>
          <button 
            onClick={() => {
              if (this.props.onFallback) {
                this.props.onFallback();
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Use Simple Editor
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SyncfusionErrorBoundary;
