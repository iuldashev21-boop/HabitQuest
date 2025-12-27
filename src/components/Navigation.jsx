import { Home, Calendar, User, BookOpen } from 'lucide-react';
import { CLASSES } from '../data/gameData';

const Navigation = ({ activeTab, onTabChange, archetype }) => {
  const archetypeData = CLASSES[archetype];

  const tabs = [
    { id: 'command', label: 'Command', icon: Home },
    { id: 'battlemap', label: 'Battle Map', icon: Calendar },
    { id: 'arsenal', label: 'Arsenal', icon: User },
    { id: 'records', label: 'Records', icon: BookOpen }
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                color: isActive ? archetypeData.colors.accent : '#666666'
              }}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={22} />
              <span style={{
                ...styles.label,
                color: isActive ? archetypeData.colors.accent : '#666666'
              }}>
                {tab.label}
              </span>
              {isActive && (
                <div style={{
                  ...styles.activeIndicator,
                  backgroundColor: archetypeData.colors.accent
                }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderTop: '1px solid #1A1A1A',
    zIndex: 100
  },
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '8px 0 12px'
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'color 0.2s ease'
  },
  label: {
    fontSize: '0.625rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    transition: 'color 0.2s ease'
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%'
  }
};

export default Navigation;
