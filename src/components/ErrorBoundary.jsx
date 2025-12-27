import { Component } from 'react';
import { clearHabitQuestStorage } from '../lib/storage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReset = () => {
    // Clear HabitQuest-specific storage and reload
    clearHabitQuestStorage();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h1 style={styles.title}>Something went wrong</h1>
          <p style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div style={styles.buttonContainer}>
            <button
              onClick={this.handleRetry}
              style={styles.retryButton}
              type="button"
            >
              Try Again
            </button>
            <button
              onClick={this.handleReset}
              style={styles.resetButton}
              type="button"
            >
              Reset App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2rem',
    color: '#ef4444',
    letterSpacing: '0.1em',
    marginBottom: '16px'
  },
  message: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1rem',
    marginBottom: '24px',
    maxWidth: '400px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#22c55e',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  resetButton: {
    padding: '12px 24px',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default ErrorBoundary;
