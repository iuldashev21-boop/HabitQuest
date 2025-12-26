import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Star, Zap, Trophy } from 'lucide-react';
import { CLASSES, MISSION_CARDS } from '../data/gameData';

const DifficultySelect = ({ archetype, onSelect, onBack }) => {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([]);

  const archetypeData = CLASSES[archetype];
  const missionCards = MISSION_CARDS[archetype];

  const difficulties = [
    { id: 'easy', label: 'Easy', icon: Star, description: 'Perfect for beginners' },
    { id: 'medium', label: 'Medium', icon: Zap, description: 'Balanced challenge', recommended: true },
    { id: 'extreme', label: 'Extreme', icon: Trophy, description: 'For the committed' }
  ];

  // Entrance animations
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);

    difficulties.forEach((_, index) => {
      setTimeout(() => {
        setCardsVisible(prev => [...prev, index]);
      }, 200 + index * 100);
    });

    return () => clearTimeout(timer);
  }, []);

  const calculateTotalXP = (difficulty) => {
    const card = missionCards[difficulty];
    const demonsXP = card.demons.reduce((sum, h) => sum + h.xp, 0);
    const powersXP = card.powers.reduce((sum, h) => sum + h.xp, 0);
    return demonsXP + powersXP;
  };

  const handleConfirm = () => {
    if (selected) {
      setIsExiting(true);
      setTimeout(() => onSelect(selected), 400);
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => onBack(), 400);
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div style={{
      ...styles.container,
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(0.98)' : 'scale(1)',
      transition: 'all 0.4s ease-out'
    }}>
      {/* Back Button */}
      {onBack && (
        <button
          style={{
            ...styles.backButton,
            opacity: showContent ? 1 : 0,
            transition: 'all 0.3s ease'
          }}
          onClick={handleBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#555555';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333333';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div style={styles.content}>
        <div style={{
          ...styles.header,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.5s ease-out'
        }}>
          <div style={{
            ...styles.archetypeTag,
            backgroundColor: `${archetypeData.colors.accent}20`,
            borderColor: archetypeData.colors.accent
          }}>
            <span>{archetypeData.emoji}</span>
            <span style={{ color: archetypeData.colors.accent }}>{archetypeData.name}</span>
          </div>
          <h1 style={styles.heading}>Choose Your Challenge</h1>
          <p style={styles.subtitle}>Select the intensity that matches your commitment</p>
        </div>

        <div style={styles.cardList}>
          {difficulties.map((diff, index) => {
            const card = missionCards[diff.id];
            const isSelected = selected === diff.id;
            const isExpanded = expanded === diff.id;
            const totalXP = calculateTotalXP(diff.id);
            const isVisible = cardsVisible.includes(index);
            const Icon = diff.icon;

            return (
              <div
                key={diff.id}
                style={{
                  ...styles.card,
                  borderColor: isSelected ? archetypeData.colors.accent : '#333333',
                  boxShadow: isSelected
                    ? `0 0 30px ${archetypeData.colors.accent}30, inset 0 0 20px ${archetypeData.colors.accent}10`
                    : 'none',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelected(diff.id)}
              >
                {/* Left accent bar */}
                <div style={{
                  ...styles.accentBar,
                  backgroundColor: isSelected ? archetypeData.colors.accent : 'transparent'
                }} />

                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitleRow}>
                      <Icon
                        size={20}
                        color={isSelected ? archetypeData.colors.accent : '#666666'}
                        style={{ transition: 'color 0.3s ease' }}
                      />
                      <h2 style={{
                        ...styles.cardTitle,
                        color: isSelected ? archetypeData.colors.accent : '#ffffff'
                      }}>
                        {diff.label}
                      </h2>
                      {diff.recommended && (
                        <span style={{
                          ...styles.recommendedBadge,
                          backgroundColor: archetypeData.colors.accent,
                          color: archetype === 'SPECTER' ? '#ffffff' : '#000000',
                          animation: 'pulse-badge 2s infinite'
                        }}>
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div style={styles.cardMeta}>
                      <span style={styles.cardName}>{card.name}</span>
                      <span style={styles.cardDescription}>{diff.description}</span>
                    </div>
                  </div>

                  {/* XP Info Row */}
                  <div style={styles.xpRow}>
                    <div style={styles.xpItem}>
                      <span style={styles.xpLabel}>Daily XP</span>
                      <span style={{
                        ...styles.xpValue,
                        color: archetypeData.colors.accent
                      }}>
                        {totalXP}
                      </span>
                    </div>
                    <div style={styles.xpDivider} />
                    <div style={styles.xpItem}>
                      <span style={styles.xpLabel}>66-Day Total</span>
                      <span style={{
                        ...styles.xpValue,
                        color: '#4ade80'
                      }}>
                        {(totalXP * 66).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      ...styles.expandButton,
                      backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                    onClick={(e) => toggleExpand(diff.id, e)}
                  >
                    Preview Habits
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ marginLeft: '8px' }} />
                    ) : (
                      <ChevronDown size={16} style={{ marginLeft: '8px' }} />
                    )}
                  </button>

                  {/* Expandable habits preview */}
                  <div style={{
                    ...styles.habitsPreview,
                    maxHeight: isExpanded ? '400px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    marginTop: isExpanded ? '16px' : '0px',
                    paddingTop: isExpanded ? '16px' : '0px'
                  }}>
                    <div style={styles.habitSection}>
                      <h4 style={styles.habitSectionTitle}>
                        <span style={styles.demonDot}></span>
                        Demons to Slay
                      </h4>
                      {card.demons.map((demon) => (
                        <div key={demon.id} style={styles.habitItem}>
                          <div style={styles.habitInfo}>
                            <span style={styles.habitName}>{demon.name}</span>
                            <span style={styles.habitDesc}>{demon.description}</span>
                          </div>
                          <span style={{...styles.habitXP, color: '#dc2626'}}>{demon.xp} XP</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.habitSection}>
                      <h4 style={styles.habitSectionTitle}>
                        <span style={styles.powerDot}></span>
                        Powers to Build
                      </h4>
                      {card.powers.map((power) => (
                        <div key={power.id} style={styles.habitItem}>
                          <div style={styles.habitInfo}>
                            <span style={styles.habitName}>{power.name}</span>
                            <span style={styles.habitDesc}>{power.description}</span>
                          </div>
                          <span style={{...styles.habitXP, color: '#22c55e'}}>{power.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div style={{
          ...styles.buttonContainer,
          opacity: selected ? 1 : 0,
          transform: selected ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: selected ? 'auto' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <button
            style={{
              ...styles.button,
              backgroundColor: archetypeData.colors.accent,
              color: archetype === 'SPECTER' ? '#ffffff' : '#000000',
              boxShadow: `0 4px 20px ${archetypeData.colors.accent}40`
            }}
            onClick={handleConfirm}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Lock In
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
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
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    color: 'rgba(255, 255, 255, 0.6)',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  header: {
    marginBottom: '32px'
  },
  archetypeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid',
    marginBottom: '16px',
    letterSpacing: '0.05em'
  },
  heading: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    color: '#ffffff',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    cursor: 'pointer',
    border: '2px solid #333333',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left'
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    transition: 'background-color 0.3s ease'
  },
  cardContent: {
    padding: '20px 20px 20px 24px'
  },
  cardHeader: {
    marginBottom: '16px'
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  cardTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    margin: 0,
    transition: 'color 0.3s ease'
  },
  recommendedBadge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 'bold',
    letterSpacing: '0.05em'
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  cardName: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic'
  },
  cardDescription: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  xpRow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  xpItem: {
    flex: 1,
    textAlign: 'center'
  },
  xpLabel: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '4px'
  },
  xpValue: {
    fontSize: '1.25rem',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '0.05em'
  },
  xpDivider: {
    width: '1px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 16px'
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  habitsPreview: {
    borderTop: '1px solid #333333',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  habitSection: {
    marginBottom: '16px'
  },
  habitSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '10px'
  },
  demonDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#dc2626'
  },
  powerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4ade80'
  },
  habitItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  habitInfo: {
    flex: 1
  },
  habitName: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#ffffff',
    marginBottom: '2px'
  },
  habitDesc: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  habitXP: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginLeft: '12px'
  },
  buttonContainer: {
    marginTop: '16px'
  },
  button: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    letterSpacing: '0.1em',
    padding: '16px 48px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default DifficultySelect;
