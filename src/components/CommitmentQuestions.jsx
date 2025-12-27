import { useState, useEffect } from 'react';
import { ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'struggles',
    title: "What's been holding you back?",
    subtitle: 'Select all that apply',
    multiSelect: true,
    options: [
      { id: 'porn', label: 'Porn addiction' },
      { id: 'social-media', label: 'Social media addiction' },
      { id: 'no-discipline', label: 'No discipline/routine' },
      { id: 'gaming', label: 'Gaming addiction' },
      { id: 'substances', label: 'Substance use (vape/alcohol/weed)' },
      { id: 'laziness', label: 'Laziness/procrastination' },
      { id: 'all', label: 'All of the above' }
    ]
  },
  {
    id: 'seriousness',
    title: 'How serious are you about changing?',
    subtitle: 'Be honest with yourself',
    multiSelect: false,
    options: [
      { id: 'curious', label: 'Just curious, checking this out' },
      { id: 'struggled', label: 'Want to change but struggled before' },
      { id: 'ready', label: 'Ready to commit for real this time' },
      { id: 'desperate', label: 'Desperate - my life depends on this' }
    ]
  },
  {
    id: 'identity',
    title: 'Who do you want to become?',
    subtitle: 'Visualize your future self',
    multiSelect: false,
    options: [
      { id: 'disciplined', label: 'Disciplined & focused' },
      { id: 'strong', label: 'Physically strong & healthy' },
      { id: 'sharp', label: 'Mentally sharp & confident' },
      { id: 'wealthy', label: 'Wealthy & successful' },
      { id: 'complete', label: 'All of the above - the complete package' }
    ]
  },
  {
    id: 'commitment',
    title: 'The next 66 days will be hard.',
    subtitle: 'Are you ready to suffer for your future self?',
    multiSelect: false,
    isFinal: true,
    options: [
      { id: 'ready', label: "I'm ready. Let's go." },
      { id: 'not-ready', label: 'Maybe not...' }
    ]
  }
];

