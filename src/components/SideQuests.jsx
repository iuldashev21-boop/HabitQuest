import { useState, useCallback } from 'react';
import { Sparkles, Check, ChevronDown, ChevronRight } from 'lucide-react';
import useGameStore from '../context/useGameStore';
import { CLASSES } from '../data/gameData';
import XPPopup from './XPPopup';
import { playSuccess } from '../utils/sounds';

const SideQuests = () => {
  const {
    archetype,
    getSideQuests,
    completeSideQuest
  } = useGameStore();

  const archetypeData = CLASSES[archetype];

  const [xpPopups, setXpPopups] = useState([]);
  const [completingQuest, setCompletingQuest] = useState(null);
  const [expanded, setExpanded] = useState(false); // Collapsed by default

  const sideQuests = getSideQuests();
  const completedCount = sideQuests.filter((q) => q.completed).length;

  const addXPPopup = useCallback((questId, xpValue) => {
    const id = `${questId}-${Date.now()}`;
    setXpPopups((prev) => [...prev, { id, questId, xp: xpValue }]);
  }, []);

  const removeXPPopup = useCallback((id) => {
    setXpPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleComplete = useCallback((questId) => {
    const quest = sideQuests.find((q) => q.id === questId);
    if (!quest || quest.completed) return;

    playSuccess();
    setCompletingQuest(questId);

    const result = completeSideQuest(questId);
    if (result) {
      addXPPopup(questId, result.xpEarned);
    }

    setTimeout(() => {
      setCompletingQuest(null);
    }, 500);
  }, [sideQuests, completeSideQuest, addXPPopup]);

  if (sideQuests.length === 0) return null;

  return (
    <section style={styles.container}>
      {/* Collapsible Header */}
      <button
        style={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={styles.headerLeft}>
          <Sparkles size={14} color={archetypeData?.colors?.accent || '#6b21a8'} />
          <span style={styles.title}>SIDE QUESTS</span>
          <span style={styles.count}>{completedCount}/{sideQuests.length}</span>
        </div>
        {expanded ? (
          <ChevronDown size={18} color="#666" />
        ) : (
          <ChevronRight size={18} color="#666" />
        )}
      </button>

      <div style={{
        ...styles.content,
        maxHeight: expanded ? `${sideQuests.length * 56}px` : '0px',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        {sideQuests.map((quest) => {
          const isCompleting = completingQuest === quest.id;

          return (
            <div
              key={quest.id}
              style={{
                ...styles.questCard,
                opacity: quest.completed ? 0.5 : 1,
                transform: isCompleting ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* XP Popup */}
              {xpPopups.filter((p) => p.questId === quest.id).map((popup) => (
                <XPPopup
                  key={popup.id}
                  xp={popup.xp}
                  color={archetypeData?.colors?.accent || '#a855f7'}
                  onComplete={() => removeXPPopup(popup.id)}
                />
              ))}

              <div style={styles.questContent}>
                <div style={styles.questLeft}>
                  <span style={styles.questEmoji}>{quest.emoji}</span>
                  <div style={styles.questInfo}>
                    <span style={{
                      ...styles.questName,
                      textDecoration: quest.completed ? 'line-through' : 'none',
                      color: quest.completed ? '#555' : '#888'
                    }}>
                      {quest.name}
                    </span>
                    <span style={{
                      ...styles.questXP,
                      color: archetypeData?.colors?.accent || '#6b21a8'
                    }}>{quest.xp} XP</span>
                  </div>
                </div>

                {quest.completed ? (
                  <div style={{
                    ...styles.doneBadge,
                    backgroundColor: `${archetypeData?.colors?.accent || '#6b21a8'}20`,
                    color: archetypeData?.colors?.accent || '#a855f7'
                  }}>
                    <Check size={12} />
                  </div>
                ) : (
                  <button
                    style={{
                      ...styles.completeBtn,
                      borderColor: `${archetypeData?.colors?.accent || '#6b21a8'}66`,
                      color: archetypeData?.colors?.accent || '#6b21a8'
                    }}
                    onClick={() => handleComplete(quest.id)}
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const styles = {
  container: {
    marginBottom: '12px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0d080d',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '6px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    color: '#666',
    letterSpacing: '0.1em'
  },
  count: {
    fontSize: '0.75rem',
    color: '#444',
    marginLeft: '4px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  questCard: {
    padding: '10px 12px',
    backgroundColor: '#0a080a',
    borderRadius: '6px',
    position: 'relative'
  },
  questContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  questLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  questEmoji: {
    fontSize: '1rem'
  },
  questInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  questName: {
    fontSize: '0.8rem'
  },
  questXP: {
    fontSize: '0.65rem',
    color: '#6b21a8'
  },
  doneBadge: {
    width: '28px',
    height: '28px',
    backgroundColor: 'rgba(107, 33, 168, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a855f7'
  },
  completeBtn: {
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(107, 33, 168, 0.4)',
    borderRadius: '50%',
    color: '#6b21a8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default SideQuests;
