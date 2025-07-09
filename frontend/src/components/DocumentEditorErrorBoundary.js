import React from 'react';

class DocumentEditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('DocumentEditor Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" style={{
          padding: '20px',
          backgroundColor: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '4px',
          margin: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#e53e3e', marginBottom: '10px' }}>
            Document Editor Error
          </h3>
          <p style={{ color: '#4a5568', marginBottom: '15px' }}>
            Something went wrong with the document editor. This is usually temporary.
          </p>
          <div style={{ marginBottom: '15px' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#718096',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ textAlign: 'left', fontSize: '12px', color: '#718096' }}>
              <summary>Error Details (Development Mode)</summary>
              <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default DocumentEditorErrorBoundary;
