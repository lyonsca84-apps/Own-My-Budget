import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  User, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  Pencil,
  X,
  ChevronLeft,
  Undo,
  Trash2,
  Landmark
} from 'lucide-react';

interface Loan {
  id: string;
  name: string;
  lender: string;
  originalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  nextDueDate: string;
  interestRate: number;
  isHighInterest?: boolean;
}

const mortgageLoans: Loan[] = [
  {
    id: 'm1',
    name: 'Primary Mortgage',
    lender: 'Chase Bank',
    originalAmount: 450000,
    remainingBalance: 385000,
    monthlyPayment: 2450,
    nextDueDate: 'Apr 01, 2026',
    interestRate: 3.5
  },
  {
    id: 'm2',
    name: 'Home Equity Loan',
    lender: 'Wells Fargo',
    originalAmount: 50000,
    remainingBalance: 42000,
    monthlyPayment: 450,
    nextDueDate: 'Apr 15, 2026',
    interestRate: 5.2
  }
];

const personalLoans: Loan[] = [
  {
    id: 'p1',
    name: 'Student Loan',
    lender: 'Sallie Mae',
    originalAmount: 35000,
    remainingBalance: 28000,
    monthlyPayment: 350,
    nextDueDate: 'Apr 10, 2026',
    interestRate: 4.8
  },
  {
    id: 'p2',
    name: 'Auto Loan',
    lender: 'Toyota Financial',
    originalAmount: 25000,
    remainingBalance: 12500,
    monthlyPayment: 420,
    nextDueDate: 'Apr 05, 2026',
    interestRate: 2.9
  },
  {
    id: 'p3',
    name: 'Payday Loan',
    lender: 'QuickCash',
    originalAmount: 1500,
    remainingBalance: 1200,
    monthlyPayment: 300,
    nextDueDate: 'Mar 25, 2026',
    interestRate: 24.5,
    isHighInterest: true
  },
  {
    id: 'p4',
    name: 'Short-term Loan',
    lender: 'Personal Credit',
    originalAmount: 5000,
    remainingBalance: 3200,
    monthlyPayment: 200,
    nextDueDate: 'Apr 20, 2026',
    interestRate: 8.5
  }
];

