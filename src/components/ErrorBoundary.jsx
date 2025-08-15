import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Optionally log to a service
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl">☹️</div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h2>
            <p className="mt-2 text-gray-600">Please reload the page or try again later.</p>
            <button onClick={() => window.location.reload()} className="mt-4 btn-primary">Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary; 