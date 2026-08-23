import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Info,
  Play,
  CheckCircle2
} from 'lucide-react';

interface TourStep {
  id: string;
  tab: string;
  title: string;
  content: string;
  teachingMoment: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    tab: 'wallet',
    title: 'Your Dashboard',
    content: 'This is your home base — the first thing you will see every time you open Own My Budget. The Dashboard gives you a quick snapshot of your entire financial picture in one place: your income, spending, bills due, savings progress, and any alerts that need your attention. Nothing is hidden here. Everything important rises to the top.',
    teachingMoment: 'Think of the Dashboard like the front page of your financial life. Once you understand what each piece means, checking it will take less than two minutes a day.'
  },
  {
    id: 'budget',
    tab: 'budget',
    title: 'Budgeting',
    content: 'This is where you learn what is coming in and what is going out. Here you can enter your monthly take-home pay — the amount that actually hits your bank account after taxes. We will walk through the difference between fixed expenses, like rent, and variable expenses, like groceries or gas.',
    teachingMoment: 'Knowing your numbers is not about being perfect. It is about not being in the dark anymore. Even a rough budget is better than no budget.'
  },
  {
    id: 'bills',
    tab: 'bills',
    title: 'Bills & Subscriptions',
    content: 'This tab is where you track every recurring charge — rent, utilities, phone, internet, streaming services, and anything else you pay regularly. You can add each one and set a due date so we can remind you before anything is late.',
    teachingMoment: 'Most people are shocked to find subscriptions they forgot they were paying for. This tab helps you take that money back.'
  },
  {
    id: 'loans',
    tab: 'loans',
    title: 'Loans',
    content: 'This is where you see all your debt in one clear place — student loans, car payments, mortgage, or any money you owe. You can add each loan with the balance remaining and the monthly payment amount.',
    teachingMoment: 'Debt feels bigger and scarier when it is hiding in the back of your mind. Once you can actually see it all together, you can start making real decisions about it — and we will help you understand your options.'
  },
  {
    id: 'cards',
    tab: 'cards',
    title: 'Credit Cards',
    content: 'This tab shows what you owe on each credit card and — most importantly — what interest rate you are being charged. You can add any card you carry a balance on. Interest means if your rate is 24% and you carry a $1,000 balance, you are paying about $20 every single month in fees before you pay a single dollar toward what you owe.',
    teachingMoment: 'You deserve to know exactly what your card is costing you every month. Most people have no idea — and that is not your fault. Now you will.'
  },
  {
    id: 'emergency',
    tab: 'emergency',
    title: 'Emergency Fund',
    content: 'Life does not always give a warning — medical bills, car repairs, or a broken appliance. This tab helps you think ahead so that one surprise does not blow up your entire month.',
    teachingMoment: 'You cannot prevent emergencies. But you can stop them from turning into disasters. Having even $500 set aside changes everything about how you handle a crisis.'
  },
  {
    id: 'savings',
    tab: 'savings',
    title: 'Savings',
    content: 'This tab is about building a financial cushion over time. You can set a small, realistic savings goal — even $25 or $50 a month is a meaningful start. We will introduce the idea of an emergency fund: three months of basic living expenses set aside so you have breathing room.',
    teachingMoment: 'Saving is not about having extra money lying around. It is about creating breathing room. Small amounts saved consistently add up faster than most people expect.'
  },
  {
    id: 'grocery',
    tab: 'grocery',
    title: 'Grocery Tracker',
    content: 'This tab helps you stop overspending at the grocery store — one of the biggest and most fixable budget leaks. You can upload a photo of your pantry and the app will log what you already have at home. You can even build a shared family shopping list!',
    teachingMoment: 'Most families throw away over $150 worth of food every month simply because they bought things they already had. This tab puts that money back in your pocket.'
  },
  {
    id: 'therapist',
    tab: 'therapist',
    title: 'AI Budget Buddy',
    content: 'This is the most powerful feature in Own My Budget. The AI Budget Buddy is always available to talk — it listens to your specific situation, asks the right questions, and helps you understand your finances in plain, judgment-free language.',
    teachingMoment: 'You no longer have to figure this out alone. The AI Budget Buddy is here every time you have a question, feel stuck, or just need someone to help you think it through.'
  }
];

