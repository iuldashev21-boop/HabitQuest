import { useState, useEffect } from 'react';
import useGameStore from './context/useGameStore';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import ResetPassword from './components/ResetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import Welcome from './components/Welcome';
import ProfileSetup from './components/ProfileSetup';
import CommitmentQuestions from './components/CommitmentQuestions';
import ArchetypeSelect from './components/ArchetypeSelect';
import DifficultySelect from './components/DifficultySelect';
import HabitCustomize from './components/HabitCustomize';
import Dashboard from './components/Dashboard';
import BattleMap from './components/BattleMap';
import Arsenal from './components/Arsenal';
import Records from './components/Records';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const { user, loading, isAuthenticated, initialized } = useAuth();

  // Check if this is a password reset callback
  // Supabase uses hash fragments for recovery tokens: #access_token=...&type=recovery
  const isPasswordResetCallback = window.location.hash.includes('type=recovery') ||
    window.location.pathname === '/reset-password';

  // DEBUG: Log auth state to console (only in development)
  if (import.meta.env.DEV) {
    console.log('[Auth Debug]', {
      user: user?.id || null,
      loading,
      isAuthenticated,
      initialized,
      isPasswordResetCallback
    });
  }

  // Handle password reset callback
  if (isPasswordResetCallback) {
    return (
      <ResetPassword
        onComplete={() => {
          // Clear the hash and redirect to home
          window.location.href = '/';
        }}
      />
    );
  }

  // CRITICAL: Always show loading screen until auth is fully initialized
  // This prevents any flash of content before auth check completes
  if (loading || !initialized) {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={styles.loadingText}>HABITQUEST</h1>
        <p style={styles.syncingText}>Checking authentication...</p>
      </div>
    );
  }

  // CRITICAL: Require authentication to access the app
  // If not authenticated, show ONLY the Auth component
  if (!isAuthenticated || !user) {
    if (import.meta.env.DEV) {
      console.log('[Auth] Not authenticated, showing login screen');
    }
    return <Auth />;
  }

  if (import.meta.env.DEV) {
    console.log('[Auth] User authenticated:', user.id);
  }
  // User is verified as logged in, show main app with user ID
  return (
    <ErrorBoundary>
      <MainApp userId={user.id} />
    </ErrorBoundary>
  );
}

