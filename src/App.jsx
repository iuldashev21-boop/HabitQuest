import { useState, useEffect } from 'react';
import useGameStore from './context/useGameStore';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import ResetPassword from './components/ResetPassword';
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

/**
 * Root application component that enforces auth initialization and access control.
 *
 * Renders a fullscreen loading view while authentication is initializing. Once initialized,
 * renders the Auth component if the user is not authenticated, otherwise renders MainApp
 * for the authenticated user.
 *
 * @returns {JSX.Element} The top-level UI: a loading screen, the Auth component, or MainApp with the authenticated user's ID.
 */
function App() {
  const { user, loading, isAuthenticated, initialized } = useAuth();
  const [isResetPasswordRoute, setIsResetPasswordRoute] = useState(false);

  // Check if we're on the reset-password route
  useEffect(() => {
    const checkRoute = () => {
      const isReset = window.location.pathname === '/reset-password' ||
                      window.location.hash.includes('type=recovery');
      setIsResetPasswordRoute(isReset);
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  // DEBUG: Log auth state to console (only in development)
  if (import.meta.env.DEV) {
    console.log('[Auth Debug]', {
      user: user?.id || null,
      loading,
      isAuthenticated,
      initialized,
      isResetPasswordRoute
    });
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

  // Handle password reset route (user clicked email link)
  if (isResetPasswordRoute) {
    return (
      <ResetPassword
        onComplete={() => {
          setIsResetPasswordRoute(false);
          window.history.pushState({}, '', '/');
        }}
      />
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
  return <MainApp userId={user.id} />;
}

// Main app component (shown after login)
function MainApp({ userId }) {
  const [activeTab, setActiveTab] = useState('command');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    username,
    commitmentAnswers,
    onboardingComplete,
    archetype,
    difficulty,
    habits,
    setUsername,
    setCommitmentAnswers,
    setArchetype,
    setDifficulty,
    initializeHabits,
    resetGame,
    loadFromSupabase,
    isSyncing
  } = useGameStore();

  const [showWelcome, setShowWelcome] = useState(!username);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        setIsLoadingData(true);
        await loadFromSupabase(userId);
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [userId, loadFromSupabase]);

  // Update welcome state when username changes
  useEffect(() => {
    if (username) {
      setShowWelcome(false);
    }
  }, [username]);

  // Show loading screen while syncing from Supabase
  if (isLoadingData) {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={styles.loadingText}>HABITQUEST</h1>
        <p style={styles.syncingText}>Syncing data...</p>
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

  // Step 0: Welcome screen (only show if no existing data)
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
  if (habits.length === 0) {
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
  }
};

export default App;