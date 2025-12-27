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
    // Supabase automatically handles the token from the URL hash
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked on the recovery link
          console.log('[ResetPassword] Recovery mode detected');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Clear sensitive fields
        setPassword('');
        setConfirmPassword('');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>HABITQUEST</h1>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Password Reset!</h2>
          <p style={styles.successText}>
            Your password has been updated successfully.
            Redirecting to login...
          </p>
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
            autoComplete="new-password"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            minLength={6}
            required
            autoComplete="new-password"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'RESET PASSWORD'}
          </button>
        </form>

        <p style={styles.hint}>
          Password must be at least 6 characters
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center'
  },
  logo: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2.5rem',
    color: '#ffffff',
    letterSpacing: '0.2em',
    marginBottom: '8px'
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1rem',
    marginBottom: '32px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#1A1A1A',
    border: '1px solid #333333',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    color: '#000000',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.125rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#ef4444',
    fontSize: '0.875rem',
    textAlign: 'center',
    margin: 0
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.75rem',
    marginTop: '16px'
  },
  successIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: '#22c55e'
  },
  successTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#22c55e',
    marginBottom: '8px'
  },
  successText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem'
  }
};

export default ResetPassword;
