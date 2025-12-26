import { Calendar, User, BookOpen } from 'lucide-react';
import { CLASSES } from '../data/gameData';

const ComingSoon = ({ page, archetype }) => {
  const archetypeData = CLASSES[archetype];

  const pageInfo = {
    battlemap: {
      icon: Calendar,
      title: 'Battle Map',
      description: 'Track your 66-day journey with a visual calendar of victories and battles.'
    },
    arsenal: {
      icon: User,
      title: 'Arsenal',
      description: 'View your character stats, achievements, and customize your loadout.'
    },
    records: {
      icon: BookOpen,
      title: 'Records',
      description: 'Review your history, analyze patterns, and learn from your journey.'
    }
  };

  const info = pageInfo[page] || pageInfo.battlemap;
  const Icon = info.icon;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={{
          ...styles.iconContainer,
          borderColor: archetypeData.colors.accent
        }}>
          <Icon size={48} color={archetypeData.colors.accent} />
        </div>
        <h1 style={styles.title}>{info.title}</h1>
        <p style={styles.description}>{info.description}</p>
        <div style={styles.badge}>
          <span style={styles.badgeText}>COMING SOON</span>
        </div>
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
    padding: '20px',
    paddingBottom: '100px'
  },
  content: {
    textAlign: 'center',
    maxWidth: '300px'
  },
  iconContainer: {
    width: '100px',
    height: '100px',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    backgroundColor: '#1A1A1A'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '2rem',
    color: '#ffffff',
    letterSpacing: '0.1em',
    marginBottom: '12px'
  },
  description: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.6,
    marginBottom: '32px'
  },
  badge: {
    display: 'inline-block',
    padding: '8px 20px',
    backgroundColor: '#1A1A1A',
    border: '1px solid #333333'
  },
  badgeText: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#666666',
    letterSpacing: '0.15em'
  }
};

export default ComingSoon;
