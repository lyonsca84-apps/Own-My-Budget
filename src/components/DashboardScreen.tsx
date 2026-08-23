import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Download, 
  Calendar, 
  Search, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight,
  Users,
  ShoppingBag,
  CreditCard,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Zap,
  Receipt,
  PiggyBank,
  Sparkles,
  X,
  Plus,
  Pencil,
  ArrowRight,
  Shield,
  Wallet,
  Landmark,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardScreenProps {
  netWorth: number;
  checkingBalance: number;
  savingsBalance: number;
  emergencyBalance: number;
  totalIncome: number;
  totalExpenses: number;
  peaceScore: number;
  goals: any[];
  user: any;
  setActiveTab: (tab: any) => void;
  onSendMoney: () => void;
  onRequestMoney: () => void;
  onEditBank: () => void;
  onAddGoal: () => void;
  onStartTour?: () => void;
  cardList: any[];
  // New financial metrics
  totalIncomeAdded: number;
  totalBudgetAllocated: number;
  totalGrocerySpent: number;
  totalBillsPaid: number;
  totalLoanPayments: number;
  totalCreditCardPayments: number;
  totalSavingsAdded: number;
  totalEmergencyFundAdded: number;
}

const spendingData = [
  { name: '21', value: 5 },
  { name: '22', value: 12 },
  { name: '23', value: 8 },
  { name: '24', value: 15 },
  { name: '25', value: 10 },
];