// Main app component (shown after login)
function MainApp({ userId }) {
  const [activeTab, setActiveTab] = useState('command');
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [loadError, setLoadError] = useState(null);

  const {
    username,
    commitmentAnswers,
    archetype,
    difficulty,
    habits,
    setUsername,
    setCommitmentAnswers,
    setArchetype,
    setDifficulty,
    initializeHabits,
    resetGame,
    loadFromSupabase
  } = useGameStore();

  // Initialize showWelcome to false, only set to true AFTER data has loaded
  // and we've confirmed user has no existing profile
  const [showWelcome, setShowWelcome] = useState(false);

  // Shared load function used by both initial load and retry
  const performLoad = async () => {
    if (!userId) return;

    setLoadState('loading');
    setLoadError(null);

    try {
      const result = await loadFromSupabase(userId);

      if (result && result.success) {
        setLoadState('loaded');
        // Only show welcome screen if user has no existing profile (new user)
        if (!result.hasData) {
          setShowWelcome(true);
        }
      } else {
        setLoadState('error');
        setLoadError(result?.error?.message || 'Failed to load data');
      }
    } catch (err) {
      setLoadState('error');
      setLoadError(err.message || 'An unexpected error occurred');
    }
  };

  // Load data from Supabase on mount
  useEffect(() => {
    performLoad();
  }, [userId]);

  // Handle retry - reuse the same load function
  const handleRetry = () => {
    performLoad();
  };

  // Show loading screen while syncing from Supabase
  if (loadState === 'loading') {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={styles.loadingText}>HABITQUEST</h1>
        <p style={styles.syncingText}>Syncing data...</p>
      </div>
    );
  }

  // Show error screen with retry option
  if (loadState === 'error') {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={{ ...styles.loadingText, color: '#ef4444' }}>Sync Failed</h1>
        <p style={styles.syncingText}>{loadError || 'Failed to load data'}</p>
        <button
          onClick={handleRetry}
          style={styles.retryButton}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  // ========== ONBOARDING HANDLERS ==========

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleProfileComplete = (name) => {
    setUsername(name);
  };

  const handleProfileBack = () => {
    // Go back to welcome screen
    setShowWelcome(true);
  };

  const handleCommitmentComplete = (answers) => {
    setCommitmentAnswers(answers);
  };

  const handleCommitmentBack = () => {
    // Clear username and go back to profile
    setUsername(null);
  };

  const handleCommitmentCancel = () => {
    // User clicked "Maybe not..." - reset everything and go back to welcome
    resetGame();
    setShowWelcome(true);
  };

  const handleArchetypeSelect = (selectedArchetype) => {
    setArchetype(selectedArchetype);
  };

  const handleArchetypeBack = () => {
    // Clear commitment answers and go back
    setCommitmentAnswers(null);
  };

  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
  };

  const handleDifficultyBack = () => {
    // Clear archetype and go back
    setArchetype(null);
  };

  const handleHabitsConfirm = (confirmedHabits) => {
    initializeHabits(confirmedHabits);
  };

  const handleCustomizeBack = () => {
    // Clear difficulty and go back
    setDifficulty(null);
  };

  // ========== RENDER ONBOARDING SCREENS ==========

  // FIXED: Check if user has completed onboarding by checking if habits exist
  // This is the most reliable indicator that onboarding was completed
  const hasCompletedOnboarding = habits && habits.length > 0;

  // If user has NOT completed onboarding, show onboarding screens
  if (!hasCompletedOnboarding) {
    // Step 0: Welcome screen (only for new users)
    if (showWelcome && !username) {
      return <Welcome onBegin={handleWelcomeComplete} />;
    }

    // Step 1: Profile setup
    if (!username) {
      return (
        <ProfileSetup
          onComplete={handleProfileComplete}
          onBack={handleProfileBack}
        />
      );
    }

    // Step 2: Commitment questions
    if (!commitmentAnswers) {
      return (
        <CommitmentQuestions
          onComplete={handleCommitmentComplete}
          onCancel={handleCommitmentCancel}
          onBack={handleCommitmentBack}
        />
      );
    }

    // Step 3: Archetype selection
    if (!archetype) {
      return (
        <ArchetypeSelect
          onSelect={handleArchetypeSelect}
          onBack={handleArchetypeBack}
        />
      );
    }

    // Step 4: Difficulty selection
    if (!difficulty) {
      return (
        <DifficultySelect
          archetype={archetype}
          onSelect={handleDifficultySelect}
          onBack={handleDifficultyBack}
        />
      );
    }

    // Step 5: Habit customization
    return (
      <HabitCustomize
        archetype={archetype}
        difficulty={difficulty}
        onConfirm={handleHabitsConfirm}
        onBack={handleCustomizeBack}
      />
    );
  }

  // ========== MAIN APP (ONBOARDING COMPLETE) ==========

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'command':
        return <Dashboard />;
      case 'battlemap':
        return <BattleMap />;
      case 'arsenal':
        return <Arsenal />;
      case 'records':
        return <Records />;
      default:
        return <Dashboard />;
    }
  };

  // Main app with navigation
  return (
    <div style={styles.appContainer}>
      {renderContent()}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        archetype={archetype}
      />
    </div>
  );
}

const styles = {
  appContainer: {
    paddingBottom: '80px'
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2rem',
    color: '#ffffff',
    letterSpacing: '0.2em',
    opacity: 0.5
  },
  syncingText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
    marginTop: '8px'
  },
  retryButton: {
    marginTop: '20px',
    padding: '12px 32px',
    backgroundColor: '#22c55e',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default App;
