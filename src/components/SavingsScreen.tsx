import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  TrendingUp, 
  ChevronRight, 
  Award, 
  Target, 
  Zap,
  Clock,
  CheckCircle2,
  X,
  Edit2,
  Settings,
  DollarSign,
  ChevronLeft,
  PiggyBank
} from 'lucide-react';
import { SavingsChallenge, SavingsGoal, Badge, SavingsChallengeBlock, SavingsActivity } from '../types';
import { doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star } from 'lucide-react';

interface SavingsScreenProps {
  challenge: SavingsChallenge;
  setChallenge: React.Dispatch<React.SetStateAction<SavingsChallenge>>;
  savingsGoals: SavingsGoal[];
  setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
  savingsActivities: SavingsActivity[];
  setSavingsActivities: React.Dispatch<React.SetStateAction<SavingsActivity[]>>;
  badges: Badge[];
  setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
  generalSavings: number;
  setGeneralSavings: React.Dispatch<React.SetStateAction<number>>;
  totalBalance: number;
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  setActiveTab?: (tab: string) => void;
  user: any;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({ 
  challenge, 
  setChallenge,
  savingsGoals = [],
  setSavingsGoals,
  savingsActivities = [],
  setSavingsActivities,
  badges = [],
  setBadges,
  generalSavings,
  setGeneralSavings,
  totalBalance,
  onTransaction,
  setActiveTab,
  user
}) => {
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(generalSavings.toString());
  const [editingGoal, setEditingGoal] = useState<Partial<SavingsGoal> | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SavingsChallengeBlock | null>(null);

  const goalTypes = [
    'Emergency Fund', 'Retirement', 'Vacation', 'Car Repair', 
    'Home Expense', 'Medical Expense', 'Holiday Savings', 
    'Back-to-school', 'Custom Goal'
  ] as const;

  const badgeDefinitions = [
    { 
      id: 'savings-goals',
      name: 'Savings Goals', 
      description: 'Complete multiple savings goals to level up!', 
      iconName: 'Target', 
      type: 'savings',
      levels: [
        { level: 'Bronze', target: 1, label: '1 Goal' },
        { level: 'Silver', target: 3, label: '3 Goals' },
        { level: 'Gold', target: 5, label: '5 Goals' }
      ]
    },
    { 
      id: 'challenge-master',
      name: 'Challenge Master', 
      description: 'Complete blocks in the 52-week challenge.', 
      iconName: 'Award', 
      type: 'challenge',
      levels: [
        { level: 'Bronze', target: 13, label: '13 Weeks' },
        { level: 'Silver', target: 26, label: '26 Weeks' },
        { level: 'Gold', target: 52, label: '52 Weeks' }
      ]
    },
    { 
      id: 'emergency-ready',
      name: 'Emergency Ready', 
      description: 'Build your safety net with emergency goals.', 
      iconName: 'Zap', 
      type: 'emergency',
      levels: [
        { level: 'Bronze', target: 1, label: '1 Goal' },
        { level: 'Silver', target: 2, label: '2 Goals' },
        { level: 'Gold', target: 3, label: '3 Goals' }
      ]
    },
    { 
      id: 'streak-saver',
      name: 'Streak Saver', 
      description: 'Maintain a consistent saving streak.', 
      iconName: 'Clock', 
      type: 'streak',
      levels: [
        { level: 'Bronze', target: 4, label: '4 Weeks' },
        { level: 'Silver', target: 8, label: '8 Weeks' },
        { level: 'Gold', target: 12, label: '12 Weeks' }
      ]
    }
  ];

  const addActivity = (description: string, amount: number, type: 'goal' | 'challenge' | 'general') => {
    const newActivity: SavingsActivity = {
      id: `activity-${Date.now()}`,
      description,
      amount: `+$${amount.toLocaleString()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      type
    };
    setSavingsActivities(prev => [newActivity, ...(prev || [])].slice(0, 10));
  };

  const checkAndAwardBadges = (updatedGoals: SavingsGoal[], updatedChallenge: SavingsChallenge) => {
    const newBadges = [...(badges || [])];
    let changed = false;

    // Savings Goals
    const completedGoals = (updatedGoals || []).filter(g => g.isCompleted);
    const savingsDef = badgeDefinitions.find(d => d.id === 'savings-goals');
    if (savingsDef) {
      savingsDef.levels.forEach(level => {
        if (completedGoals.length >= level.target && !badges.find(b => b.name === `${savingsDef.name} - ${level.level}`)) {
          newBadges.push({
            id: `badge-${Date.now()}-${level.level}`,
            name: `${savingsDef.name} - ${level.level}`,
            description: `You reached ${level.level} level by completing ${level.target} goals!`,
            iconName: savingsDef.iconName,
            dateEarned: new Date().toLocaleDateString(),
            type: 'savings'
          });
          changed = true;
        }
      });
    }

    // Challenge Master
    const challengeDef = badgeDefinitions.find(d => d.id === 'challenge-master');
    const completedBlocks = (updatedChallenge?.blocks || []).filter(b => b.isCompleted).length;
    if (challengeDef) {
      challengeDef.levels.forEach(level => {
        if (completedBlocks >= level.target && !badges.find(b => b.name === `${challengeDef.name} - ${level.level}`)) {
          newBadges.push({
            id: `badge-${Date.now()}-${level.level}`,
            name: `${challengeDef.name} - ${level.level}`,
            description: `You reached ${level.level} level by completing ${level.target} weeks!`,
            iconName: challengeDef.iconName,
            dateEarned: new Date().toLocaleDateString(),
            type: 'challenge'
          });
          changed = true;
        }
      });
    }

    // Emergency Ready
    const emergencyDef = badgeDefinitions.find(d => d.id === 'emergency-ready');
    const completedEmergencyGoals = (updatedGoals || []).filter(g => g.isEmergencyRelated && g.isCompleted).length;
    if (emergencyDef) {
      emergencyDef.levels.forEach(level => {
        if (completedEmergencyGoals >= level.target && !badges.find(b => b.name === `${emergencyDef.name} - ${level.level}`)) {
          newBadges.push({
            id: `badge-${Date.now()}-${level.level}`,
            name: `${emergencyDef.name} - ${level.level}`,
            description: `You reached ${level.level} level by completing ${level.target} emergency goals!`,
            iconName: emergencyDef.iconName,
            dateEarned: new Date().toLocaleDateString(),
            type: 'emergency'
          });
          changed = true;
        }
      });
    }

    if (changed) {
      setBadges(newBadges);
    }
  };

  const calculateBlockTarget = (weeks: string, multiplier: number) => {
    const match = weeks.match(/Weeks (\d+)-(\d+)/);
    if (!match) return 0;
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    let sum = 0;
    for (let i = start; i <= end; i++) {
      sum += i;
    }
    return sum * multiplier;
  };

  const handleUpdateBlock = (blockId: string, amount: number, isCompleted: boolean, notes: string) => {
    const block = (challenge?.blocks || []).find(b => b.id === blockId);
    const wasCompleted = block?.isCompleted;

    const newBlocks = (challenge?.blocks || []).map(b => {
      if (b.id === blockId) {
        return { ...b, amountSaved: amount, isCompleted, notes };
      }
      return b;
    });

    if (isCompleted && !wasCompleted) {
      onTransaction?.(amount, 'expense', 'Checking', 'savings');
      addActivity(`52-Week Challenge: ${block?.weeks}`, amount, 'challenge');
    } else if (!isCompleted && wasCompleted) {
      onTransaction?.(amount, 'income', 'Checking', 'savings');
      addActivity(`Undo: 52-Week Challenge: ${block?.weeks}`, -amount, 'challenge');
    }

    const newTotal = newBlocks.reduce((sum, b) => sum + b.amountSaved, 0);
    const updatedChallenge = { ...challenge, blocks: newBlocks, totalSaved: newTotal };
    setChallenge(updatedChallenge);
    checkAndAwardBadges(savingsGoals, updatedChallenge);
    setSelectedBlock(null);
  };

  const handleSaveGoal = () => {
    if (!editingGoal?.name || !editingGoal?.target) return;

    const isEmergencyRelated = ['Emergency Fund', 'Car Repair', 'Medical Expense', 'Home Expense'].includes(editingGoal.type as string);
    
    const newGoal: SavingsGoal = {
      id: editingGoal.id || `goal-${Date.now()}`,
      name: editingGoal.name,
      type: editingGoal.type as any,
      target: Number(editingGoal.target),
      current: Number(editingGoal.current || 0),
      color: editingGoal.color || 'bg-clarity-purple',
      isEmergencyRelated,
      isCompleted: Number(editingGoal.current || 0) >= Number(editingGoal.target),
      createdAt: editingGoal.createdAt || new Date()
    };

    let updatedGoals;
    if (editingGoal.id) {
      const oldGoal = (savingsGoals || []).find(g => g.id === editingGoal.id);
      if (oldGoal && newGoal.current > oldGoal.current) {
        addActivity(`${newGoal.name} Contribution`, newGoal.current - oldGoal.current, 'goal');
      }
      updatedGoals = (savingsGoals || []).map(g => g.id === editingGoal.id ? newGoal : g);
    } else {
      if (newGoal.current > 0) {
        addActivity(`${newGoal.name} Initial Deposit`, newGoal.current, 'goal');
      }
      updatedGoals = [...(savingsGoals || []), newGoal];
    }

    setSavingsGoals(updatedGoals);
    checkAndAwardBadges(updatedGoals, challenge);
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setSavingsGoals(prev => (prev || []).filter(g => g.id !== id));
  };

  const handleSaveBalance = () => {
    const val = parseFloat(newBalance);
    if (!isNaN(val)) {
      if (val > generalSavings) {
        onTransaction?.(val - generalSavings, 'expense', 'Checking', 'savings');
      }
      setGeneralSavings(val);
      setIsEditBalanceModalOpen(false);
    }
  };

  const blocksCompleted = (challenge?.blocks || []).filter(b => b.isCompleted).length;
  const totalBlocks = (challenge?.blocks || []).length;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (blocksCompleted / (totalBlocks || 1)) * circumference;

  const linkedEmergencySavings = (savingsGoals || [])
    .filter(g => g.isEmergencyRelated)
    .reduce((sum, g) => sum + g.current, 0);

  const completedGoalsCount = (savingsGoals || []).filter(g => g.isCompleted).length;
  const activeGoalsCount = (savingsGoals || []).filter(g => !g.isCompleted).length;

  const getBadgeProgress = (badgeId: string) => {
    const completedGoals = (savingsGoals || []).filter(g => g.isCompleted);
    switch (badgeId) {
      case 'savings-goals':
        return completedGoals.length;
      case 'challenge-master':
        return blocksCompleted;
      case 'emergency-ready':
        return (savingsGoals || []).filter(g => g.isEmergencyRelated && g.isCompleted).length;
      case 'streak-saver':
        const uniqueWeeks = new Set(savingsActivities.map(a => {
          const d = new Date(a.date);
          const oneJan = new Date(d.getFullYear(), 0, 1);
          const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
          return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
        }));
        return uniqueWeeks.size;
      default:
        return 0;
    }
  };

  const getBadgeLevel = (badgeId: string) => {
    const def = badgeDefinitions.find(d => d.id === badgeId);
    if (!def) return null;
    const progress = getBadgeProgress(badgeId);
    const earnedLevels = def.levels.filter(l => progress >= l.target);
    if (earnedLevels.length === 0) return null;
    return earnedLevels[earnedLevels.length - 1];
  };

  const getNextBadgeLevel = (badgeId: string) => {
    const def = badgeDefinitions.find(d => d.id === badgeId);
    if (!def) return null;
    const progress = getBadgeProgress(badgeId);
    return def.levels.find(l => progress < l.target) || null;
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab?.('wallet')}
            className="lg:hidden p-2 bg-white border border-mist-purple rounded-xl text-gray-400 hover:text-clarity-purple transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => setActiveTab?.('wallet')}
                className="hidden lg:flex items-center gap-1 text-xs font-bold text-clarity-purple hover:underline mb-1"
              >
                <ChevronLeft size={14} /> Back to Dashboard
              </button>
            </div>
            <h2 className="text-3xl font-bold text-deep-navy tracking-tight">Savings & Goals</h2>
            <p className="text-gray-500 mt-1">Track your progress and participate in savings challenges.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingGoal({ type: 'Emergency Fund', color: 'bg-growth-teal', current: 0, target: 1000 });
              setIsGoalModalOpen(true);
            }}
            className="bg-clarity-purple text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          layout
          className="bg-gradient-to-br from-growth-teal to-progress-green p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group"
        >
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12 pointer-events-none">
            <PiggyBank size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <DollarSign size={20} />
              </div>
              <button 
                onClick={() => {
                  setNewBalance(totalBalance.toString());
                  setIsEditBalanceModalOpen(true);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Saved</p>
            <p className="text-3xl font-bold mt-1">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-white/80 mt-2">You're on track! Great job.</p>
          </div>
        </motion.div>

        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-clarity-purple/10 text-clarity-purple rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Growth</span>
          </div>
          <p className="text-2xl font-bold text-deep-navy">+$581.35</p>
          <div className="mt-2 flex items-center gap-2 text-progress-green text-xs font-bold">
            <TrendingUp size={14} />
            <span>15% increase from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-calm-blue/10 text-calm-blue rounded-xl">
              <Award size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badges Earned</span>
          </div>
          <p className="text-2xl font-bold text-deep-navy">{(badges || []).length} Badges</p>
          <p className="text-xs text-gray-400 mt-1">Keep saving to unlock more!</p>
        </div>
      </div>

      {/* Savings Summary Section */}
      <section className="bg-white rounded-[32px] border border-mist-purple p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-clarity-purple/10 text-clarity-purple rounded-xl">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-bold text-deep-navy">Savings Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Savings</p>
            <p className="text-lg font-bold text-deep-navy">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">52-Week Total</p>
            <p className="text-lg font-bold text-growth-teal">${challenge.totalSaved.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Emergency Goals</p>
            <p className="text-lg font-bold text-calm-blue">${linkedEmergencySavings.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Goals</p>
            <p className="text-lg font-bold text-deep-navy">{activeGoalsCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</p>
            <p className="text-lg font-bold text-progress-green">{completedGoalsCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badges</p>
            <p className="text-lg font-bold text-clarity-purple">{badges.length}</p>
          </div>
        </div>
      </section>

      {/* Active Savings Goals */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-deep-navy">Active Savings Goals</h3>
          <button 
            onClick={() => {
              setEditingGoal({ type: 'Emergency Fund', color: 'bg-growth-teal', current: 0, target: 1000 });
              setIsGoalModalOpen(true);
            }}
            className="text-clarity-purple text-xs font-bold uppercase tracking-widest hover:text-deep-navy transition-colors"
          >
            Add New Goal
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 52-Week Challenge Card */}
          <div className="bg-white rounded-3xl border border-mist-purple p-6 shadow-sm space-y-6 flex flex-col justify-between group hover:border-clarity-purple/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-bold text-deep-navy">52-Week Money Challenge</h4>
                <p className="text-xs text-gray-500">Block {blocksCompleted} of {totalBlocks || 1}</p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r={radius} stroke="rgba(0,0,0,0.05)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="32" cy="32" r={radius} stroke="#9B59B6" strokeWidth="6" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-clarity-purple">{Math.round((blocksCompleted/(totalBlocks || 1))*100)}%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-mist-purple/30">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saved So Far</p>
                <p className="text-xl font-bold text-deep-navy">
                  ${(challenge?.totalSaved || 0).toLocaleString()}.00
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    / ${(1378 * (challenge?.multiplier || 1)).toLocaleString()}.00
                  </span>
                </p>
              </div>
              <button 
                onClick={() => setIsChallengeModalOpen(true)}
                className="bg-clarity-purple text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-opacity-90 transition-all"
              >
                View Details
              </button>
            </div>
          </div>

          {/* Dynamic Savings Goals */}
          {(savingsGoals || []).map((goal) => (
            <div key={goal.id} className="bg-white rounded-3xl border border-mist-purple p-6 shadow-sm space-y-6 group hover:border-growth-teal/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${goal.color.replace('bg-', 'bg-opacity-10 text-')} flex items-center justify-center shadow-sm border border-current/10`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-deep-navy">{goal.name}</h4>
                    <p className="text-xs text-gray-500">{goal.type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditingGoal(goal);
                    setIsGoalModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-clarity-purple transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span className={goal.color.replace('bg-', 'text-')}>{Math.round((goal.current / goal.target) * 100)}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    className={`h-full ${goal.color} rounded-full shadow-sm`}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 font-medium">Remaining: ${Math.max(goal.target - goal.current, 0).toLocaleString()}</p>
                  <p className="text-sm font-bold text-deep-navy">${goal.current.toLocaleString()}.00</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Savings Activity */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-deep-navy">Recent Savings Activity</h3>
          <button className="text-gray-400 hover:text-deep-navy transition-colors">
            <Settings size={20} />
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-mist-purple overflow-hidden shadow-sm">
          <div className="divide-y divide-mist-purple/30">
            {savingsActivities.length > 0 ? (
              savingsActivities.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                    item.type === 'challenge' ? 'bg-clarity-purple/10 text-clarity-purple border-clarity-purple/10' :
                    item.type === 'goal' ? 'bg-growth-teal/10 text-growth-teal border-growth-teal/10' :
                    'bg-calm-blue/10 text-calm-blue border-calm-blue/10'
                  }`}>
                    {item.type === 'challenge' ? <Award size={20} /> : 
                     item.type === 'goal' ? <Target size={20} /> : 
                     <Plus size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-deep-navy">{item.description}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-growth-teal">{item.amount}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Success</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Clock size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No recent savings activity.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Badge Earnings Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-deep-navy">Badge Earnings</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>{badges.length} Unlocked</span>
          </div>
        </div>
        
        <div className="bg-white rounded-[32px] border border-mist-purple p-8 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {badgeDefinitions.map((def) => {
              const currentLevel = getBadgeLevel(def.id);
              const nextLevel = getNextBadgeLevel(def.id);
              const progress = getBadgeProgress(def.id);
              
              const target = nextLevel ? nextLevel.target : (currentLevel ? currentLevel.target : 1);
              const prevTarget = currentLevel ? currentLevel.target : 0;
              const levelProgress = progress - prevTarget;
              const levelTarget = target - prevTarget;
              const percent = Math.min(Math.round((levelProgress / levelTarget) * 100), 100);

              return (
                <div key={def.id} className="flex flex-col items-center text-center space-y-3 group relative">
                  <motion.div 
                    initial={false}
                    animate={currentLevel ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      boxShadow: [
                        '0 0 0 0px rgba(155, 89, 182, 0)',
                        '0 0 0 15px rgba(155, 89, 182, 0.2)',
                        '0 0 0 0px rgba(155, 89, 182, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all relative ${
                      currentLevel ? (
                        currentLevel.level === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-4 ring-yellow-400/20' :
                        currentLevel.level === 'Silver' ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white ring-4 ring-gray-300/20' :
                        'bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-4 ring-orange-400/20'
                      ) : 'bg-gray-100 text-gray-300 grayscale'
                    }`}
                  >
                    {def.iconName === 'Zap' ? <Zap size={32} /> : 
                     def.iconName === 'Target' ? <Target size={32} /> : 
                     def.iconName === 'Clock' ? <Clock size={32} /> :
                     <Award size={32} />}
                    
                    {currentLevel && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-progress-green text-white p-1 rounded-full border-2 border-white"
                      >
                        <CheckCircle2 size={12} />
                      </motion.div>
                    )}
                    
                    {currentLevel && (
                      <div className="absolute -bottom-2 bg-white text-deep-navy text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm border border-mist-purple uppercase">
                        {currentLevel.level}
                      </div>
                    )}
                  </motion.div>

                  <div className="w-full space-y-1 pt-2">
                    <p className={`text-xs font-bold leading-tight transition-colors ${currentLevel ? 'text-deep-navy' : 'text-gray-400'}`}>
                      {def.name}
                    </p>
                    {nextLevel && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            className={`h-full rounded-full ${
                              nextLevel.level === 'Gold' ? 'bg-yellow-400' :
                              nextLevel.level === 'Silver' ? 'bg-gray-400' :
                              'bg-orange-400'
                            }`}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          Next: {nextLevel.label} ({progress}/{nextLevel.target})
                        </p>
                      </div>
                    )}
                    {!nextLevel && currentLevel && (
                      <p className="text-[9px] text-progress-green font-bold uppercase tracking-widest">
                        Max Level Reached!
                      </p>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-40 p-3 bg-deep-navy text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
                    <p className="font-bold mb-1">{def.name}</p>
                    <p className="text-white/70">{def.description}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-deep-navy" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          setEditingGoal({ type: 'Emergency Fund', color: 'bg-growth-teal', current: 0, target: 1000 });
          setIsGoalModalOpen(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-growth-teal text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <Plus size={28} />
      </button>

      {/* 52-Week Challenge Modal */}
      <AnimatePresence>
        {isChallengeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChallengeModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-mist-purple flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-deep-navy">52-Week Money Challenge</h3>
                  <p className="text-sm text-gray-500">Track your progress in 5-week blocks.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-mist-purple">
                    <Settings size={14} className="text-gray-400" />
                    <select 
                      value={challenge.multiplier}
                      onChange={(e) => setChallenge(prev => ({ ...prev, multiplier: parseInt(e.target.value) }))}
                      className="bg-transparent border-none text-xs font-bold text-deep-navy focus:ring-0 cursor-pointer"
                    >
                      <option value={1}>$1 Multiplier</option>
                      <option value={2}>$2 Multiplier</option>
                      <option value={5}>$5 Multiplier</option>
                      <option value={10}>$10 Multiplier</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsChallengeModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-soft-lavender p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-clarity-purple uppercase tracking-wider">Total Saved</p>
                    <p className="text-2xl font-bold text-deep-navy">
                      ${challenge.totalSaved.toLocaleString()}
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        / ${(1378 * challenge.multiplier).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-growth-teal uppercase tracking-wider">Blocks Done</p>
                    <p className="text-2xl font-bold text-deep-navy">{blocksCompleted}/{totalBlocks}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-calm-blue uppercase tracking-wider">Progress</p>
                    <p className="text-2xl font-bold text-deep-navy">{Math.round((blocksCompleted/totalBlocks)*100)}%</p>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {challenge.blocks.map((block) => (
                    <div 
                      key={block.id}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        block.isCompleted 
                          ? 'bg-growth-teal/5 border-growth-teal/20' 
                          : 'bg-white border-mist-purple hover:border-clarity-purple/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${block.isCompleted ? 'bg-growth-teal text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {block.isCompleted ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-deep-navy">{block.weeks}</h4>
                            <p className="text-xs text-gray-500">
                              {block.isCompleted ? 'Completed' : 'In Progress'} • {block.notes || 'No notes'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-deep-navy">
                              ${block.amountSaved.toLocaleString()}
                              <span className="text-[10px] text-gray-400 font-normal ml-1">
                                / ${calculateBlockTarget(block.weeks, challenge.multiplier).toLocaleString()}
                              </span>
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saved / Target</p>
                          </div>
                          <button 
                            onClick={() => setSelectedBlock(block)}
                            className="p-2 text-gray-400 hover:text-clarity-purple transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Block Edit Modal */}
      <AnimatePresence>
        {selectedBlock && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBlock(null)}
              className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold text-deep-navy mb-6">Update {selectedBlock.weeks}</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount Saved</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number"
                      defaultValue={selectedBlock.amountSaved || calculateBlockTarget(selectedBlock.weeks, challenge.multiplier)}
                      id="blockAmount"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-lg font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Notes</label>
                  <textarea 
                    id="blockNotes"
                    defaultValue={selectedBlock.notes}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 h-24 resize-none"
                    placeholder="Add a note about this block..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="blockCompleted"
                    defaultChecked={selectedBlock.isCompleted}
                    className="w-5 h-5 rounded border-mist-purple text-clarity-purple focus:ring-clarity-purple/20"
                  />
                  <label htmlFor="blockCompleted" className="text-sm font-bold text-deep-navy">Mark as Completed</label>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedBlock(null)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const amount = Number((document.getElementById('blockAmount') as HTMLInputElement).value);
                      const notes = (document.getElementById('blockNotes') as HTMLTextAreaElement).value;
                      const isCompleted = (document.getElementById('blockCompleted') as HTMLInputElement).checked;
                      handleUpdateBlock(selectedBlock.id, amount, isCompleted, notes);
                    }}
                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-clarity-purple shadow-lg shadow-clarity-purple/20"
                  >
                    Save Block
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-deep-navy">{editingGoal?.id ? 'Edit Goal' : 'New Savings Goal'}</h3>
                <button onClick={() => setIsGoalModalOpen(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Goal Name</label>
                    <input 
                      type="text"
                      value={editingGoal?.name || ''}
                      onChange={(e) => setEditingGoal(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-lg font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20"
                      placeholder="e.g., Summer Vacation"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Goal Type</label>
                    <select 
                      value={editingGoal?.type || 'Emergency Fund'}
                      onChange={(e) => setEditingGoal(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20"
                    >
                      {goalTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target Amount</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="number"
                          value={editingGoal?.target ?? ''}
                          onChange={(e) => setEditingGoal(prev => ({ ...prev, target: Number(e.target.value) || 0 }))}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 text-lg font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Saved Amount</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="number"
                          value={editingGoal?.current ?? ''}
                          onChange={(e) => setEditingGoal(prev => ({ ...prev, current: Number(e.target.value) || 0 }))}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 text-lg font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20"
                        />
                      </div>
                    </div>
                  </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Goal Color</label>
                  <div className="flex gap-3">
                    {['bg-clarity-purple', 'bg-growth-teal', 'bg-calm-blue', 'bg-orange-500', 'bg-rose-500'].map(color => (
                      <button 
                        key={color}
                        onClick={() => setEditingGoal(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full ${color} ${editingGoal?.color === color ? 'ring-4 ring-gray-100 scale-110' : ''} transition-all`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {editingGoal?.id && (
                    <button 
                      onClick={() => {
                        handleDeleteGoal(editingGoal.id!);
                        setIsGoalModalOpen(false);
                      }}
                      className="flex-1 py-4 rounded-2xl font-bold text-rose-500 bg-rose-50 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    onClick={handleSaveGoal}
                    className="flex-[2] py-4 rounded-2xl font-bold text-white bg-clarity-purple shadow-lg shadow-clarity-purple/20"
                  >
                    {editingGoal?.id ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Survival Money Challenge Modal (Hidden for now as requested to focus on 52-week and goals) */}

      {/* Edit Balance Modal */}
      <AnimatePresence>
        {isEditBalanceModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditBalanceModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-deep-navy">Edit Total Saved</h3>
                <button onClick={() => setIsEditBalanceModalOpen(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Current Balance</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-xl font-bold text-deep-navy focus:ring-2 focus:ring-growth-teal/20"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditBalanceModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveBalance}
                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-growth-teal shadow-lg shadow-growth-teal/20 hover:bg-growth-teal/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
