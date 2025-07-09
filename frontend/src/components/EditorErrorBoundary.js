import React, { Component } from 'react';

class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Editor Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render error UI
      return (
        <div style={{ 
          padding: '20px',
          backgroundColor: '#fff8f8',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          <h2 style={{ color: '#d32f2f' }}>Document Editor Error</h2>
          <p>There was an error initializing or rendering the document editor component.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details (for developers)</summary>
            <p style={{ fontFamily: 'monospace', marginTop: '10px' }}>
              {this.state.error && this.state.error.toString()}
            </p>
            <p style={{ fontFamily: 'monospace', marginTop: '10px' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </p>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default EditorErrorBoundary;
