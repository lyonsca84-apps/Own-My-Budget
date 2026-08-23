import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Coffee, 
  Home, 
  Car, 
  ShoppingBag,
  Briefcase,
  Plus,
  X,
  Pencil,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Target,
  Calendar,
  DollarSign,
  BookOpen,
  Receipt
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const categoryData = [
  { name: 'Housing', value: 1200, color: '#9B59B6', icon: <Home size={16} />, percent: 80 },
  { name: 'Food', value: 450, color: '#3498D8', icon: <Coffee size={16} />, percent: 65 },
  { name: 'Transport', value: 300, color: '#1ABC9C', icon: <Car size={16} />, percent: 45 },
  { name: 'Shopping', value: 250, color: '#2ECC71', icon: <ShoppingBag size={16} />, percent: 30 },
];

export const BudgetScreen: React.FC<{
  paychecks: any[];
  setPaychecks: React.Dispatch<React.SetStateAction<any[]>>;
  categories: any[];
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  groceryBudget: number;
  setActiveTab?: (tab: string) => void;
  user?: User | null;
  totalGrocerySpent: number;
}> = ({ paychecks, setPaychecks, categories, setCategories, onTransaction, groceryBudget, setActiveTab, totalGrocerySpent }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPaycheckId, setEditingPaycheckId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('February 2026');

  const months = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 
    'May 2026', 'June 2026', 'July 2026', 'August 2026', 
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const parseCurrency = (val: string) => parseFloat(val.replace(/[$,]/g, '')) || 0;

  const getIcon = (iconName: string | undefined) => {
    const size = 16;
    switch (iconName) {
      case 'Home': return <Home size={size} />;
      case 'Coffee': return <Coffee size={size} />;
      case 'Car': return <Car size={size} />;
      case 'ShoppingBag': return <ShoppingBag size={size} />;
      default: return <DollarSign size={size} />;
    }
  };

  const totalIncome = paychecks.reduce((acc, p) => acc + parseCurrency(p.amount), 0);
  const totalExpenses = categories.reduce((acc, c) => acc + c.value, 0);
  const leftover = totalIncome - totalExpenses;

  const handleAddPaycheck = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const amount = parseFloat(formData.get('amount') as string);
    const newPaycheck = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(formData.get('date') as string).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      source: formData.get('source') as string,
      received: false
    };
    setPaychecks([...paychecks, newPaycheck]);
    setShowAddModal(false);
  };

  const handleDeletePaycheck = (id: string) => {
    setPaychecks(prev => prev.filter(p => p.id !== id));
  };

  const handleSavePaycheckInline = (id: string, updatedData: any) => {
    if (updatedData.received === true) {
      const paycheck = paychecks.find(p => p.id === id);
      if (paycheck && !paycheck.received) {
        // Use 'income' category to update totalIncomeAdded on dashboard
        onTransaction?.(parseCurrency(paycheck.amount), 'income', 'Checking', 'income');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9B59B6', '#3498D8', '#1ABC9C', '#2ECC71']
        });
      }
    }
    setPaychecks(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    setEditingPaycheckId(null);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory({ ...category });
    setShowEditModal(true);
  };

  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setCategories(prev => prev.map(c => c.name === editingCategory.name ? editingCategory : c));
    setShowEditModal(false);
    setEditingCategory(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab?.('wallet')}
            className="lg:hidden p-2 bg-white border border-mist-purple rounded-xl text-gray-400 hover:text-clarity-purple transition-all cursor-pointer active:opacity-60"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => setActiveTab?.('wallet')}
                className="hidden lg:flex items-center gap-1 text-xs font-bold text-clarity-purple hover:underline mb-1 cursor-pointer active:opacity-60"
              >
                <ChevronLeft size={14} /> Back to Dashboard
              </button>
            </div>
            <h2 className="text-3xl font-bold text-deep-navy tracking-tight">My Budget</h2>
            <p className="text-gray-500 mt-1">Track your income and manage your spending categories.</p>
          </div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 bg-white border border-mist-purple rounded-xl px-4 py-2 shadow-sm">
            <button 
              onClick={() => {
                const idx = months.indexOf(selectedMonth);
                if (idx > 0) setSelectedMonth(months[idx - 1]);
              }}
              className="p-1 hover:text-clarity-purple transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-2 hover:text-clarity-purple transition-colors"
            >
              <span className="text-sm font-bold text-deep-navy">{selectedMonth}</span>
              <ChevronDown size={14} className={`transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <button 
              onClick={() => {
                const idx = months.indexOf(selectedMonth);
                if (idx < months.length - 1) setSelectedMonth(months[idx + 1]);
              }}
              className="p-1 hover:text-clarity-purple transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <AnimatePresence>
            {isMonthDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setIsMonthDropdownOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-mist-purple rounded-2xl shadow-xl z-[70] overflow-hidden py-2"
                >
                  <div className="max-h-60 overflow-y-auto scrollbar-hide">
                    {months.map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setIsMonthDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                          selectedMonth === month 
                            ? 'bg-soft-lavender text-clarity-purple' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Educational Guidance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft-lavender/30 border border-clarity-purple/10 rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-mist-purple text-clarity-purple shrink-0">
            <BookOpen size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-deep-navy">Why Budgeting Matters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-bold text-clarity-purple uppercase tracking-widest">Financial Clarity</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Budgeting isn't about restriction; it's about <span className="font-bold text-deep-navy">intentionality</span>. 
                  When you assign every dollar a job, you stop wondering where your money went and start telling it where to go.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-clarity-purple uppercase tracking-widest">Goal Achievement</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  By tracking your categories, you can identify "leaks" in your spending and redirect those funds 
                  toward your <span className="font-bold text-deep-navy">Emergency Fund</span> or <span className="font-bold text-deep-navy">Debt Repayment</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-progress-green p-4 sm:p-6 rounded-3xl border border-progress-green shadow-lg shadow-progress-green/20 relative overflow-hidden group">
              {/* Faded Background Icon */}
              <div className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12 pointer-events-none">
                <Wallet size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 text-white rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Income</span>
                </div>
                <p className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</p>
                <p className="text-xs text-white/70 mt-1">Total monthly revenue</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-mist-purple shadow-sm relative overflow-hidden group">
              {/* Faded Background Icon */}
              <div className="absolute -right-4 -bottom-4 text-red-500/5 transform -rotate-12 pointer-events-none">
                <Receipt size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                    <TrendingDown size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expenses</span>
                </div>
                <p className="text-2xl font-bold text-deep-navy">${totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Total monthly spending</p>
              </div>
            </div>

            <div className="bg-clarity-purple p-4 sm:p-6 rounded-3xl border border-clarity-purple shadow-lg shadow-clarity-purple/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 text-white rounded-xl">
                  <Wallet size={20} />
                </div>
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Leftover</span>
              </div>
              <p className="text-2xl font-bold text-white">${leftover.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Available to save/invest</p>
            </div>
          </div>

          {/* Grocery Budget Section */}
          <div className="bg-gradient-to-br from-soft-lavender to-white p-6 rounded-3xl border border-mist-purple shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-clarity-purple text-white rounded-2xl shadow-lg shadow-clarity-purple/20">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-deep-navy">Grocery Budget</h3>
                  <button 
                    onClick={() => setActiveTab('grocery')}
                    className="text-xs text-clarity-purple font-bold hover:underline flex items-center gap-1 group"
                  >
                    Go See Tracker
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-deep-navy">${groceryBudget.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Limit</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Spending</p>
                  <p className="text-lg font-bold text-deep-navy">${totalGrocerySpent.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                    totalGrocerySpent > groceryBudget ? 'text-red-500 bg-red-50 border-red-100' : 'text-clarity-purple bg-white border-mist-purple'
                  }`}>
                    {groceryBudget > 0 ? Math.round((totalGrocerySpent / groceryBudget) * 100) : 0}% Used
                  </span>
                </div>
              </div>
              <div className="h-3 bg-white border border-mist-purple rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${groceryBudget > 0 ? Math.min(100, (totalGrocerySpent / groceryBudget) * 100) : 0}%` }}
                  className={`h-full rounded-full ${totalGrocerySpent > groceryBudget ? 'bg-red-500' : 'bg-clarity-purple'}`}
                />
              </div>
              <p className="text-[10px] text-center text-gray-400 font-medium">
                {totalGrocerySpent > groceryBudget ? (
                  <span className="text-red-500 font-bold">You are over budget by ${(totalGrocerySpent - groceryBudget).toLocaleString()}!</span>
                ) : (
                  <>You have <span className="text-deep-navy font-bold">${(groceryBudget - totalGrocerySpent).toLocaleString()}</span> remaining for groceries this month.</>
                )}
              </p>
            </div>
          </div>

          {/* Paycheck Overview */}
          <section className="bg-white rounded-3xl border border-mist-purple overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-mist-purple flex justify-between items-center">
              <h3 className="text-lg font-bold text-deep-navy">Paycheck Overview</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 text-xs font-bold text-clarity-purple bg-soft-lavender px-4 py-2 rounded-xl hover:bg-clarity-purple hover:text-white transition-all"
              >
                <Plus size={16} />
                <span>Add Paycheck</span>
              </button>
            </div>
            <div className="divide-y divide-mist-purple/30">
              {paychecks.map((paycheck) => (
                <div key={paycheck.id} className="p-4 sm:p-6 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-clarity-purple border border-mist-purple/50">
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-deep-navy">{paycheck.source}</p>
                        <p className="text-xs text-gray-400">{paycheck.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-deep-navy">{paycheck.amount}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {paycheck.received ? (
                            <span className="text-[10px] font-bold text-progress-green uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 size={10} /> Received
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingPaycheckId(editingPaycheckId === paycheck.id ? null : paycheck.id)}
                          className="p-2 hover:bg-soft-lavender rounded-xl text-gray-400 hover:text-clarity-purple transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeletePaycheck(paycheck.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Dropdown */}
                  <AnimatePresence>
                    {editingPaycheckId === paycheck.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mt-4 border border-mist-purple/50 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</label>
                              <input 
                                type="text" 
                                defaultValue={paycheck.source}
                                onBlur={(e) => handleSavePaycheckInline(paycheck.id, { source: e.target.value })}
                                className="w-full bg-white border border-mist-purple rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                              <input 
                                type="text" 
                                defaultValue={paycheck.amount}
                                onBlur={(e) => handleSavePaycheckInline(paycheck.id, { amount: e.target.value })}
                                className="w-full bg-white border border-mist-purple rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${paycheck.received ? 'bg-clarity-purple border-clarity-purple' : 'border-mist-purple'}`}>
                                <input 
                                  type="checkbox" 
                                  checked={paycheck.received}
                                  onChange={(e) => handleSavePaycheckInline(paycheck.id, { received: e.target.checked })}
                                  className="hidden"
                                />
                                {paycheck.received && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                              <span className="text-sm font-bold text-deep-navy">Mark as Received</span>
                            </label>
                            <button 
                              onClick={() => setEditingPaycheckId(null)}
                              className="text-sm font-bold text-clarity-purple hover:underline"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Spending by Category */}
          <section className="bg-white p-4 sm:p-8 rounded-3xl border border-mist-purple shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-deep-navy">Spending by Category</h3>
            
            {/* Donut Chart */}
            <div className="h-[240px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Spent</p>
                <p className="text-2xl font-bold text-deep-navy mt-1">${categories.reduce((acc, c) => acc + c.value, 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-5">
              {categories.map((category, idx) => (
                <div key={idx} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {getIcon(category.iconName)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-deep-navy">{category.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category.percent}% of budget</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-deep-navy">${category.value.toLocaleString()}</span>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percent}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Add Paycheck Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-deep-navy">Add Paycheck</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddPaycheck} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Source</label>
                  <input 
                    name="source"
                    type="text" 
                    placeholder="e.g. TechCorp Inc." 
                    className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
                  <input 
                    name="amount"
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
                  <input 
                    name="date"
                    type="date" 
                    className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-clarity-purple text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all mt-4"
                >
                  Confirm Paycheck
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-deep-navy">
                  Edit Category
                </h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form 
                onSubmit={handleSaveCategoryEdit} 
                className="space-y-4"
              >
                {editingCategory && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Category Name</label>
                      <input 
                        type="text" 
                        value={editingCategory.name || ''}
                        disabled
                        className="w-full bg-gray-100 border border-mist-purple rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Spent Amount</label>
                      <input 
                        type="number" 
                        value={editingCategory.value ?? ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, value: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Budget %</label>
                      <input 
                        type="number" 
                        value={editingCategory.percent ?? ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, percent: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                        required
                      />
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  className="w-full bg-clarity-purple text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all mt-4"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
