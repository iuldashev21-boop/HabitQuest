import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email to confirm your account');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>HABITQUEST</h1>
        <p style={styles.tagline}>Forge Your Discipline</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            minLength={6}
            required
          />

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.message}>{message}</p>}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>

        <button
          style={styles.toggle}
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
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
    border: '1px solid #333'
  },
  logo: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2.5rem',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '0.1em'
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
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
  toggle: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginTop: '24px',
    width: '100%',
    textAlign: 'center'
  },
  error: {
    color: '#ef4444',
    fontSize: '0.875rem',
    textAlign: 'center',
    margin: 0
  },
  message: {
    color: '#22c55e',
    fontSize: '0.875rem',
    textAlign: 'center',
    margin: 0
  }
};

export default Auth;
