import { useState, useEffect } from 'react';
import { X, Plus, Skull, Zap, Check, Smartphone, Pizza, Dumbbell, Brain, Droplets, ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import { CLASSES, MISSION_CARDS, FREQUENCY_TYPES } from '../data/gameData';

const XP_BY_DIFFICULTY = {
  easy: 15,
  medium: 25,
  hard: 35,
  extreme: 50
};

// Organized preset habits by category (with frequency defaults)
const PRESET_CATEGORIES = {
  // DEMONS (Red categories) - Most are daily by default
  addiction: {
    name: 'Addiction',
    icon: 'skull',
    color: '#dc2626',
    type: 'demon',
    habits: [
      { id: 'add-1', name: 'No Porn', xp: 35, description: '24 hours clean', frequency: 'daily' },
      { id: 'add-2', name: 'No Vaping/Nicotine', xp: 40, description: 'Clean lungs', frequency: 'daily' },
      { id: 'add-3', name: 'No Alcohol', xp: 35, description: 'Clear mind', frequency: 'daily' },
      { id: 'add-4', name: 'No Weed/THC', xp: 35, description: 'Full clarity', frequency: 'daily' },
      { id: 'add-5', name: 'No Gambling/Betting', xp: 30, description: 'Keep your money', frequency: 'daily' }
    ]
  },
  digital: {
    name: 'Digital',
    icon: 'smartphone',
    color: '#dc2626',
    type: 'demon',
    habits: [
      { id: 'dig-1', name: 'No TikTok/Reels Until 6pm', xp: 25, description: 'Earn your scroll', frequency: 'daily' },
      { id: 'dig-2', name: 'No Social Media 9-5', xp: 30, description: 'Protect focus', frequency: 'weekdays' },
      { id: 'dig-3', name: 'Max 1hr Video Games', xp: 25, description: 'Controlled play', frequency: 'daily' },
      { id: 'dig-4', name: 'No OnlyFans/IG Models', xp: 30, description: 'Real only', frequency: 'daily' },
      { id: 'dig-5', name: 'No Impulse Buys Over $20', xp: 20, description: 'Sleep on it', frequency: 'daily' }
    ]
  },
  body: {
    name: 'Body',
    icon: 'pizza',
    color: '#dc2626',
    type: 'demon',
    habits: [
      { id: 'bod-1', name: 'No Fast Food', xp: 25, description: 'Real food', frequency: 'daily' },
      { id: 'bod-2', name: 'No Soda/Energy Drinks', xp: 20, description: 'Natural energy', frequency: 'daily' },
      { id: 'bod-3', name: 'No Sugar/Candy', xp: 25, description: 'Cut poison', frequency: 'daily' },
      { id: 'bod-4', name: 'No Eating After 9pm', xp: 20, description: 'Kitchen closed', frequency: 'daily' },
      { id: 'bod-5', name: 'No Sleeping Past 8am', xp: 20, description: 'Win morning', frequency: 'weekdays' }
    ]
  },
  // POWERS (Green categories) - Some gym/running habits are 3x/4x week
  physical: {
    name: 'Physical',
    icon: 'dumbbell',
    color: '#22c55e',
    type: 'power',
    habits: [
      { id: 'phy-1', name: 'Walk 30 Minutes', xp: 20, description: 'Move daily', frequency: 'daily' },
      { id: 'phy-2', name: 'Gym/Weight Training', xp: 30, description: 'Build strength', frequency: '3x_week' },
      { id: 'phy-3', name: 'Run/Cardio 30min', xp: 25, description: 'Build endurance', frequency: '3x_week' },
      { id: 'phy-4', name: '10K Steps', xp: 25, description: 'Stay active', frequency: 'daily' },
      { id: 'phy-5', name: '50 Pushups', xp: 20, description: 'Daily strength', frequency: 'daily' },
      { id: 'phy-6', name: 'Cold Shower 2min', xp: 30, description: 'Embrace cold', frequency: 'daily' },
      { id: 'phy-7', name: 'MMA/Martial Arts', xp: 35, description: 'Learn to fight', frequency: '3x_week' },
      { id: 'phy-8', name: 'Boxing Training', xp: 35, description: 'Strike power', frequency: '3x_week' },
      { id: 'phy-9', name: 'Swimming 30min', xp: 25, description: 'Full body', frequency: '3x_week' },
      { id: 'phy-10', name: 'Yoga/Stretching 20min', xp: 15, description: 'Stay flexible', frequency: 'daily' }
    ]
  },
  mind: {
    name: 'Mind',
    icon: 'brain',
    color: '#22c55e',
    type: 'power',
    habits: [
      { id: 'mnd-1', name: 'Read 30 Minutes', xp: 25, description: 'Feed brain', frequency: 'daily' },
      { id: 'mnd-2', name: 'Meditate 10 Minutes', xp: 20, description: 'Train focus', frequency: 'daily' },
      { id: 'mnd-3', name: 'Journal 10 Minutes', xp: 15, description: 'Know yourself', frequency: 'daily' },
      { id: 'mnd-4', name: 'Learn Skill 30min', xp: 25, description: 'Level up', frequency: 'weekdays' },
      { id: 'mnd-5', name: 'Deep Work 2 Hours', xp: 35, description: 'Real output', frequency: 'weekdays' }
    ]
  },
  fuel: {
    name: 'Fuel',
    icon: 'droplets',
    color: '#22c55e',
    type: 'power',
    habits: [
      { id: 'fue-1', name: 'Drink 3L Water', xp: 15, description: 'Stay hydrated', frequency: 'daily' },
      { id: 'fue-2', name: 'Eat Clean - No Processed', xp: 25, description: 'Whole foods', frequency: 'daily' },
      { id: 'fue-3', name: 'Protein 100g+', xp: 20, description: 'Feed muscle', frequency: 'daily' },
      { id: 'fue-4', name: 'Sleep 7+ Hours', xp: 20, description: 'Recovery', frequency: 'daily' },
      { id: 'fue-5', name: 'Bed by 11pm', xp: 20, description: 'Protect sleep', frequency: 'daily' }
    ]
  }
};

const CategoryIcon = ({ icon, size = 16, color }) => {
  switch (icon) {
    case 'skull': return <Skull size={size} color={color} />;
    case 'smartphone': return <Smartphone size={size} color={color} />;
    case 'pizza': return <Pizza size={size} color={color} />;
    case 'dumbbell': return <Dumbbell size={size} color={color} />;
    case 'brain': return <Brain size={size} color={color} />;
    case 'droplets': return <Droplets size={size} color={color} />;
    default: return null;
  }
};

const HabitCustomize = ({ archetype, difficulty, onConfirm, onBack }) => {
  const archetypeData = CLASSES[archetype];
  const missionCard = MISSION_CARDS[archetype][difficulty];

  // Initialize habits from mission card (use frequency from card or default to daily)
  const initialHabits = [
    ...missionCard.demons.map((d) => ({ ...d, type: 'demon', frequency: d.frequency || 'daily' })),
    ...missionCard.powers.map((p) => ({ ...p, type: 'power', frequency: p.frequency || 'daily' }))
  ];

  const [habits, setHabits] = useState(initialHabits);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' or 'custom'
  const [activeCategory, setActiveCategory] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    type: 'demon',
    difficulty: 'medium',
    frequency: 'daily'
  });

  // State for preset frequency picker
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [presetFrequency, setPresetFrequency] = useState('daily');

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const demons = habits.filter((h) => h.type === 'demon');
  const powers = habits.filter((h) => h.type === 'power');
  const canStart = habits.length >= 3;

  // Check if a preset is already added
  const isPresetAdded = (presetName) => {
    return habits.some((h) => h.name === presetName);
  };

  const removeHabit = (habitId) => {
    setHabits(habits.filter((h) => h.id !== habitId));
  };

  // Show frequency picker for preset (for physical/workout habits)
  const handlePresetClick = (preset, type) => {
    if (isPresetAdded(preset.name)) return;

    // For physical habits, show frequency picker
    if (type === 'power' && activeCategory === 'physical') {
      setSelectedPreset({ ...preset, type });
      setPresetFrequency(preset.frequency || 'daily');
    } else {
      // For other habits, add directly
      addPresetHabit(preset, type, preset.frequency || 'daily');
    }
  };

  const addPresetHabit = (preset, type, frequency) => {
    if (isPresetAdded(preset.name)) return;

    const habit = {
      id: `${preset.id}-${Date.now()}`,
      name: preset.name,
      type: type,
      xp: preset.xp,
      frequency: frequency
    };

    setHabits([...habits, habit]);
    setSelectedPreset(null);
  };

  const confirmPresetWithFrequency = () => {
    if (selectedPreset) {
      addPresetHabit(selectedPreset, selectedPreset.type, presetFrequency);
    }
  };

  const cancelPresetSelection = () => {
    setSelectedPreset(null);
  };

  const addCustomHabit = () => {
    if (!newHabit.name.trim()) return;

    const habit = {
      id: `custom-${Date.now()}`,
      name: newHabit.name.trim(),
      type: newHabit.type,
      xp: XP_BY_DIFFICULTY[newHabit.difficulty],
      frequency: newHabit.frequency
    };

    setHabits([...habits, habit]);
    setNewHabit({ name: '', type: 'demon', difficulty: 'medium', frequency: 'daily' });
    setShowModal(false);
  };

  const handleConfirm = () => {
    if (canStart) {
      setIsExiting(true);
      setTimeout(() => onConfirm(habits), 400);
    }
  };

  const handleBack = () => {
    if (onBack) {
      setIsExiting(true);
      setTimeout(() => onBack(), 400);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setActiveTab('presets');
    setActiveCategory(null);
  };

  const demonCategories = ['addiction', 'digital', 'body'];
  const powerCategories = ['physical', 'mind', 'fuel'];

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
            ...styles.navBackButton,
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

      <div style={{
        ...styles.content,
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease-out'
      }}>
        <div style={styles.header}>
          <div style={{
            ...styles.archetypeTag,
            backgroundColor: `${archetypeData.colors.accent}20`,
            borderColor: archetypeData.colors.accent
          }}>
            <span>{archetypeData.emoji}</span>
            <span style={{ color: archetypeData.colors.accent }}>{archetypeData.name}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{missionCard.name}</span>
          </div>
          <h1 style={styles.heading}>Customize Your {archetypeData.habitTerm}</h1>
          <p style={styles.subtext}>
            Remove what doesn't fit. Add what you need. Minimum 3 habits required.
          </p>
        </div>

        <div style={styles.sections}>
          {/* Demons Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Skull size={18} color="#dc2626" />
              <h3 style={styles.sectionTitle}>Demons to Slay</h3>
              <span style={styles.count}>{demons.length}</span>
            </div>
            <div style={styles.habitList}>
              {demons.map((habit) => (
                <div key={habit.id} style={styles.habitCard}>
                  <div style={styles.habitInfo}>
                    <div style={styles.habitNameRow}>
                      <span style={styles.habitName}>{habit.name}</span>
                      {habit.frequency && habit.frequency !== 'daily' && (
                        <span style={styles.frequencyBadge}>
                          {FREQUENCY_TYPES[habit.frequency]?.shortName}
                        </span>
                      )}
                    </div>
                    <span style={styles.habitXP}>{habit.xp} XP</span>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeHabit(habit.id)}
                    aria-label="Remove habit"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {demons.length === 0 && (
                <p style={styles.emptyText}>No demons added</p>
              )}
            </div>
          </div>

          {/* Powers Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Zap size={18} color="#22c55e" />
              <h3 style={styles.sectionTitle}>Powers to Build</h3>
              <span style={styles.count}>{powers.length}</span>
            </div>
            <div style={styles.habitList}>
              {powers.map((habit) => (
                <div key={habit.id} style={{...styles.habitCard, ...styles.powerCard}}>
                  <div style={styles.habitInfo}>
                    <div style={styles.habitNameRow}>
                      <span style={styles.habitName}>{habit.name}</span>
                      {habit.frequency && habit.frequency !== 'daily' && (
                        <span style={{...styles.frequencyBadge, ...styles.frequencyBadgePower}}>
                          {FREQUENCY_TYPES[habit.frequency]?.shortName}
                        </span>
                      )}
                    </div>
                    <span style={styles.habitXP}>{habit.xp} XP</span>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeHabit(habit.id)}
                    aria-label="Remove habit"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {powers.length === 0 && (
                <p style={styles.emptyText}>No powers added</p>
              )}
            </div>
          </div>
        </div>

        <button
          style={styles.addButton}
          onClick={openModal}
        >
          <Plus size={18} />
          Add Custom Habit
        </button>

        <div style={styles.footer}>
          <span style={{
            ...styles.habitCount,
            color: canStart ? '#22c55e' : '#dc2626'
          }}>
            {habits.length} habits selected {!canStart && '(minimum 3)'}
          </span>
          <button
            style={{
              ...styles.confirmButton,
              backgroundColor: canStart ? archetypeData.colors.accent : '#333333',
              color: canStart
                ? (archetype === 'SPECTER' ? '#ffffff' : '#000000')
                : '#666666',
              cursor: canStart ? 'pointer' : 'not-allowed',
              boxShadow: canStart ? `0 4px 20px ${archetypeData.colors.accent}40` : 'none',
              transform: canStart ? 'scale(1)' : 'scale(0.98)'
            }}
            onClick={handleConfirm}
            disabled={!canStart}
            onMouseEnter={(e) => {
              if (canStart) {
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (canStart) {
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            Start Journey
          </button>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Habit</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Tabs */}
            <div style={styles.tabs}>
              <button
                style={{
                  ...styles.tab,
                  backgroundColor: activeTab === 'presets' ? archetypeData.colors.accent : 'transparent',
                  color: activeTab === 'presets'
                    ? (archetype === 'SPECTER' ? '#ffffff' : '#000000')
                    : 'rgba(255, 255, 255, 0.5)'
                }}
                onClick={() => { setActiveTab('presets'); setActiveCategory(null); }}
              >
                Presets
              </button>
              <button
                style={{
                  ...styles.tab,
                  backgroundColor: activeTab === 'custom' ? archetypeData.colors.accent : 'transparent',
                  color: activeTab === 'custom'
                    ? (archetype === 'SPECTER' ? '#ffffff' : '#000000')
                    : 'rgba(255, 255, 255, 0.5)'
                }}
                onClick={() => setActiveTab('custom')}
              >
                Custom
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div style={styles.presetBody}>
                {!activeCategory ? (
                  <>
                    {/* Category Selection */}
                    <p style={styles.categoryHint}>Select a category</p>

                    {/* Demon Categories */}
                    <div style={styles.categorySection}>
                      <div style={styles.categorySectionHeader}>
                        <Skull size={14} color="#dc2626" />
                        <span style={styles.categorySectionTitle}>DEMONS TO QUIT</span>
                      </div>
                      <div style={styles.categoryGrid}>
                        {demonCategories.map((catKey) => {
                          const cat = PRESET_CATEGORIES[catKey];
                          return (
                            <button
                              key={catKey}
                              style={{
                                ...styles.categoryButton,
                                borderColor: cat.color,
                                backgroundColor: 'rgba(220, 38, 38, 0.1)'
                              }}
                              onClick={() => setActiveCategory(catKey)}
                            >
                              <CategoryIcon icon={cat.icon} size={20} color={cat.color} />
                              <span style={{ ...styles.categoryName, color: cat.color }}>
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Power Categories */}
                    <div style={styles.categorySection}>
                      <div style={styles.categorySectionHeader}>
                        <Zap size={14} color="#22c55e" />
                        <span style={styles.categorySectionTitle}>POWERS TO BUILD</span>
                      </div>
                      <div style={styles.categoryGrid}>
                        {powerCategories.map((catKey) => {
                          const cat = PRESET_CATEGORIES[catKey];
                          return (
                            <button
                              key={catKey}
                              style={{
                                ...styles.categoryButton,
                                borderColor: cat.color,
                                backgroundColor: 'rgba(34, 197, 94, 0.1)'
                              }}
                              onClick={() => setActiveCategory(catKey)}
                            >
                              <CategoryIcon icon={cat.icon} size={20} color={cat.color} />
                              <span style={{ ...styles.categoryName, color: cat.color }}>
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Habit List for Selected Category */}
                    <button
                      style={styles.backButton}
                      onClick={() => setActiveCategory(null)}
                    >
                      <X size={14} />
                      Back to Categories
                    </button>

                    <div style={styles.categoryHeader}>
                      <CategoryIcon
                        icon={PRESET_CATEGORIES[activeCategory].icon}
                        size={24}
                        color={PRESET_CATEGORIES[activeCategory].color}
                      />
                      <h3 style={{
                        ...styles.categoryTitle,
                        color: PRESET_CATEGORIES[activeCategory].color
                      }}>
                        {PRESET_CATEGORIES[activeCategory].name}
                      </h3>
                    </div>

                    <div style={styles.habitPresetList}>
                      {PRESET_CATEGORIES[activeCategory].habits.map((preset) => {
                        const added = isPresetAdded(preset.name);
                        const category = PRESET_CATEGORIES[activeCategory];
                        const isPhysical = activeCategory === 'physical';
                        return (
                          <button
                            key={preset.id}
                            style={{
                              ...styles.habitPresetCard,
                              borderColor: category.color,
                              opacity: added ? 0.5 : 1,
                              cursor: added ? 'default' : 'pointer',
                              backgroundColor: added ? 'rgba(255,255,255,0.05)' : '#0a0a0a'
                            }}
                            onClick={() => !added && handlePresetClick(preset, category.type)}
                            disabled={added}
                          >
                            <div style={styles.habitPresetMain}>
                              <div style={styles.habitPresetInfo}>
                                <div style={styles.habitPresetNameRow}>
                                  <span style={styles.habitPresetName}>{preset.name}</span>
                                  {preset.frequency && preset.frequency !== 'daily' && (
                                    <span style={{
                                      ...styles.presetFreqBadge,
                                      color: category.color,
                                      borderColor: category.color
                                    }}>
                                      {FREQUENCY_TYPES[preset.frequency]?.shortName}
                                    </span>
                                  )}
                                </div>
                                <span style={styles.habitPresetDesc}>{preset.description}</span>
                              </div>
                              <div style={styles.habitPresetRight}>
                                <span style={{
                                  ...styles.habitPresetXP,
                                  color: category.color
                                }}>
                                  {preset.xp} XP
                                </span>
                                {added ? (
                                  <div style={{
                                    ...styles.addedIndicator,
                                    backgroundColor: category.color
                                  }}>
                                    <Check size={14} color="#fff" />
                                  </div>
                                ) : (
                                  <div style={{
                                    ...styles.addIndicator,
                                    borderColor: category.color
                                  }}>
                                    <Plus size={14} color={category.color} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Frequency Picker for Physical Habits */}
                    {selectedPreset && (
                      <div style={styles.frequencyPickerOverlay} onClick={cancelPresetSelection}>
                        <div style={styles.frequencyPicker} onClick={(e) => e.stopPropagation()}>
                          <h4 style={styles.frequencyPickerTitle}>
                            {selectedPreset.name}
                          </h4>
                          <p style={styles.frequencyPickerSubtitle}>How often?</p>

                          <div style={styles.frequencyOptions}>
                            {[
                              { key: 'daily', label: 'Every Day' },
                              { key: '3x_week', label: '3× Per Week' },
                              { key: '4x_week', label: '4× Per Week' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                style={{
                                  ...styles.frequencyOption,
                                  backgroundColor: presetFrequency === opt.key ? '#22c55e' : 'transparent',
                                  color: presetFrequency === opt.key ? '#000' : '#888',
                                  borderColor: presetFrequency === opt.key ? '#22c55e' : '#333'
                                }}
                                onClick={() => setPresetFrequency(opt.key)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          <div style={styles.frequencyPickerActions}>
                            <button style={styles.frequencyPickerCancel} onClick={cancelPresetSelection}>
                              Cancel
                            </button>
                            <button style={styles.frequencyPickerConfirm} onClick={confirmPresetWithFrequency}>
                              <Plus size={16} />
                              Add Habit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Custom Tab Content */}
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Habit Name</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Enter habit name..."
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Type</label>
                    <div style={styles.toggleGroup}>
                      <button
                        style={{
                          ...styles.toggleButton,
                          backgroundColor: newHabit.type === 'demon' ? '#dc2626' : 'transparent',
                          borderColor: '#dc2626',
                          color: newHabit.type === 'demon' ? '#ffffff' : '#dc2626'
                        }}
                        onClick={() => setNewHabit({ ...newHabit, type: 'demon' })}
                      >
                        <Skull size={16} />
                        Demon (Quit)
                      </button>
                      <button
                        style={{
                          ...styles.toggleButton,
                          backgroundColor: newHabit.type === 'power' ? '#22c55e' : 'transparent',
                          borderColor: '#22c55e',
                          color: newHabit.type === 'power' ? '#000000' : '#22c55e'
                        }}
                        onClick={() => setNewHabit({ ...newHabit, type: 'power' })}
                      >
                        <Zap size={16} />
                        Power (Build)
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Difficulty (XP)</label>
                    <div style={styles.difficultyGroup}>
                      {Object.entries(XP_BY_DIFFICULTY).map(([key, xp]) => (
                        <button
                          key={key}
                          style={{
                            ...styles.difficultyButton,
                            backgroundColor: newHabit.difficulty === key
                              ? archetypeData.colors.accent
                              : 'transparent',
                            borderColor: archetypeData.colors.accent,
                            color: newHabit.difficulty === key
                              ? (archetype === 'SPECTER' ? '#ffffff' : '#000000')
                              : archetypeData.colors.accent
                          }}
                          onClick={() => setNewHabit({ ...newHabit, difficulty: key })}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                          <span style={styles.difficultyXP}>{xp} XP</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>How Often?</label>
                    <div style={styles.frequencyGroup}>
                      {Object.entries(FREQUENCY_TYPES).map(([key, freq]) => (
                        <button
                          key={key}
                          style={{
                            ...styles.frequencyButton,
                            backgroundColor: newHabit.frequency === key
                              ? archetypeData.colors.accent
                              : 'transparent',
                            borderColor: newHabit.frequency === key
                              ? archetypeData.colors.accent
                              : '#333333',
                            color: newHabit.frequency === key
                              ? (archetype === 'SPECTER' ? '#ffffff' : '#000000')
                              : 'rgba(255, 255, 255, 0.6)'
                          }}
                          onClick={() => setNewHabit({ ...newHabit, frequency: key })}
                        >
                          <Calendar size={14} />
                          <span>{freq.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <button
                    style={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={{
                      ...styles.saveButton,
                      backgroundColor: archetypeData.colors.accent,
                      color: archetype === 'SPECTER' ? '#ffffff' : '#000000',
                      opacity: newHabit.name.trim() ? 1 : 0.5
                    }}
                    onClick={addCustomHabit}
                    disabled={!newHabit.name.trim()}
                  >
                    Add Habit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative'
  },
  navBackButton: {
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
    maxWidth: '500px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  archetypeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid',
    marginBottom: '16px',
    letterSpacing: '0.05em'
  },
  heading: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: '#ffffff',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  subtext: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '24px'
  },
  section: {},
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.125rem',
    color: '#ffffff',
    letterSpacing: '0.05em',
    margin: 0,
    flex: 1
  },
  count: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  habitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  habitCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: '12px 16px',
    borderLeft: '3px solid #dc2626'
  },
  powerCard: {
    borderLeftColor: '#22c55e'
  },
  habitInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  habitNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  habitName: {
    fontSize: '0.9375rem',
    color: '#ffffff'
  },
  frequencyBadge: {
    fontSize: '0.625rem',
    color: '#dc2626',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  frequencyBadgePower: {
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.15)'
  },
  habitXP: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  removeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  },
  emptyText: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    padding: '16px'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    border: '2px dashed #333333',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '32px'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  habitCount: {
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  confirmButton: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    letterSpacing: '0.1em',
    padding: '16px 48px',
    border: 'none',
    transition: 'all 0.3s ease'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#1A1A1A',
    width: '100%',
    maxWidth: '440px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #333333'
  },
  modalTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    color: '#ffffff',
    letterSpacing: '0.05em',
    margin: 0
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #333333'
  },
  tab: {
    flex: 1,
    padding: '14px',
    border: 'none',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  presetBody: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1
  },
  categoryHint: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginBottom: '16px'
  },
  categorySection: {
    marginBottom: '20px'
  },
  categorySectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  categorySectionTitle: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.1em',
    fontWeight: 'bold'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  categoryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '16px 8px',
    border: '2px solid',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  categoryName: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '0.875rem',
    letterSpacing: '0.05em'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  categoryTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.05em',
    margin: 0
  },
  habitPresetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  habitPresetCard: {
    display: 'flex',
    width: '100%',
    padding: '14px 16px',
    border: '2px solid',
    backgroundColor: '#0a0a0a',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  habitPresetMain: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: '12px'
  },
  habitPresetInfo: {
    flex: 1
  },
  habitPresetNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px'
  },
  habitPresetName: {
    fontSize: '0.9375rem',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  presetFreqBadge: {
    fontSize: '0.625rem',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid',
    fontWeight: 'bold'
  },
  habitPresetDesc: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  habitPresetRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  habitPresetXP: {
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  addIndicator: {
    width: '28px',
    height: '28px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addedIndicator: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333333',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  toggleGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  difficultyGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  },
  difficultyButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 8px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  difficultyXP: {
    fontSize: '0.625rem',
    opacity: 0.7,
    marginTop: '2px'
  },
  frequencyGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  frequencyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 8px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #333333'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #333333',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9375rem',
    cursor: 'pointer'
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    fontSize: '0.9375rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Frequency Picker for Physical Habits
  frequencyPickerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '20px'
  },
  frequencyPicker: {
    backgroundColor: '#1A1A1A',
    padding: '24px',
    width: '100%',
    maxWidth: '320px',
    textAlign: 'center'
  },
  frequencyPickerTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.25rem',
    color: '#22c55e',
    letterSpacing: '0.05em',
    margin: '0 0 4px 0'
  },
  frequencyPickerSubtitle: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: '0 0 20px 0'
  },
  frequencyOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px'
  },
  frequencyOption: {
    padding: '14px',
    border: '2px solid',
    backgroundColor: 'transparent',
    fontSize: '0.9375rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  frequencyPickerActions: {
    display: 'flex',
    gap: '12px'
  },
  frequencyPickerCancel: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  frequencyPickerConfirm: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#22c55e',
    border: 'none',
    color: '#000',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  }
};

export default HabitCustomize;