const LoanCard: React.FC<{ 
  loan: Loan; 
  onEdit: (loan: Loan) => void;
  onPay: (loan: Loan) => void;
  onDelete: (id: string) => void;
}> = ({ loan, onEdit, onPay, onDelete }) => {
  const paidPercent = ((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100;

  return (
    <div className="bg-[#F7F4FB] rounded-card p-6 border-l-4 border-clarity-purple shadow-sm space-y-6 relative group">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-deep-navy">{loan.name}</h4>
            {loan.isHighInterest && (
              <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={10} /> CAUTION
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">{loan.lender}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Original</p>
            <p className="text-sm font-bold text-deep-navy">${loan.originalAmount.toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onEdit(loan)}
              className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={() => onDelete(loan.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
          <span>Remaining: ${loan.remainingBalance.toLocaleString()}</span>
          <span>{Math.round(paidPercent)}% Paid</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${paidPercent}%` }}
            className="h-full bg-growth-teal rounded-full"
          />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-mist-purple/30">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Monthly</p>
          <p className="text-sm font-bold text-deep-navy">${loan.monthlyPayment}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Rate</p>
          <p className="text-sm font-bold text-clarity-purple">{loan.interestRate}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Next Due</p>
          <p className="text-sm font-bold text-deep-navy">{loan.nextDueDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button 
          type="button"
          onClick={() => onPay(loan)}
          className="flex-1 bg-white border border-clarity-purple text-clarity-purple py-3 rounded-xl text-xs font-bold hover:bg-clarity-purple hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Make Payment
        </button>
      </div>

      {/* High Interest Warning */}
      {loan.isHighInterest && (
        <div className="bg-yellow-50 border border-yellow-100 p-2 rounded-lg flex items-center gap-2">
          <AlertTriangle className="text-yellow-600" size={14} />
          <p className="text-[10px] text-yellow-700 font-medium">
            High interest loan. Tap to explore lower-rate alternatives.
          </p>
        </div>
      )}
    </div>
  );
};

export const LoansScreen: React.FC<{
  mortgages: Loan[];
  setMortgages: React.Dispatch<React.SetStateAction<Loan[]>>;
  personals: Loan[];
  setPersonals: React.Dispatch<React.SetStateAction<Loan[]>>;
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  setActiveTab?: (tab: string) => void;
  user?: any;
}> = ({ mortgages, setMortgages, personals, setPersonals, onTransaction, setActiveTab }) => {
  const [mortgageOpen, setMortgageOpen] = useState(true);
  const [personalOpen, setPersonalOpen] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({
    name: '',
    lender: '',
    originalAmount: 0,
    remainingBalance: 0,
    monthlyPayment: 0,
    interestRate: 0,
    nextDueDate: ''
  });
  const [addType, setAddType] = useState<'mortgage' | 'personal'>('personal');
  const [lastPayment, setLastPayment] = useState<{ loanId: string; amount: number; type: 'mortgage' | 'personal' } | null>(null);

  const totalDebt = [...mortgages, ...personals].reduce((acc, curr) => acc + curr.remainingBalance, 0);

  const handleEditClick = (loan: Loan) => {
    setEditingLoan({ ...loan });
    setIsEditModalOpen(true);
  };

  const handlePayLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentAmount(loan.monthlyPayment.toString());
    setIsPaymentModalOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedLoan || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount)) return;

    onTransaction?.(amount, 'expense', 'Checking', 'loan');
    
    // Update remaining balance
    if (selectedLoan.id.startsWith('m')) {
      setMortgages(prev => prev.map(l => l.id === selectedLoan.id ? { ...l, remainingBalance: Math.max(0, l.remainingBalance - amount) } : l));
      setLastPayment({ loanId: selectedLoan.id, amount, type: 'mortgage' });
    } else {
      setPersonals(prev => prev.map(l => l.id === selectedLoan.id ? { ...l, remainingBalance: Math.max(0, l.remainingBalance - amount) } : l));
      setLastPayment({ loanId: selectedLoan.id, amount, type: 'personal' });
    }

    setIsPaymentModalOpen(false);
    setSelectedLoan(null);
    setPaymentAmount('');
  };

  const handleDeleteLoan = (id: string) => {
    if (id.startsWith('m')) {
      setMortgages(prev => prev.filter(l => l.id !== id));
    } else {
      setPersonals(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleUndoPayment = () => {
    if (!lastPayment) return;

    const { loanId, amount, type } = lastPayment;
    
    // Reverse the transaction
    onTransaction?.(amount, 'income', 'Checking', 'loan');

    // Restore the balance
    if (type === 'mortgage') {
      setMortgages(prev => prev.map(l => l.id === loanId ? { ...l, remainingBalance: l.remainingBalance + amount } : l));
    } else {
      setPersonals(prev => prev.map(l => l.id === loanId ? { ...l, remainingBalance: l.remainingBalance + amount } : l));
    }

    setLastPayment(null);
  };

  const handleSaveEdit = () => {
    if (editingLoan) {
      if (editingLoan.id.startsWith('m')) {
        setMortgages(prev => prev.map(l => l.id === editingLoan.id ? editingLoan : l));
      } else {
        setPersonals(prev => prev.map(l => l.id === editingLoan.id ? editingLoan : l));
      }
      setIsEditModalOpen(false);
      setEditingLoan(null);
    }
  };

  const handleSaveNewLoan = () => {
    if (newLoan.name && newLoan.lender && newLoan.originalAmount) {
      const loanToAdd: Loan = {
        id: `${addType === 'mortgage' ? 'm' : 'p'}-${Date.now()}`,
        name: newLoan.name,
        lender: newLoan.lender,
        originalAmount: Number(newLoan.originalAmount),
        remainingBalance: Number(newLoan.remainingBalance || newLoan.originalAmount),
        monthlyPayment: Number(newLoan.monthlyPayment || 0),
        interestRate: Number(newLoan.interestRate || 0),
        nextDueDate: newLoan.nextDueDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        isHighInterest: Number(newLoan.interestRate || 0) > 15
      };

      if (addType === 'mortgage') {
        setMortgages(prev => [...prev, loanToAdd]);
      } else {
        setPersonals(prev => [...prev, loanToAdd]);
      }

      setIsAddModalOpen(false);
      setNewLoan({
        name: '',
        lender: '',
        originalAmount: 0,
        remainingBalance: 0,
        monthlyPayment: 0,
        interestRate: 0,
        nextDueDate: ''
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
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
            <h2 className="text-3xl font-bold text-deep-navy tracking-tight">Loans & Mortgages</h2>
            <p className="text-gray-500 mt-1">Track your debt payoff progress and loan details.</p>
          </div>
        </div>
        <div className="flex gap-3">
          {lastPayment && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleUndoPayment}
              className="bg-white border border-red-200 text-red-500 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <Undo size={18} />
              <span>Undo Payment</span>
            </motion.button>
          )}
          <button 
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-clarity-purple text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Loan</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -bottom-4 text-white/5 transform -rotate-12 pointer-events-none">
            <Landmark size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-clarity-purple/20 text-clarity-purple rounded-xl">
                <DollarSign size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Debt</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalDebt.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-2 text-growth-teal text-xs font-bold">
              <TrendingDown size={14} />
              <span>Reduced by $2,450 this month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-progress-green/10 text-progress-green rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Interest</span>
          </div>
          <p className="text-2xl font-bold text-deep-navy">4.2%</p>
          <p className="text-xs text-gray-400 mt-1">Weighted average across all loans</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-calm-blue/10 text-calm-blue rounded-xl">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Debt Free Date</span>
          </div>
          <p className="text-2xl font-bold text-clarity-purple">Aug 2032</p>
          <p className="text-xs text-gray-400 mt-1">Based on current payment schedule</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mortgage Section */}
          <section className="space-y-4">
            <button 
              onClick={() => setMortgageOpen(!mortgageOpen)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-3xl border border-mist-purple hover:bg-gray-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-growth-teal/10 flex items-center justify-center text-growth-teal shadow-sm">
                  <Home size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-deep-navy">Mortgage & Home</h3>
                  <p className="text-xs text-gray-500 font-medium">{mortgages.length} active loans</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-deep-navy hidden md:block">${mortgages.reduce((acc, l) => acc + l.remainingBalance, 0).toLocaleString()}</p>
                {mortgageOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {mortgageOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {mortgages.map(loan => <LoanCard key={loan.id} loan={loan} onEdit={handleEditClick} onPay={handlePayLoan} onDelete={handleDeleteLoan} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Personal Loans Section */}
          <section className="space-y-4">
            <button 
              onClick={() => setPersonalOpen(!personalOpen)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-3xl border border-mist-purple hover:bg-gray-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-calm-blue/10 flex items-center justify-center text-calm-blue shadow-sm">
                  <User size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-deep-navy">Personal Loans</h3>
                  <p className="text-xs text-gray-500 font-medium">{personals.length} active loans</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-deep-navy hidden md:block">${personals.reduce((acc, l) => acc + l.remainingBalance, 0).toLocaleString()}</p>
                {personalOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {personalOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {personals.map(loan => <LoanCard key={loan.id} loan={loan} onEdit={handleEditClick} onPay={handlePayLoan} onDelete={handleDeleteLoan} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <div className="space-y-8">
          {/* Payoff Strategy */}
          <section className="bg-white p-8 rounded-3xl border border-mist-purple shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-deep-navy">Payoff Strategy</h3>
            <div className="space-y-6">
              <div className="p-4 bg-clarity-purple/5 rounded-2xl border border-clarity-purple/20">
                <p className="text-sm font-bold text-clarity-purple mb-1">Snowball Method</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Focusing on the Payday Loan ($1,200) first to clear small debts quickly and gain psychological momentum.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Overall Progress</span>
                  <span className="text-growth-teal">12%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-growth-teal w-[12%] rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Debt Breakdown */}
          <section className="bg-white p-8 rounded-3xl border border-mist-purple shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-deep-navy">Debt Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-growth-teal" />
                  <span className="text-sm font-medium text-gray-600">Mortgage</span>
                </div>
                <span className="text-sm font-bold text-deep-navy">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-calm-blue" />
                  <span className="text-sm font-medium text-gray-600">Student</span>
                </div>
                <span className="text-sm font-bold text-deep-navy">8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-clarity-purple" />
                  <span className="text-sm font-medium text-gray-600">Auto</span>
                </div>
                <span className="text-sm font-bold text-deep-navy">5%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm font-medium text-gray-600">Other</span>
                </div>
                <span className="text-sm font-bold text-deep-navy">2%</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedLoan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-deep-navy">Make Payment</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="bg-clarity-purple/5 p-6 rounded-3xl border border-clarity-purple/10">
                <p className="text-[10px] font-bold text-clarity-purple uppercase tracking-widest mb-1">Paying Towards</p>
                <p className="text-lg font-bold text-deep-navy">{selectedLoan.name}</p>
                <p className="text-xs text-gray-400">{selectedLoan.lender}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-deep-navy">$</span>
                    <input 
                      type="number" 
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-mist-purple rounded-xl py-4 pl-8 pr-4 text-lg font-bold outline-none focus:ring-2 focus:ring-clarity-purple/20"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={confirmPayment}
                  className="bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Loan Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
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
                  <h3 className="text-2xl font-bold text-deep-navy">Add New Loan</h3>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex p-1 bg-gray-100 rounded-2xl border border-mist-purple/50">
                    <button
                      onClick={() => setAddType('mortgage')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        addType === 'mortgage' 
                          ? 'bg-white text-clarity-purple shadow-sm' 
                          : 'text-gray-500 hover:text-deep-navy'
                      }`}
                    >
                      Mortgage
                    </button>
                    <button
                      onClick={() => setAddType('personal')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        addType === 'personal' 
                          ? 'bg-white text-clarity-purple shadow-sm' 
                          : 'text-gray-500 hover:text-deep-navy'
                      }`}
                    >
                      Personal Loan
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Loan Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Primary Mortgage"
                      value={newLoan.name || ''}
                      onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Lender</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Chase Bank"
                      value={newLoan.lender || ''}
                      onChange={(e) => setNewLoan({ ...newLoan, lender: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Original Amount</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newLoan.originalAmount || ''}
                        onChange={(e) => setNewLoan({ ...newLoan, originalAmount: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Remaining</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newLoan.remainingBalance || ''}
                        onChange={(e) => setNewLoan({ ...newLoan, remainingBalance: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Monthly Payment</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newLoan.monthlyPayment || ''}
                        onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Interest Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="0.0"
                        value={newLoan.interestRate || ''}
                        onChange={(e) => setNewLoan({ ...newLoan, interestRate: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Next Due Date</label>
                    <input 
                      type="date" 
                      value={newLoan.nextDueDate || ''}
                      onChange={(e) => setNewLoan({ ...newLoan, nextDueDate: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveNewLoan}
                    className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all cursor-pointer"
                  >
                    Add Loan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingLoan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
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
                  <h3 className="text-2xl font-bold text-deep-navy">Edit Loan</h3>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Loan Name</label>
                    <input 
                      type="text" 
                      value={editingLoan.name || ''}
                      onChange={(e) => setEditingLoan({ ...editingLoan, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Lender</label>
                    <input 
                      type="text" 
                      value={editingLoan.lender || ''}
                      onChange={(e) => setEditingLoan({ ...editingLoan, lender: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Original</label>
                      <input 
                        type="number" 
                        value={editingLoan.originalAmount ?? ''}
                        onChange={(e) => setEditingLoan({ ...editingLoan, originalAmount: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Remaining</label>
                      <input 
                        type="number" 
                        value={editingLoan.remainingBalance ?? ''}
                        onChange={(e) => setEditingLoan({ ...editingLoan, remainingBalance: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Monthly Payment</label>
                      <input 
                        type="number" 
                        value={editingLoan.monthlyPayment ?? ''}
                        onChange={(e) => setEditingLoan({ ...editingLoan, monthlyPayment: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Interest Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={editingLoan.interestRate ?? ''}
                        onChange={(e) => setEditingLoan({ ...editingLoan, interestRate: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Next Due Date</label>
                    <input 
                      type="date" 
                      value={editingLoan.nextDueDate || ''}
                      onChange={(e) => setEditingLoan({ ...editingLoan, nextDueDate: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => { handleDeleteLoan(editingLoan.id); setIsEditModalOpen(false); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                  <div className="flex-1 flex gap-3">
                    <button 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