interface ClarityTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const ClarityTour: React.FC<ClarityTourProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is the intro/disclaimer
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(-1);
      setIsReady(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveTab(TOUR_STEPS[nextStep].tab);
      setIsReady(false);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > -1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (prevStep >= 0) {
        setActiveTab(TOUR_STEPS[prevStep].tab);
      } else {
        setActiveTab('wallet');
      }
      setIsReady(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-mist-purple"
        >
          {/* Header */}
          <div className="bg-clarity-purple p-6 text-white relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Guided Tour with Clarity</h2>
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                  {currentStep === -1 ? 'Introduction' : `Step ${currentStep + 1} of ${TOUR_STEPS.length}`}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            {currentStep === -1 ? (
              <div className="space-y-6">
                <div className="p-4 bg-clarity-purple/5 rounded-2xl border border-clarity-purple/10">
                  <p className="text-deep-navy leading-relaxed">
                    "Hi there! I'm <span className="font-bold text-clarity-purple">Clarity</span>, your guide inside Own My Budget. Before we get started, I want to be upfront about something."
                  </p>
                </div>
                
                <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <Info size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-amber-900 text-sm">Important Disclaimer</h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Own My Budget is a financial education tool — it is here to teach you how to understand and manage your home finances. We are not a financial advice app, and nothing I share with you should be taken as professional financial advice.
                    </p>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      If you ever need personalized guidance, a licensed financial advisor is the right person to talk to. What we do here is help you learn, get organized, and feel confident about your money. And that is a great place to start.
                    </p>
                  </div>
                </div>

                <p className="text-deep-navy font-medium text-center">
                  Are you ready to begin the tour?
                </p>

                <div className="flex justify-center">
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-4 bg-clarity-purple text-white rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play size={18} />
                    Let's Start
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-deep-navy">{TOUR_STEPS[currentStep].title}</h3>
                  <div className="h-1 w-12 bg-clarity-purple rounded-full" />
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    {TOUR_STEPS[currentStep].content}
                  </p>

                  <div className="p-4 bg-growth-teal/5 rounded-2xl border border-growth-teal/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-growth-teal" />
                      <span className="text-[10px] font-bold text-growth-teal uppercase tracking-widest">Teaching Moment</span>
                    </div>
                    <p className="text-deep-navy font-medium italic leading-relaxed">
                      "{TOUR_STEPS[currentStep].teachingMoment}"
                    </p>
                  </div>

                  {currentStep === TOUR_STEPS.length - 1 && (
                    <div className="p-4 bg-clarity-purple/5 rounded-2xl border border-clarity-purple/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={16} className="text-clarity-purple" />
                        <span className="text-[10px] font-bold text-clarity-purple uppercase tracking-widest">A Friendly Reminder</span>
                      </div>
                      <p className="text-deep-navy text-sm leading-relaxed">
                        The AI Budget Buddy is here to educate and guide you — not to give you financial advice. It will help you understand your numbers and think through your options, but it is not a substitute for a licensed financial advisor.
                      </p>
                    </div>
                  )}
                </div>

                {!isReady ? (
                  <div className="flex flex-col items-center gap-4 pt-4">
                    <p className="text-deep-navy font-medium">Are you ready to move on?</p>
                    <button 
                      onClick={() => setIsReady(true)}
                      className="px-8 py-3 bg-white border-2 border-clarity-purple text-clarity-purple rounded-2xl font-bold hover:bg-clarity-purple hover:text-white transition-all"
                    >
                      Yes, I'm Ready
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-6 border-t border-mist-purple">
                    <button 
                      onClick={handleBack}
                      className="flex items-center gap-2 text-gray-400 hover:text-deep-navy font-bold transition-all"
                    >
                      <ChevronLeft size={20} />
                      Back
                    </button>

                    <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 bg-clarity-purple text-white rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {currentStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Tab'}
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {currentStep >= 0 && (
            <div className="h-1.5 w-full bg-gray-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                className="h-full bg-clarity-purple"
              />
            </div>
          )}
        </motion.div>

        {/* Completion Modal */}
        <AnimatePresence>
          {currentStep === TOUR_STEPS.length && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center p-4 z-[210]"
            >
              <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-mist-purple text-center space-y-6">
                <div className="w-20 h-20 bg-progress-green/10 text-progress-green rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-deep-navy">Tour Complete!</h2>
                  <p className="text-gray-600">
                    Congratulations! You just did something most people never do — you looked at your full financial picture and took the first step toward owning your money.
                  </p>
                </div>
                <div className="p-4 bg-clarity-purple/5 rounded-2xl text-left">
                  <p className="text-xs text-clarity-purple font-bold uppercase tracking-widest mb-2">Final Reminder</p>
                  <p className="text-deep-navy text-sm leading-relaxed">
                    Everything you learned today is here to help you understand your finances better. Own My Budget is a financial education tool — not a financial advice service. We are not licensed financial advisors, and nothing in this app should replace professional financial guidance.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-clarity-purple text-white rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Start Owning My Budget
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