const COLORS = {
  clarityPurple: '#9B59B6',
  calmBlue: '#3498D8',
  growthTeal: '#1ABC9C',
  progressGreen: '#2ECC71',
  deepNavy: '#2D3047',
  softLavender: '#F7F4FB',
  mistPurple: '#E8E0F0',
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  netWorth,
  checkingBalance,
  savingsBalance,
  emergencyBalance,
  totalIncome,
  totalExpenses,
  peaceScore,
  goals,
  user,
  setActiveTab,
  onSendMoney,
  onRequestMoney,
  onEditBank,
  onAddGoal,
  onStartTour,
  cardList,
  totalIncomeAdded,
  totalBudgetAllocated,
  totalGrocerySpent,
  totalBillsPaid,
  totalLoanPayments,
  totalCreditCardPayments,
  totalSavingsAdded,
  totalEmergencyFundAdded
}) => {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const [selectedChartMonth, setSelectedChartMonth] = useState('February');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Calculate Remaining Available Balance
  // Formula: Bank Account Total - (Total Budget Allocated - Total Spent From Budget)
  // Total Spent From Budget = sum of all spending categories
  const totalSpentFromBudget = totalGrocerySpent + totalBillsPaid + totalLoanPayments + totalCreditCardPayments + totalSavingsAdded + totalEmergencyFundAdded;
  const remainingBudget = Math.max(0, totalBudgetAllocated - totalSpentFromBudget);
  const remainingAvailableBalance = checkingBalance - remainingBudget;

  const budgetProgress = totalBudgetAllocated > 0 ? (totalSpentFromBudget / totalBudgetAllocated) * 100 : 0;
  
  const gaugeData = [
    { name: 'Spent', value: budgetProgress },
    { name: 'Remaining', value: 100 - budgetProgress },
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
      setShowSuccessToast('Report downloaded successfully!');
      setTimeout(() => setShowSuccessToast(null), 3000);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Pay Bill') setActiveTab('bills');
    else if (action === 'Add Goal') onAddGoal();
    else if (action === 'Send Money') onSendMoney();
    else if (action === 'Request') onRequestMoney();
    else if (action === 'Grocery Tracker') setActiveTab('grocery');
    else {
      setShowSuccessToast(`${action} feature coming soon!`);
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 relative">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-progress-green text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3"
          >
            <Zap size={18} />
            {showSuccessToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-clarity-purple rounded-xl flex items-center justify-center text-white shadow-lg shadow-clarity-purple/20">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-2xl font-bold text-deep-navy">Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          <button 
            onClick={onStartTour}
            className="flex items-center gap-2 bg-clarity-purple/10 text-clarity-purple px-4 py-2.5 rounded-xl font-bold hover:bg-clarity-purple hover:text-white transition-all group"
          >
            <Sparkles size={18} className="group-hover:animate-pulse" />
            <span className="text-sm">Start Guided Tour</span>
          </button>
          
          <div className="relative flex-1 sm:flex-none">
            <button 
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 bg-white px-3 lg:px-4 py-2 rounded-xl border border-mist-purple text-xs lg:text-sm font-semibold text-gray-500 hover:border-clarity-purple transition-all"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="hidden sm:inline">{selectedMonth}</span>
                <span className="sm:hidden">Month</span>
              </div>
              <ChevronRight size={16} className={`transition-transform ${isMonthDropdownOpen ? 'rotate-270' : 'rotate-90'}`} />
            </button>
            
            <AnimatePresence>
              {isMonthDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-mist-purple shadow-xl z-20 overflow-hidden"
                >
                  {['This Month', 'Last Month', 'Last 3 Months', 'This Year'].map((month) => (
                    <button 
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setIsMonthDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-clarity-purple transition-colors"
                    >
                      {month}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-progress-green text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-progress-green/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download Report'}</span>
            <span className="sm:hidden">{isDownloading ? '...' : 'Report'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Account Total - Full Width */}
        <div className="col-span-full bg-calm-blue p-6 sm:p-8 rounded-[32px] border border-calm-blue shadow-xl shadow-calm-blue/20 relative overflow-hidden">
          {/* Faded Background Icon */}
          <div className="absolute -right-8 -bottom-8 text-white/10 transform -rotate-12 pointer-events-none">
            <Landmark size={240} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Bank Account Total</p>
                <h3 className="text-4xl sm:text-5xl font-bold text-white mt-1">${(checkingBalance + savingsBalance).toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Checking</p>
                <p className="text-sm font-bold text-white">${checkingBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Savings</p>
                <p className="text-sm font-bold text-white">${savingsBalance.toLocaleString()}</p>
              </div>
              <button 
                onClick={onEditBank}
                className="p-3 bg-white text-calm-blue rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Pencil size={18} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Total Income Added */}
        <div className="bg-white p-4 sm:p-6 rounded-[24px] border border-mist-purple shadow-sm flex items-center gap-4 relative overflow-hidden group">
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -bottom-4 text-progress-green/5 transform -rotate-12 pointer-events-none">
            <Wallet size={120} />
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-progress-green/10 text-progress-green rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
            <ArrowUpRight size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Income Added</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-deep-navy">${totalIncomeAdded.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-progress-green">Paychecks Received</span>
            </div>
          </div>
        </div>

        {/* Remaining Available */}
        <div className="bg-white p-4 sm:p-6 rounded-[24px] border border-mist-purple shadow-sm flex items-center gap-4 relative overflow-hidden group">
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -bottom-4 text-clarity-purple/5 transform -rotate-12 pointer-events-none">
            <AlertCircle size={120} />
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-clarity-purple/10 text-clarity-purple rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
            <Shield size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remaining Available</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-deep-navy">${remainingAvailableBalance.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-clarity-purple">After Budget</span>
            </div>
          </div>
        </div>

        {/* Debt Overview Card */}
        <div className="bg-clarity-purple p-4 sm:p-6 rounded-[24px] border border-clarity-purple shadow-lg shadow-clarity-purple/20 flex items-center gap-4 relative overflow-hidden group">
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12 pointer-events-none">
            <CreditCard size={120} />
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
            <CreditCard size={20} />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Debt Overview</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-white">
                ${cardList.reduce((sum, card) => {
                  const totalPaid = (card.payment1Amount || 0) + (card.payment2Amount || 0);
                  return sum + ((card.balanceValue || 0) - totalPaid);
                }, 0).toLocaleString()}
              </span>
              <div className="text-right">
                <p className="text-[9px] font-bold text-white/50 uppercase">Avg APR</p>
                <p className="text-xs font-bold text-white">
                  {cardList.length > 0 
                    ? (cardList.reduce((sum, card) => sum + card.apr, 0) / cardList.length).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Budget Allocated', value: totalBudgetAllocated, icon: <PieChartIcon size={16} />, color: 'text-clarity-purple' },
          { label: 'Grocery Spent', value: totalGrocerySpent, icon: <ShoppingBag size={16} />, color: 'text-growth-teal', id: 'grocery' },
          { label: 'Bills Paid', value: totalBillsPaid, icon: <Receipt size={16} />, color: 'text-calm-blue' },
          { label: 'Loan Payments', value: totalLoanPayments, icon: <Landmark size={16} />, color: 'text-red-500' },
          { label: 'Card Payments', value: totalCreditCardPayments, icon: <CreditCard size={16} />, color: 'text-orange-500' },
          { label: 'Savings Added', value: totalSavingsAdded, icon: <PiggyBank size={16} />, color: 'text-pink-500' },
          { label: 'Emergency Added', value: totalEmergencyFundAdded, icon: <Shield size={16} />, color: 'text-blue-600' },
          { label: 'Total Spent', value: totalSpentFromBudget, icon: <TrendingDown size={16} />, color: 'text-gray-600' },
        ].map((metric, idx) => (
          <div 
            key={idx} 
            onClick={() => metric.id === 'grocery' && setActiveTab('grocery')}
            className={`bg-white p-4 rounded-2xl border border-mist-purple shadow-sm space-y-2 ${metric.id === 'grocery' ? 'cursor-pointer hover:border-clarity-purple/30 hover:bg-gray-50 transition-all group' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                {metric.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{metric.label}</span>
              </div>
              {metric.id === 'grocery' && (
                <ArrowRight size={12} className="text-clarity-purple opacity-0 group-hover:opacity-100 transition-all" />
              )}
            </div>
            <p className={`text-lg font-bold ${metric.color}`}>${metric.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Send Money', icon: <ArrowUpRight size={18} />, color: 'bg-clarity-purple' },
          { label: 'Pay Bill', icon: <Receipt size={18} />, color: 'bg-calm-blue' },
          { label: 'Grocery Tracker', icon: <ShoppingBag size={18} />, color: 'bg-orange-500' },
          { label: 'Add Goal', icon: <PiggyBank size={18} />, color: 'bg-growth-teal' },
          { label: 'Request', icon: <ArrowDownRight size={18} />, color: 'bg-progress-green' },
        ].map((action, idx) => (
          <button 
            key={idx} 
            onClick={() => handleQuickAction(action.label)}
            className="flex-1 min-w-[140px] flex items-center gap-3 bg-white p-3 sm:p-4 lg:px-6 lg:py-3.5 rounded-2xl border border-mist-purple shadow-sm hover:border-clarity-purple/30 hover:bg-gray-50 transition-all group"
          >
            <div className={`w-8 h-8 ${action.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform flex-shrink-0`}>
              {action.icon}
            </div>
            <span className="text-sm font-bold text-deep-navy">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Spending & Chart */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <div className="bg-white p-4 sm:p-8 rounded-[32px] border border-mist-purple shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base lg:text-lg font-bold text-deep-navy">Spending Over Time</h3>
                <p className="text-xs text-gray-400">Daily transaction volume</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                  className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Calendar size={14} />
                  <span>{selectedChartMonth}</span>
                  <ChevronRight size={14} className={`transition-transform ${isChartDropdownOpen ? 'rotate-270' : 'rotate-90'}`} />
                </button>
                
                <AnimatePresence>
                  {isChartDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl border border-mist-purple shadow-xl z-20 overflow-hidden"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <button 
                          key={m}
                          onClick={() => {
                            setSelectedChartMonth(m);
                            setIsChartDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-clarity-purple transition-colors"
                        >
                          {m}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.clarityPurple} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={COLORS.clarityPurple} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#999', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#999', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={COLORS.clarityPurple} 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: COLORS.clarityPurple, strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-8 pt-4">
              {['21', '22', '23', '24', '25'].map((day) => (
                <div key={day} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${day === '21' ? 'bg-clarity-purple text-white shadow-lg shadow-clarity-purple/30' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Payoff Strategy & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payoff Strategy */}
            <div className="bg-white p-6 rounded-[32px] border border-mist-purple shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-deep-navy">Payoff Strategy</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-2xl border border-mist-purple/50">
                  <p className="text-xs font-bold text-deep-navy mb-1">Avalanche Method</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">Pay off cards with the highest APR first to save the most on interest over time.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-mist-purple/50">
                  <p className="text-xs font-bold text-deep-navy mb-1">Snowball Method</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">Pay off the smallest balances first for quick psychological wins and momentum.</p>
                </div>
              </div>
            </div>

            {/* Credit Card Alerts */}
            <div className="bg-white p-6 rounded-[32px] border border-mist-purple shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                  <Bell size={20} />
                </div>
                <h3 className="text-lg font-bold text-deep-navy">Card Alerts</h3>
              </div>
              <div className="space-y-3">
                {cardList.filter(c => c.apr > 20).length > 0 ? (
                  cardList.filter(c => c.apr > 20).map((card, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50/50 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-500" />
                        <span className="text-xs font-bold text-deep-navy">{card.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{card.apr}% APR</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle2 size={24} className="text-progress-green mb-2" />
                    <p className="text-xs font-bold text-deep-navy">No High APR Alerts</p>
                    <p className="text-[10px] text-gray-400">All cards are below 20% APR.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Promo & Gauge */}
        <div className="space-y-6 lg:space-y-8">
          {/* Promo Card */}
          <div className="bg-gradient-to-br from-clarity-purple to-calm-blue p-5 sm:p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-clarity-purple/20">
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg lg:text-xl font-bold leading-tight">AI Budget Buddy</h3>
              <p className="text-white/80 text-xs lg:text-sm">Get expert advice on your financial habits and budget clarity.</p>
              <button 
                onClick={() => setActiveTab('therapist')}
                className="bg-progress-green text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Sparkles size={16} />
                Get Clarity
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <PieChartIcon size={120} />
            </div>
          </div>

          {/* Gauge Card */}
          <div className="bg-white p-5 sm:p-8 rounded-[32px] border border-mist-purple shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base lg:text-lg font-bold text-deep-navy">Peace Score</h3>
              <div className="p-2 bg-clarity-purple/10 text-clarity-purple rounded-xl">
                <Shield size={18} />
              </div>
            </div>
            <div className="h-[200px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Peace', value: peaceScore },
                      { name: 'Remaining', value: 100 - peaceScore },
                    ]}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill={COLORS.clarityPurple} />
                    <Cell fill="#F0F0F0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-[20%] text-center">
                <p className="text-3xl font-bold text-deep-navy">{peaceScore}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial Peace</p>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 font-medium px-4">
              Your Peace Score measures your financial runway. Aim for 100 (6 months of expenses).
            </p>
          </div>

          {/* Budget Progress Card */}
          <div className="bg-white p-5 sm:p-8 rounded-[32px] border border-mist-purple shadow-sm space-y-6">
            <h3 className="text-base lg:text-lg font-bold text-deep-navy">Budget Progress</h3>
            <div className="h-[200px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill={COLORS.progressGreen} />
                    <Cell fill="#F0F0F0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-[20%] text-center">
                <p className="text-3xl font-bold text-deep-navy">{Math.round(budgetProgress)}%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-mist-purple/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-progress-green" />
                <span className="text-xs font-bold text-gray-500">Budget: ${totalBudgetAllocated.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-clarity-purple" />
                <span className="text-xs font-bold text-gray-500">Spent: ${totalSpentFromBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

