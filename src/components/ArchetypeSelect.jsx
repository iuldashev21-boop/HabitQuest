import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CLASSES } from '../data/gameData';

const ArchetypeSelect = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([]);

  const archetypes = Object.values(CLASSES);

  // Staggered entrance animation for cards
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);

    // Stagger card appearances
    archetypes.forEach((_, index) => {
      setTimeout(() => {
        setCardsVisible(prev => [...prev, index]);
      }, 200 + index * 100);
    });

    return () => clearTimeout(timer);
  }, []);

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
        <h1 style={{
          ...styles.heading,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.5s ease-out'
        }}>
          Choose Your Path
        </h1>
        <p style={{
          ...styles.subtitle,
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.5s ease-out 0.2s'
        }}>
          Each archetype has a unique approach to transformation
        </p>

        <div style={styles.grid}>
          {archetypes.map((archetype, index) => {
            const isSelected = selected === archetype.id;
            const isHovered = hoveredCard === archetype.id;
            const isVisible = cardsVisible.includes(index);

            return (
              <div
                key={archetype.id}
                style={{
                  ...styles.card,
                  borderColor: isSelected ? archetype.colors.accent : isHovered ? '#555555' : '#333333',
                  boxShadow: isSelected
                    ? `0 0 40px ${archetype.colors.accent}50, inset 0 0 30px ${archetype.colors.accent}15`
                    : isHovered
                      ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                      : 'none',
                  transform: isSelected
                    ? 'scale(1.03)'
                    : isHovered
                      ? 'scale(1.01)'
                      : 'scale(1)',
                  opacity: isVisible ? 1 : 0,
                  background: isSelected
                    ? `linear-gradient(135deg, #1A1A1A 0%, ${archetype.colors.accent}10 100%)`
                    : '#1A1A1A'
                }}
                onClick={() => setSelected(archetype.id)}
                onMouseEnter={() => setHoveredCard(archetype.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow effect behind image/emoji when selected */}
                {isSelected && (
                  <div style={{
                    ...styles.emojiGlow,
                    backgroundColor: archetype.colors.accent,
                    opacity: 0.3
                  }} />
                )}

                {/* Character image with emoji fallback */}
                <div style={{
                  ...styles.imageContainer,
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}>
                  <img
                    src={archetype.image}
                    alt={archetype.name}
                    style={{
                      ...styles.characterImage,
                      borderColor: isSelected ? archetype.colors.accent : 'transparent'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span style={{ ...styles.emoji, display: 'none' }}>
                    {archetype.emoji}
                  </span>
                </div>

                <h2 style={{
                  ...styles.name,
                  color: isSelected ? archetype.colors.accent : '#ffffff'
                }}>
                  {archetype.name}
                </h2>

                <p style={{
                  ...styles.motto,
                  color: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)'
                }}>
                  "{archetype.motto}"
                </p>

                {/* Description visible on hover/select */}
                <div style={{
                  ...styles.description,
                  opacity: isSelected || isHovered ? 1 : 0,
                  maxHeight: isSelected || isHovered ? '60px' : '0px',
                  marginTop: isSelected || isHovered ? '12px' : '0px',
                  transition: 'all 0.3s ease'
                }}>
                  {archetype.description}
                </div>

                {isSelected && (
                  <div style={{
                    ...styles.selectedBadge,
                    backgroundColor: archetype.colors.accent,
                    color: archetype.id === 'SPECTER' ? '#ffffff' : '#000000'
                  }}>
                    SELECTED
                  </div>
                )}
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
              backgroundColor: selected ? CLASSES[selected].colors.accent : '#ffffff',
              color: selected === 'SPECTER' ? '#ffffff' : '#000000',
              boxShadow: selected ? `0 4px 20px ${CLASSES[selected].colors.accent}40` : 'none'
            }}
            onClick={handleConfirm}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Select {selected ? CLASSES[selected].name : ''}
          </button>
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
    maxWidth: '700px',
    width: '100%'
  },
  heading: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    color: '#ffffff',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '40px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    padding: '28px 20px',
    cursor: 'pointer',
    border: '2px solid #333333',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  emojiGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -70%)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    filter: 'blur(20px)'
  },
  emoji: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '12px',
    position: 'relative',
    zIndex: 1
  },
  imageContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: '12px'
  },
  characterImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '2px solid transparent',
    transition: 'all 0.3s ease'
  },
  name: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    transition: 'color 0.3s ease'
  },
  motto: {
    fontSize: '0.875rem',
    fontStyle: 'italic',
    lineHeight: 1.4,
    transition: 'color 0.3s ease'
  },
  description: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 1.4,
    overflow: 'hidden'
  },
  selectedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 'bold',
    letterSpacing: '0.05em'
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

export default ArchetypeSelect;
