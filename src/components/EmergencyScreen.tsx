import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Car, 
  Home, 
  Plane, 
  AlertCircle,
  ChevronRight,
  PlusCircle,
  Wrench,
  X,
  DollarSign,
  ArrowUpCircle,
  Pencil,
  CheckCircle2,
  Target,
  ChevronLeft,
  Trash2
} from 'lucide-react';

import { EmergencyLog, SavingsGoal, SavingsActivity } from '../types';
import { 
  db, 
  doc, 
  updateDoc, 
  setDoc,
  collection, 
  addDoc, 
  deleteDoc,
  Timestamp,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { User } from 'firebase/auth';

interface EmergencyScreenProps {
  user: User | null;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  logs: EmergencyLog[];
  setLogs: React.Dispatch<React.SetStateAction<EmergencyLog[]>>;
  savingsGoals: SavingsGoal[];
  setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
  savingsActivities: SavingsActivity[];
  setSavingsActivities: React.Dispatch<React.SetStateAction<SavingsActivity[]>>;
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  setActiveTab?: (tab: string) => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const CAR_REPAIRS = [
  { name: 'Oil and Filter Change', cost: 75 },
  { name: 'Tire Rotation', cost: 40 },
  { name: 'Wiper Blade Replacement', cost: 30 },
  { name: 'Air Filter Replacement', cost: 45 },
  { name: 'Wheel Alignment', cost: 110 },
  { name: 'Multi-point Inspection', cost: 50 },
  { name: 'Brake Pad Replacement', cost: 225 },
  { name: 'Battery Replacement', cost: 175 },
  { name: 'Brake Rotor/Caliper Replacement', cost: 450 },
  { name: 'Oxygen Sensor Replacement', cost: 250 },
  { name: 'Alternator/Starter Replacement', cost: 550 },
  { name: 'Timing Belt Replacement', cost: 850 },
  { name: 'Windshield Replacement', cost: 400 },
  { name: 'Fuel Pump/Injector Replacement', cost: 750 },
  { name: 'Catalytic Converter Replacement', cost: 1600 },
  { name: 'Transmission Replacement', cost: 3500 },
  { name: 'Engine Replacement', cost: 5500 },
];

const HOME_REPAIRS = [
  { name: 'Roof Repair/Replacement', cost: 3000 },
  { name: 'Gutter Cleaning/Replacement', cost: 75 },
  { name: 'Siding Repair', cost: 500 },
  { name: 'Window Replacement', cost: 650 },
  { name: 'HVAC Annual Servicing', cost: 150 },
  { name: 'Furnace Repair', cost: 125 },
  { name: 'AC Repair', cost: 150 },
  { name: 'HVAC System Replacement', cost: 5000 },
  { name: 'Leaking Pipes Repair', cost: 250 },
  { name: 'Drain Cleaning', cost: 150 },
  { name: 'Toilet Repair', cost: 150 },
  { name: 'Water Heater Replacement', cost: 800 },
  { name: 'Electrical Panel Upgrade', cost: 1500 },
  { name: 'Electrical Fixture Replacement', cost: 200 },
  { name: 'Fixing Outlets', cost: 348 },
  { name: 'Dryer Vent Cleaning', cost: 100 },
  { name: 'Refrigerator Repair', cost: 125 },
  { name: 'Washer/Dryer Maintenance', cost: 100 },
  { name: 'Foundation Cracking/Leveling', cost: 5000 },
  { name: 'Pest Control', cost: 150 },
  { name: 'Tree Trimming', cost: 300 },
  { name: 'Deck Maintenance', cost: 400 },
];

const MEDICAL_EXPENSES = [
  { name: 'Doctor Visit (Primary Care)', cost: 200 },
  { name: 'Specialist Visit', cost: 275 },
  { name: 'Urgent Care Visit', cost: 150 },
  { name: 'Emergency Room Visit', cost: 2000 },
  { name: 'Physical Therapy Session', cost: 110 },
  { name: 'Lab Tests (Blood work)', cost: 125 },
  { name: 'MRI Scan', cost: 1750 },
  { name: 'Prescription Drugs', cost: 50 },
  { name: 'Dental Exam/Cleaning', cost: 200 },
  { name: 'Eye Exam', cost: 100 },
  { name: 'Hospital Stay (One Day)', cost: 3025 },
  { name: 'Ambulance Service', cost: 800 },
  { name: 'Broken Bone Treatment', cost: 2500 },
];

const TRAVEL_EXPENSES = [
  { name: 'Airport Parking', cost: 20 },
  { name: 'Ground Transportation (Uber/Taxi)', cost: 50 },
  { name: 'Checked/Carry-on Bag Fees', cost: 65 },
  { name: 'Airport Food and Drinks', cost: 25 },
  { name: 'Wi-Fi Access', cost: 15 },
  { name: 'Resort Fees / Parking Fees', cost: 35 },
  { name: 'Unexpected Toiletry/Medicine', cost: 20 },
  { name: 'Tipping (Baggage/Housekeeping)', cost: 5 },
  { name: 'Currency Exchange/ATM Fees', cost: 10 },
  { name: 'Seat Selection/Upgrades', cost: 80 },
  { name: 'Replacement Clothing/Gear', cost: 60 },
];

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ 
  user,
  balance, 
  setBalance, 
  logs = [], 
  setLogs,
  savingsGoals = [], 
  setSavingsGoals,
  savingsActivities = [],
  setSavingsActivities,
  onTransaction,
  setActiveTab,
  showToast
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [logToDeleteId, setLogToDeleteId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<EmergencyLog | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Medical');
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    notes: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [fundAmount, setFundAmount] = useState('');
  const [editBalanceValue, setEditBalanceValue] = useState('');

  const SAFETY_GOAL = 12000;
  const emergencyRelatedGoals = (savingsGoals || []).filter(goal => goal.isEmergencyRelated);
  const goalsTargetTotal = emergencyRelatedGoals.reduce((acc, goal) => acc + goal.target, 0);
  const goalsCurrentTotal = emergencyRelatedGoals.reduce((acc, goal) => acc + goal.current, 0);

  const pendingAmount = (logs || []).reduce((acc, log) => log.status === 'Pending' ? acc + log.amount : acc, 0);
  const totalGoal = Math.max(SAFETY_GOAL, goalsTargetTotal) + pendingAmount;
  
  const totalTasks = (logs || []).length;
  const completedTasks = (logs || []).filter(log => log.status === 'Paid').length;
  
  const readinessPercentage = Math.max(0, Math.min(Math.round(((balance + goalsCurrentTotal) / totalGoal) * 100), 100));
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray * (1 - readinessPercentage / 100);

  const categoryTotals = (logs || []).reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + log.amount;
    return acc;
  }, {} as Record<string, number>);

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

  const handleLogExpense = (category: string) => {
    setSelectedCategory(category);
    setIsLogModalOpen(true);
  };

  const saveExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !user) return;

    const amount = parseFloat(newExpense.amount);
    const categoryIcons: Record<string, string> = {
      'Medical': 'Stethoscope',
      'Car': 'Car',
      'Home': 'Wrench',
      'Travel': 'Plane'
    };

    const logId = editingLog?.id || `log-${Date.now()}`;
    const logRef = doc(db, 'emergencyLogs', logId);
    
    const logData = {
      id: logId,
      uid: user.uid,
      date: newExpense.date || new Date().toISOString().split('T')[0],
      category: selectedCategory,
      iconName: categoryIcons[selectedCategory] || 'AlertCircle',
      description: newExpense.description,
      notes: newExpense.notes,
      amount: amount,
      status: editingLog?.status || 'Pending',
      createdAt: editingLog?.createdAt || serverTimestamp()
    };

    try {
      await setDoc(logRef, logData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `emergencyLogs/${logId}`);
    }
    
    // Update local state for immediate feedback
    if (editingLog) {
      setLogs((prev) => (prev || []).map(l => l.id === logId ? (logData as any) : l));
    } else {
      setLogs((prev) => [logData as any, ...(prev || [])]);
    }

    setIsLogModalOpen(false);
    setNewExpense({ description: '', notes: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setEditingLog(null);
  };

  const handleDeleteLog = async (id: string) => {
    setLogToDeleteId(id);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteLog = async () => {
    if (!user || !logToDeleteId) return;
    try {
      await deleteDoc(doc(db, 'emergencyLogs', logToDeleteId));
      setLogs((prev) => (prev || []).filter(l => l.id !== logToDeleteId));
      setIsDeleteConfirmModalOpen(false);
      setLogToDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `emergencyLogs/${logToDeleteId}`);
    }
  };

  const handlePayLog = async (id: string, amount: number) => {
    if (!user) return;
    if (balance >= amount) {
      onTransaction?.(amount, 'expense', 'Emergency', 'emergency');
      const newBalance = balance - amount;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          emergencyBalance: newBalance
        });
        await updateDoc(doc(db, 'emergencyLogs', id), {
          status: 'Paid'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid} or emergencyLogs/${id}`);
      }
    } else {
      showToast?.('error', "Insufficient funds in Emergency Fund. Please 'Build My Budget Fund' to add more.");
    }
  };

  const handleFundEmergency = async () => {
    if (!fundAmount || !user) return;
    const amount = parseFloat(fundAmount);
    
    // This is effectively a transfer from Checking to Emergency
    onTransaction?.(amount, 'expense', 'Checking', 'emergency');
    onTransaction?.(amount, 'income', 'Emergency', 'emergency');

    const newBalance = balance + amount;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        emergencyBalance: newBalance
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
    setIsFundModalOpen(false);
    setFundAmount('');
  };

  const handleUpdateBalance = async () => {
    if (!editBalanceValue || !user) return;
    const amount = parseFloat(editBalanceValue);
    if (!isNaN(amount)) {
      if (amount > balance) {
        onTransaction?.(amount - balance, 'expense', 'Checking', 'emergency');
      }
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          emergencyBalance: amount
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
      setIsEditBalanceModalOpen(false);
    }
  };

  const handleSaveGoal = () => {
    if (!editingGoal || !editingGoal.name || !editingGoal.target) return;

    const oldGoal = (savingsGoals || []).find(g => g.id === editingGoal.id);
    if (oldGoal && editingGoal.current > oldGoal.current) {
      addActivity(`${editingGoal.name} Contribution`, editingGoal.current - oldGoal.current, 'goal');
    } else if (!oldGoal && editingGoal.current > 0) {
      addActivity(`${editingGoal.name} Initial Deposit`, editingGoal.current, 'goal');
    }

    if (oldGoal) {
      setSavingsGoals(prev => (prev || []).map(g => g.id === editingGoal.id ? editingGoal : g));
    } else {
      setSavingsGoals(prev => [...(prev || []), editingGoal]);
    }
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setSavingsGoals(prev => (prev || []).filter(g => g.id !== id));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope size={16} className="text-red-500" />;
      case 'Car': return <Car size={16} className="text-orange-500" />;
      case 'Wrench': return <Wrench size={16} className="text-yellow-700" />;
      case 'Plane': return <Plane size={16} className="text-blue-500" />;
      default: return <AlertCircle size={16} />;
    }
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
            <h2 className="text-3xl font-bold text-deep-navy tracking-tight">Emergency Fund</h2>
            <p className="text-gray-500 mt-1">Prepare for the unexpected and protect your financial future.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsFundModalOpen(true)}
            className="bg-growth-teal text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>Add Funds</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          layout
          className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group"
        >
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12 pointer-events-none">
            <AlertCircle size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <button 
                onClick={() => {
                  setEditBalanceValue(balance.toString());
                  setIsEditBalanceModalOpen(true);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil size={16} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Available Balance</p>
            <p className="text-3xl font-bold mt-1">${balance.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                {readinessPercentage < 30 ? 'CRITICALLY LOW' : readinessPercentage < 70 ? 'PARTIALLY PREPARED' : readinessPercentage < 100 ? 'NEARLY SECURED' : 'FULLY SECURED'}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-clarity-purple/10 text-clarity-purple rounded-xl">
              <Target size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Readiness Goal</span>
          </div>
          <p className="text-2xl font-bold text-deep-navy">${totalGoal.toLocaleString()}</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Progress</span>
              <span className="text-clarity-purple">{readinessPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${readinessPercentage}%` }}
                className="h-full bg-clarity-purple rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-calm-blue/10 text-calm-blue rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasks Paid</span>
          </div>
          <p className="text-2xl font-bold text-deep-navy">{completedTasks} / {totalTasks}</p>
          <p className="text-xs text-gray-400 mt-1">
            {pendingAmount > 0 
              ? `$${pendingAmount.toLocaleString()} in pending expenses` 
              : "All expenses are paid"}
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { id: 'Medical', label: 'Medical Bills', icon: <Stethoscope size={24} />, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
          { id: 'Car', label: 'Car Repairs', icon: <Car size={24} />, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
          { id: 'Home', label: 'Home Repairs', icon: <Home size={24} />, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
          { id: 'Travel', label: 'Sudden Travel', icon: <Plane size={24} />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
        ].map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm border border-mist-purple group hover:border-clarity-purple/30 transition-all">
            <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} shadow-sm border ${cat.border} group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <div>
              <h4 className="font-bold text-deep-navy">{cat.label}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total: ${(categoryTotals[cat.id] || 0).toLocaleString()}</p>
            </div>
            <button 
              onClick={() => handleLogExpense(cat.id)}
              className="w-full py-2.5 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-mist-purple/30 hover:bg-clarity-purple hover:text-white hover:border-clarity-purple transition-all"
            >
              Log Expense
            </button>
          </div>
        ))}
      </div>

      {/* Recent Log List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-deep-navy">Emergency Savings Goals</h3>
          <button 
            onClick={() => {
              setEditingGoal({
                id: `goal-${Date.now()}`,
                name: '',
                type: 'Emergency Fund',
                target: 0,
                current: 0,
                color: 'bg-red-500',
                isEmergencyRelated: true,
                isCompleted: false,
                createdAt: new Date().toISOString()
              });
              setIsGoalModalOpen(true);
            }}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
          >
            <PlusCircle size={14} />
            <span>New Goal</span>
          </button>
        </div>

        {emergencyRelatedGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyRelatedGoals.map((goal) => (
              <div key={goal.id} className="bg-white p-5 rounded-3xl border border-mist-purple shadow-sm group hover:border-red-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${goal.color} bg-opacity-10 flex items-center justify-center`}>
                      <Target size={20} className={goal.color.replace('bg-', 'text-')} />
                    </div>
                    <div>
                      <h4 className="font-bold text-deep-navy">{goal.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{goal.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsGoalModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-clarity-purple"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-all"
                      title="Delete Goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400 uppercase tracking-widest">Progress</span>
                    <span className="text-deep-navy">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                      className={`h-full ${goal.color} rounded-full`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-mist-purple/50 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Target size={32} className="text-gray-300" />
            </div>
            <h4 className="text-lg font-bold text-deep-navy">No Emergency Goals Yet</h4>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
              Create specific savings goals for emergencies to track your progress more effectively.
            </p>
          </div>
        )}
      </section>

      {/* Recent Log List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-deep-navy">Recent Emergency Log</h3>
          <button className="text-clarity-purple text-xs font-bold uppercase tracking-widest hover:text-deep-navy transition-colors">View History</button>
        </div>

        <div className="bg-white rounded-3xl border border-mist-purple overflow-hidden shadow-sm">
          <div className="divide-y divide-mist-purple/30">
            {(logs || []).map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm border border-mist-purple/30">
                  {getIcon(log.iconName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-deep-navy truncate">{log.description}</p>
                  {log.notes && <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{log.notes}"</p>}
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">{log.category} • {log.date}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-red-500">-${log.amount.toLocaleString()}</p>
                    <div className="flex gap-1 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingLog(log);
                          setSelectedCategory(log.category);
                          setNewExpense({
                            description: log.description,
                            amount: log.amount.toString(),
                            notes: log.notes || '',
                            date: log.date
                          });
                          setIsLogModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-clarity-purple transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-all"
                        title="Delete Log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.status === 'Pending' && (
                      <button 
                        onClick={() => handlePayLog(log.id, log.amount)}
                        className="text-[9px] font-bold px-3 py-1 rounded-full bg-clarity-purple text-white hover:bg-opacity-90 transition-all uppercase tracking-widest shadow-sm"
                      >
                        Pay Now
                      </button>
                    )}
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                      log.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <button 
        onClick={() => setIsFundModalOpen(true)}
        className="w-full bg-deep-navy text-white py-6 rounded-3xl font-bold text-lg shadow-xl hover:bg-opacity-95 transition-all flex items-center justify-center gap-3 group border border-white/10"
      >
        <ArrowUpCircle size={24} className="group-hover:scale-110 transition-transform duration-300" />
        <span>Build My Budget Fund</span>
      </button>

      {/* Log Expense Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Log {selectedCategory} Expense</h3>
                  <button 
                    onClick={() => setIsLogModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedCategory === 'Medical' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Common Medical Expenses</label>
                      <select 
                        onChange={(e) => {
                          const expense = MEDICAL_EXPENSES.find(m => m.name === e.target.value);
                          if (expense) {
                            setNewExpense({
                              ...newExpense,
                              description: expense.name,
                              amount: expense.cost.toString()
                            });
                          }
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      >
                        <option value="">Select a common expense...</option>
                        {MEDICAL_EXPENSES.map(expense => (
                          <option key={expense.name} value={expense.name}>
                            {expense.name} (${expense.cost.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedCategory === 'Car' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Standard Repair List</label>
                      <select 
                        onChange={(e) => {
                          const repair = CAR_REPAIRS.find(r => r.name === e.target.value);
                          if (repair) {
                            setNewExpense({
                              ...newExpense,
                              description: repair.name,
                              amount: repair.cost.toString()
                            });
                          }
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      >
                        <option value="">Select a standard repair...</option>
                        {CAR_REPAIRS.map(repair => (
                          <option key={repair.name} value={repair.name}>
                            {repair.name} (${repair.cost})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedCategory === 'Home' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Common Home Repairs</label>
                      <select 
                        onChange={(e) => {
                          const repair = HOME_REPAIRS.find(r => r.name === e.target.value);
                          if (repair) {
                            setNewExpense({
                              ...newExpense,
                              description: repair.name,
                              amount: repair.cost.toString()
                            });
                          }
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      >
                        <option value="">Select a common repair...</option>
                        {HOME_REPAIRS.map(repair => (
                          <option key={repair.name} value={repair.name}>
                            {repair.name} (${repair.cost.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedCategory === 'Travel' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Standard Sudden Travel Expenses</label>
                      <select 
                        onChange={(e) => {
                          const expense = TRAVEL_EXPENSES.find(t => t.name === e.target.value);
                          if (expense) {
                            setNewExpense({
                              ...newExpense,
                              description: expense.name,
                              amount: expense.cost.toString()
                            });
                          }
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      >
                        <option value="">Select a travel expense...</option>
                        {TRAVEL_EXPENSES.map(expense => (
                          <option key={expense.name} value={expense.name}>
                            {expense.name} (${expense.cost.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Urgent Care Visit"
                      value={newExpense.description || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Reason / Details</label>
                    <textarea 
                      placeholder={`e.g., ${selectedCategory === 'Medical' ? 'Severe allergic reaction' : selectedCategory === 'Car' ? 'Car wouldn\'t start' : 'Kitchen sink burst'}`}
                      value={newExpense.notes || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Amount</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newExpense.amount || ''}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Date</label>
                    <input 
                      type="date" 
                      value={newExpense.date || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  {editingLog && (
                    <button 
                      onClick={() => { handleDeleteLog(editingLog.id); setIsLogModalOpen(false); }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  )}
                  <div className="flex-1 flex gap-3">
                    <button 
                      onClick={() => setIsLogModalOpen(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveExpense}
                      className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                    >
                      {editingLog ? 'Save Changes' : 'Save Expense'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bill Budget Fund Modal */}
      <AnimatePresence>
        {isFundModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFundModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Build My Budget Fund</h3>
                  <button 
                    onClick={() => setIsFundModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Transfer money from your primary budget into your emergency fund to increase your readiness.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Amount to Transfer</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsFundModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleFundEmergency}
                    className="flex-1 bg-growth-teal text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                  >
                    Transfer Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Balance Modal */}
      <AnimatePresence>
        {isEditBalanceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Edit Available Balance</h3>
                  <button 
                    onClick={() => setIsEditBalanceModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Manually adjust your emergency fund balance. This will override the current amount.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">New Balance</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={editBalanceValue}
                        onChange={(e) => setEditBalanceValue(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsEditBalanceModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateBalance}
                    className="flex-1 bg-deep-navy text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                  >
                    Update Balance
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Modal */}
      <AnimatePresence>
        {isGoalModalOpen && editingGoal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">
                    {savingsGoals.find(g => g.id === editingGoal.id) ? 'Edit Goal' : 'New Emergency Goal'}
                  </h3>
                  <button 
                    onClick={() => setIsGoalModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Goal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Car Repair Fund"
                      value={editingGoal.name || ''}
                      onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Target Amount</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="number" 
                          placeholder="0"
                          value={editingGoal.target ?? ''}
                          onChange={(e) => setEditingGoal({ ...editingGoal, target: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-deep-navy font-medium focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Current Saved</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="number" 
                          placeholder="0"
                          value={editingGoal.current ?? ''}
                          onChange={(e) => setEditingGoal({ ...editingGoal, current: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-deep-navy font-medium focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Goal Color</label>
                    <div className="flex gap-2">
                      {['bg-red-500', 'bg-orange-500', 'bg-yellow-600', 'bg-blue-500', 'bg-purple-500'].map(color => (
                        <button
                          key={color}
                          onClick={() => setEditingGoal({ ...editingGoal, color })}
                          className={`w-8 h-8 rounded-full ${color} transition-all ${editingGoal.color === color ? 'ring-2 ring-offset-2 ring-deep-navy scale-110' : 'opacity-60 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsGoalModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveGoal}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                  >
                    Save Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {isDeleteConfirmModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-deep-navy mb-2">Delete Log Entry?</h3>
              <p className="text-gray-500 mb-8">This action cannot be undone. Are you sure you want to remove this emergency log?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteConfirmModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteLog}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
