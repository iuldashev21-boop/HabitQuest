import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ResetPassword = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if we have a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to app after 2 seconds
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        window.location.href = '/';
      }
    }, 2000);
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>HABITQUEST</h1>
          <div style={styles.successIcon}>&#10003;</div>
          <p style={styles.successText}>Password updated successfully!</p>
          <p style={styles.redirectText}>Redirecting to app...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>HABITQUEST</h1>
        <p style={styles.tagline}>Set Your New Password</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            minLength={6}
            required
            autoFocus
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            minLength={6}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>

        <a href="/" style={styles.backLink}>
          Back to Sign In
        </a>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #333',
    textAlign: 'center'
  },
  logo: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2.5rem',
    color: '#ffffff',
    marginBottom: '8px',
    letterSpacing: '0.1em'
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '32px',
    fontSize: '0.9rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    backgroundColor: '#111111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  button: {
    fontFamily: '"Bebas Neue", sans-serif',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '1.1rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'transform 0.2s ease, opacity 0.2s ease'
  },
  error: {
    color: '#ef4444',
    fontSize: '0.875rem',
    margin: 0
  },
  successIcon: {
    fontSize: '3rem',
    color: '#22c55e',
    marginBottom: '16px'
  },
  successText: {
    color: '#22c55e',
    fontSize: '1.1rem',
    marginBottom: '8px'
  },
  redirectText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem'
  },
  backLink: {
    display: 'block',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
    marginTop: '24px',
    textDecoration: 'none'
  }
};

export default ResetPassword;
