import React, { useState, useEffect, useRef } from 'react';

// DESIGN SYSTEM TOKENS
const COLORS = {
  clarityPurple: '#9B59B6',
  calmBlue: '#3498D8',
  growthTeal: '#1ABC9C',
  progressGreen: '#2ECC71',
  deepNavy: '#2D3047',
  cleanWhite: '#FFFFFF',
  softLavender: '#F7F4FB',
  mistPurple: '#E8E0F0',
};

const FONTS = {
  primary: '"Neue Montreal", "DM Sans", "Inter", sans-serif',
};

const STYLES = {
  h1: { fontSize: '28px', fontWeight: 'bold', color: COLORS.deepNavy, fontFamily: FONTS.primary, margin: '0 0 8px 0' },
  h2: { fontSize: '22px', fontWeight: '600', color: COLORS.clarityPurple, fontFamily: FONTS.primary, margin: '0 0 16px 0' },
  body: { fontSize: '16px', fontWeight: 'normal', color: COLORS.deepNavy, fontFamily: FONTS.primary, lineHeight: '1.5' },
  label: { fontSize: '14px', fontWeight: '500', color: '#555555', fontFamily: FONTS.primary },
  card: {
    backgroundColor: COLORS.softLavender,
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0px 4px 20px rgba(155, 89, 182, 0.08)',
    border: `1px solid ${COLORS.mistPurple}`,
  },
  button: {
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: FONTS.primary,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0px 4px 12px rgba(155, 89, 182, 0.3)',
  },
  input: {
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    fontFamily: FONTS.primary,
    border: `1px solid ${COLORS.mistPurple}`,
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
    backgroundColor: COLORS.cleanWhite,
  },
};

const QUESTIONS = [
  {
    id: 'name',
    type: 'text',
    question: 'First things first — what should we call you?',
    subtitle: 'No last name needed. This is a judgment-free zone.',
    placeholder: 'Your first name',
  },
  {
    id: 'emotional_state',
    type: 'single',
    question: 'When you think about your money right now, how does it feel?',
    options: [
      'Stressed and overwhelmed',
      "Confused — I'm not sure where it all goes",
      'Okay but I know I could do better',
      'Pretty good just want to level up',
    ],
  },
  {
    id: 'past_budgeting',
    type: 'single',
    question: 'Have you tried budgeting before?',
    options: [
      'Yes but I always gave up',
      'Yes and it kind of worked',
      'A little — nothing formal',
      'Nope this is my first try',
    ],
  },
  {
    id: 'biggest_challenge',
    type: 'single',
    question: 'What feels like your biggest money challenge right now?',
    options: [
      "I don't know where my money goes",
      'I never have enough left at the end of the month',
      'Surprise expenses always throw me off',
      "I know what to do I just don't do it",
    ],
  },
  {
    id: 'pay_frequency',
    type: 'single',
    question: 'How often do you get paid?',
    options: ['Weekly', 'Every two weeks', 'Twice a month', 'Monthly'],
  },
  {
    id: 'goals',
    type: 'multi',
    question: 'What do you most want to get out of Own My Budget?',
    options: [
      'Stop living paycheck to paycheck',
      'Build an emergency fund',
      'Get my bills and subscriptions under control',
      'Pay down debt',
      'Start saving for something big',
      'Just understand my money better',
    ],
  },
  {
    id: 'household',
    type: 'single',
    question: 'Are you managing money for just yourself or for a household?',
    options: ['Just me', 'Me and a partner', 'Me and my family', "It's complicated"],
  },
  {
    id: 'comfort',
    type: 'single',
    question: 'How comfortable are you talking about money?',
    options: [
      'Very uncomfortable — this is hard for me',
      "A little awkward but I'm willing",
      'Pretty comfortable',
      "Very comfortable — let's get into it",
    ],
  },
  {
    id: 'milestones',
    type: 'milestones',
    question: 'Your Journey to Financial Clarity',
    subtitle: 'Here are the milestones we will reach together.',
    milestones: [
      { title: 'The Assessment', desc: 'Understanding where you are today without judgment.' },
      { title: 'The Clean Up', desc: 'Identifying hidden leaks and unnecessary subscriptions.' },
      { title: 'The Safety Net', desc: 'Building your first $1,000 emergency fund.' },
      { title: 'The Growth', desc: 'Starting to save for the things that actually matter to you.' },
    ]
  }
];

const Confetti = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [COLORS.clarityPurple, COLORS.calmBlue, COLORS.growthTeal, COLORS.progressGreen, '#f9ca24', '#ff6b6b'];
    const pieces: any[] = [];
    const numberOfPieces = 160;

    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        rotation: Math.random() * 0.2 - 0.1,
        opacity: 1,
      });
    }

    let animationFrame: number;
    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach((p) => {
        p.y += p.speed;
        p.angle += p.rotation;
        
        if (elapsed > 3000) {
          p.opacity -= 0.01;
        }

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (elapsed < 5000) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrame);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
};

import { auth, db, doc, type User as FirebaseUser } from '../firebase';