const CommitmentQuestions = ({ onComplete, onCancel, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    struggles: [],
    seriousness: '',
    identity: '',
    ready: null
  });
  const [showNotReady, setShowNotReady] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  // Initial entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setFadeIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if current question has a valid answer
  const hasAnswer = () => {
    if (question.multiSelect) {
      return answers[question.id]?.length > 0;
    }
    return answers[question.id] !== '' && answers[question.id] !== null;
  };

  const handleOptionSelect = (optionId) => {
    if (question.multiSelect) {
      // Handle "All of the above" special case
      if (optionId === 'all') {
        const allSelected = answers[question.id]?.includes('all');
        if (allSelected) {
          setAnswers({ ...answers, [question.id]: [] });
        } else {
          // Select all options
          const allIds = question.options.map(o => o.id);
          setAnswers({ ...answers, [question.id]: allIds });
        }
      } else {
        const current = answers[question.id] || [];
        const isSelected = current.includes(optionId);

        let newSelection;
        if (isSelected) {
          newSelection = current.filter(id => id !== optionId && id !== 'all');
        } else {
          newSelection = [...current.filter(id => id !== 'all'), optionId];
        }

        setAnswers({ ...answers, [question.id]: newSelection });
      }
    } else {
      // Single select
      if (question.isFinal) {
        if (optionId === 'not-ready') {
          setShowNotReady(true);
          setAnswers({ ...answers, ready: false });
          return;
        } else {
          setAnswers({ ...answers, ready: true });
        }
      } else {
        setAnswers({ ...answers, [question.id]: optionId });
      }
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Exit animation then complete
      setIsExiting(true);
      setTimeout(() => {
        onComplete({
          struggles: answers.struggles,
          seriousness: answers.seriousness,
          identity: answers.identity,
          ready: true
        });
      }, 400);
    } else {
      // Transition to next question
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setFadeIn(true);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setFadeIn(true);
      }, 300);
    } else if (onBack) {
      setIsExiting(true);
      setTimeout(() => onBack(), 400);
    }
  };

  const isOptionSelected = (optionId) => {
    if (question.multiSelect) {
      return answers[question.id]?.includes(optionId);
    }
    if (question.isFinal) {
      return answers.ready === (optionId === 'ready');
    }
    return answers[question.id] === optionId;
  };

  // Not ready screen
  if (showNotReady) {
    return (
      <div style={{
        ...styles.container,
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 0.4s ease'
      }}>
        <div style={styles.notReadyContent}>
          <AlertCircle size={64} color="#f97316" style={{ marginBottom: '24px' }} />
          <h1 style={styles.notReadyTitle}>
            Come back when you're ready to change.
          </h1>
          <p style={styles.notReadySubtext}>
            This journey isn't for everyone. It takes real commitment.
          </p>
          <button
            style={styles.returnButton}
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => onCancel(), 400);
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#555555';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#333333';
              e.target.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.container,
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'scale(0.98)' : 'scale(1)',
      transition: 'all 0.4s ease-out'
    }}>
      {/* Back Button */}
      <button
        style={{
          ...styles.backButton,
          opacity: showContent ? 1 : 0,
          transition: 'all 0.3s ease'
        }}
        onClick={handlePrevious}
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

      <div style={{
        ...styles.content,
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.4s ease-out'
      }}>
        {/* Progress Dots */}
        <div style={styles.progressDots}>
          {QUESTIONS.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                backgroundColor: index === currentQuestion
                  ? '#ffffff'
                  : index < currentQuestion
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(255, 255, 255, 0.2)',
                transform: index === currentQuestion ? 'scale(1.3)' : 'scale(1)',
                boxShadow: index === currentQuestion ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Question Counter */}
        <span style={styles.counter}>
          {currentQuestion + 1}/{QUESTIONS.length}
        </span>

        {/* Question */}
        <div style={styles.questionSection}>
          <h1 style={styles.questionTitle}>{question.title}</h1>
          <p style={styles.questionSubtitle}>{question.subtitle}</p>
        </div>

        {/* Options */}
        <div style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const selected = isOptionSelected(option.id);
            return (
              <button
                key={option.id}
                style={{
                  ...styles.optionButton,
                  backgroundColor: selected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderColor: selected ? '#ffffff' : '#333333',
                  boxShadow: selected ? '0 0 25px rgba(255, 255, 255, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.05)' : 'none',
                  transform: selected ? 'scale(1.02)' : 'scale(1)',
                  animationDelay: `${index * 50}ms`
                }}
                onClick={() => handleOptionSelect(option.id)}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = '#555555';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = '#333333';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{
                  ...styles.optionText,
                  color: selected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'
                }}>
                  {option.label}
                </span>
                {question.multiSelect && (
                  <div style={{
                    ...styles.checkbox,
                    backgroundColor: selected ? '#ffffff' : 'transparent',
                    borderColor: selected ? '#ffffff' : '#555555',
                    boxShadow: selected ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'
                  }}>
                    {selected && <span style={styles.checkmark}>✓</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <div style={{
          ...styles.nextButtonContainer,
          opacity: hasAnswer() ? 1 : 0,
          transform: hasAnswer() ? 'translateY(0)' : 'translateY(10px)',
          pointerEvents: hasAnswer() ? 'auto' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <button
            style={styles.nextButton}
            onClick={handleNext}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 25px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.2)';
            }}
          >
            {isLastQuestion ? "Begin My Journey" : "Next"}
            <ChevronRight size={20} />
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
    padding: '40px 20px',
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
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center'
  },
  progressDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  counter: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.1em',
    marginBottom: '32px',
    display: 'block'
  },
  questionSection: {
    marginBottom: '40px'
  },
  questionTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
    color: '#ffffff',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    lineHeight: 1.2
  },
  questionSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px'
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '18px 20px',
    backgroundColor: 'transparent',
    border: '2px solid #333333',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textAlign: 'left'
  },
  optionText: {
    fontSize: '1rem',
    flex: 1,
    transition: 'color 0.2s ease'
  },
  checkbox: {
    width: '22px',
    height: '22px',
    border: '2px solid #555555',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '12px',
    transition: 'all 0.2s ease'
  },
  checkmark: {
    color: '#000000',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  nextButtonContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  nextButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 48px',
    backgroundColor: '#ffffff',
    border: 'none',
    color: '#000000',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1.125rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
  },
  // Not ready screen
  notReadyContent: {
    textAlign: 'center',
    maxWidth: '360px'
  },
  notReadyTitle: {
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    color: '#f97316',
    letterSpacing: '0.05em',
    marginBottom: '16px',
    lineHeight: 1.2
  },
  notReadySubtext: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '40px'
  },
  returnButton: {
    padding: '16px 48px',
    backgroundColor: 'transparent',
    border: '2px solid #333333',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default CommitmentQuestions;