interface OnboardingScreenProps {
  onComplete?: (answers: any) => void;
  user: FirebaseUser | null;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, user }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for back

  const handleFinish = () => {
    if (onComplete) onComplete(answers);
  };

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
    if (currentQuestion.type === 'single') {
      setTimeout(() => {
        handleNext();
      }, 350);
    }
  };

  const handleMultiSelect = (option: string) => {
    const currentSelections = answers[currentQuestion.id] || [];
    let newSelections;
    if (currentSelections.includes(option)) {
      newSelections = currentSelections.filter((s: string) => s !== option);
    } else {
      newSelections = [...currentSelections, option];
    }
    setAnswers({ ...answers, [currentQuestion.id]: newSelections });
  };

  const isMultiSelectActive = currentQuestion?.type === 'multi' && (answers[currentQuestion.id]?.length > 0);
  const isTextInputActive = currentQuestion?.type === 'text' && (answers[currentQuestion.id]?.trim().length > 0);

  if (isCompleted) {
    return (
      <div style={{
        backgroundColor: COLORS.cleanWhite,
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}>
        <Confetti active={isCompleted} />
        <div style={{
          ...STYLES.card,
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 20px',
          borderRadius: '24px',
          animation: 'fadeInUp 0.6s ease-out forwards',
        }}>
          <h1 style={STYLES.h1}>You're all set, {answers.name || 'friend'}.</h1>
          <p style={{ ...STYLES.body, marginBottom: '32px' }}>
            Your personalized dashboard is ready. No jargon. No homework. Just your money — finally making sense.
          </p>
          <button
            onClick={handleFinish}
            style={{
              ...STYLES.button,
              backgroundColor: COLORS.clarityPurple,
              color: COLORS.cleanWhite,
              width: '100%',
              marginBottom: '24px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Take me to my dashboard →
          </button>
          <p style={{ ...STYLES.label, fontSize: '12px' }}>
            Your Own My Budget AI Coach is ready when you are.
          </p>
        </div>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: COLORS.cleanWhite,
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '6px',
        backgroundColor: COLORS.mistPurple,
        zIndex: 100,
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: COLORS.clarityPurple,
          transition: 'width 0.4s ease-out',
        }} />
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div 
          key={step}
          style={{
            maxWidth: '500px',
            width: '100%',
            animation: direction === 1 ? 'slideInRight 0.5s ease-out' : 'slideInLeft 0.5s ease-out',
          }}
        >
          <p style={{ ...STYLES.label, marginBottom: '8px', textAlign: 'center' }}>
            {step + 1} of {QUESTIONS.length}
          </p>
          
          <div style={STYLES.card}>
            <h2 style={STYLES.h2}>{currentQuestion.question}</h2>
            {currentQuestion.subtitle && (
              <p style={{ ...STYLES.body, color: '#666', marginBottom: '24px', fontSize: '14px' }}>
                {currentQuestion.subtitle}
              </p>
            )}

            {currentQuestion.type === 'text' && (
              <div style={{ marginBottom: '24px' }}>
                <input
                  autoFocus
                  style={STYLES.input}
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isTextInputActive) handleNext();
                  }}
                />
              </div>
            )}

            {(currentQuestion.type === 'single' || currentQuestion.type === 'multi') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {currentQuestion.options?.map((option) => {
                  const isSelected = currentQuestion.type === 'single' 
                    ? answers[currentQuestion.id] === option
                    : (answers[currentQuestion.id] || []).includes(option);
                  
                  return (
                    <button
                      key={option}
                      onClick={() => currentQuestion.type === 'single' ? handleSelect(option) : handleMultiSelect(option)}
                      style={{
                        ...STYLES.button,
                        backgroundColor: isSelected ? COLORS.clarityPurple : COLORS.cleanWhite,
                        color: isSelected ? COLORS.cleanWhite : COLORS.deepNavy,
                        textAlign: 'left',
                        padding: '16px 20px',
                        boxShadow: isSelected ? STYLES.button.boxShadow : 'none',
                        border: isSelected ? 'none' : `1px solid ${COLORS.mistPurple}`,
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'milestones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {currentQuestion.milestones?.map((m: any, i: number) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'flex-start',
                    padding: '12px',
                    backgroundColor: COLORS.cleanWhite,
                    borderRadius: '12px',
                    border: `1px solid ${COLORS.mistPurple}`
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: COLORS.clarityPurple, 
                      color: COLORS.cleanWhite,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: COLORS.deepNavy }}>{m.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: COLORS.clarityPurple,
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: FONTS.primary,
                  }}
                >
                  ← Back
                </button>
              ) : <div />}

              {(currentQuestion.type === 'multi' || currentQuestion.type === 'text' || currentQuestion.type === 'milestones') && (
                <button
                  disabled={currentQuestion.type === 'multi' ? !isMultiSelectActive : (currentQuestion.type === 'text' ? !isTextInputActive : false)}
                  onClick={handleNext}
                  style={{
                    ...STYLES.button,
                    backgroundColor: (currentQuestion.type === 'multi' ? isMultiSelectActive : (currentQuestion.type === 'text' ? isTextInputActive : true)) ? COLORS.clarityPurple : COLORS.mistPurple,
                    color: COLORS.cleanWhite,
                    opacity: (currentQuestion.type === 'multi' ? isMultiSelectActive : (currentQuestion.type === 'text' ? isTextInputActive : true)) ? 1 : 0.6,
                    cursor: (currentQuestion.type === 'multi' ? isMultiSelectActive : (currentQuestion.type === 'text' ? isTextInputActive : true)) ? 'pointer' : 'not-allowed',
                    padding: '12px 32px',
                  }}
                >
                  {step === QUESTIONS.length - 1 ? 'Finish' : 'Continue'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};


