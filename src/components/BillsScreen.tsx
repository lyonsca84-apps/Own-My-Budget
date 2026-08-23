import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Shield, 
  Tv, 
  Zap, 
  Home, 
  Globe, 
  Music, 
  ShieldCheck,
  Smartphone,
  CreditCard,
  Pencil,
  X,
  Trash2,
  Calendar,
  CreditCard as CardIcon,
  Car,
  ShoppingCart,
  ShoppingBag,
  ChevronLeft
} from 'lucide-react';
import { AutoMaintenanceScreen } from './AutoMaintenanceScreen';

import { 
  Bill, 
  Subscription, 
  Warranty,
  MiscItem
} from '../types';

type BillStatus = 'paid' | 'due' | 'overdue';

export const initialBills: Bill[] = [
  { id: '1', name: 'Netflix', dueDate: 'Mar 12, 2026', amount: '$15.99', status: 'paid', iconName: 'Smartphone' },
  { id: '2', name: 'Electric Bill', dueDate: 'Mar 15, 2026', amount: '$85.40', status: 'due', iconName: 'Zap' },
  { id: '3', name: 'Rent', dueDate: 'Mar 01, 2026', amount: '$1,200.00', status: 'paid', iconName: 'Home' },
  { id: '4', name: 'Internet', dueDate: 'Mar 20, 2026', amount: '$60.00', status: 'due', iconName: 'Globe' },
  { id: '5', name: 'Spotify', dueDate: 'Mar 05, 2026', amount: '$9.99', status: 'paid', iconName: 'Music' },
  { id: '6', name: 'Car Insurance', dueDate: 'Feb 28, 2026', amount: '$120.00', status: 'overdue', iconName: 'ShieldCheck' },
  { id: '7', name: 'Home Depot', dueDate: 'Mar 22, 2026', amount: '$245.00', status: 'due', iconName: 'ShoppingCart' },
];

export const initialSubscriptions: Subscription[] = [
  { id: '1', name: 'Disney+', cost: '$13.99', icon: 'D+', startDate: '2025-01-01', expiryDate: '2026-01-01' },
  { id: '2', name: 'iCloud', cost: '$2.99', icon: '☁️', startDate: '2025-02-15', expiryDate: '2026-02-15' },
  { id: '3', name: 'Adobe', cost: '$52.99', icon: 'A', startDate: '2025-03-10', expiryDate: '2026-03-10' },
  { id: '4', name: 'Gym', cost: '$45.00', icon: '💪', startDate: '2025-01-20', expiryDate: '2026-01-20' },
];

export const initialWarranties: Warranty[] = [
  { id: '1', name: 'TV', expiryDate: '2027-12-31', startDate: '2024-12-31', iconName: 'Tv' },
  { id: '2', name: 'Refrigerator', expiryDate: '2026-06-15', startDate: '2023-06-15', iconName: 'ShoppingCart' },
];

export const initialMiscItems: MiscItem[] = [
  { id: '1', name: 'Grocery Run', amount: 145.20, date: '2026-03-10', store: 'Whole Foods', notes: 'Weekly groceries', isPaid: true },
  { id: '2', name: 'Department Store', amount: 89.99, date: '2026-03-15', store: 'Target', notes: 'Household items', isPaid: false },
];

export const BillsScreen: React.FC<{
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  subs: Subscription[];
  setSubs: React.Dispatch<React.SetStateAction<Subscription[]>>;
  warranties: Warranty[];
  setWarranties: React.Dispatch<React.SetStateAction<Warranty[]>>;
  miscItems: MiscItem[];
  setMiscItems: React.Dispatch<React.SetStateAction<MiscItem[]>>;
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  setActiveTab?: (tab: string) => void;
  user?: User | null;
}> = ({ bills, setBills, subs, setSubs, warranties, setWarranties, miscItems, setMiscItems, onTransaction, setActiveTab }) => {
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Upcoming'>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isMiscModalOpen, setIsMiscModalOpen] = useState(false);
  
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [editingMisc, setEditingMisc] = useState<MiscItem | null>(null);
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    name: '',
    dueDate: '',
    amount: '',
    status: 'due'
  });
  const [newMisc, setNewMisc] = useState<Partial<MiscItem>>({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    store: '',
    notes: '',
    isPaid: false
  });

  const parseCurrency = (val: string) => parseFloat(val.replace(/[$,]/g, '')) || 0;
  
  const totalBudget = bills.reduce((sum, bill) => sum + parseCurrency(bill.amount), 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + parseCurrency(bill.amount), 0);
  const totalRemaining = totalBudget - totalPaid;

  const filteredBills = bills.filter(bill => {
    if (filter === 'All') return true;
    if (filter === 'Paid') return bill.status === 'paid';
    if (filter === 'Upcoming') return bill.status === 'due' || bill.status === 'overdue';
    return true;
  });

  const handleEditBill = (bill: Bill) => {
    setEditingBill({ ...bill });
    setIsEditModalOpen(true);
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveBill = () => {
    if (editingBill) {
      const originalBill = bills.find(b => b.id === editingBill.id);
      if (editingBill.status === 'paid') {
        if (originalBill && originalBill.status !== 'paid') {
          onTransaction?.(parseCurrency(editingBill.amount), 'expense', 'Checking', 'bill');
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#9B59B6', '#3498D8', '#1ABC9C', '#2ECC71']
          });
        }
      } else if (editingBill.status !== 'paid') {
        if (originalBill && originalBill.status === 'paid') {
          onTransaction?.(parseCurrency(editingBill.amount), 'income', 'Checking', 'bill');
        }
      }
      setBills(prev => prev.map(b => b.id === editingBill.id ? editingBill : b));
      setIsEditModalOpen(false);
      setEditingBill(null);
    }
  };

  const handleAddBill = () => {
    setIsAddBillModalOpen(true);
  };

  const handleSaveNewBill = () => {
    if (newBill.name && newBill.amount && newBill.dueDate) {
      const billToAdd: Bill = {
        id: Math.random().toString(36).substr(2, 9),
        name: newBill.name,
        dueDate: newBill.dueDate,
        amount: newBill.amount,
        status: (newBill.status as BillStatus) || 'due',
        iconName: 'Zap'
      };
      
      if (billToAdd.status === 'paid') {
        onTransaction?.(parseCurrency(billToAdd.amount), 'expense', 'Checking', 'bill');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9B59B6', '#3498D8', '#1ABC9C', '#2ECC71']
        });
      }
      
      setBills([...bills, billToAdd]);
      setIsAddBillModalOpen(false);
      setNewBill({ name: '', dueDate: '', amount: '', status: 'due' });
    }
  };

  const handleAddAutoMaintenanceToBudget = (total: number, repairs: any[]) => {
    const newBillItem: Bill = {
      id: `auto-${Date.now()}`,
      name: `Car Repair: ${repairs[0].name}${repairs.length > 1 ? ` + ${repairs.length - 1} more` : ''}`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: `$${total.toLocaleString()}`,
      status: 'due',
      iconName: 'Car'
    };
    setBills(prev => [...prev, newBillItem]);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#9B59B6', '#3498D8', '#1ABC9C', '#2ECC71']
    });
  };

  const handleAddSub = () => {
    const newSub: Subscription = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Sub',
      cost: '$0.00',
      icon: '?',
      startDate: '',
      expiryDate: ''
    };
    setSubs([...subs, newSub]);
  };

  const handleDeleteSub = (id: string) => {
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  const handleEditSub = (sub: Subscription) => {
    setEditingSub({ ...sub });
    setIsSubModalOpen(true);
  };

  const handleSaveSub = () => {
    if (editingSub) {
      setSubs(prev => prev.map(s => s.id === editingSub.id ? editingSub : s));
      setIsSubModalOpen(false);
      setEditingSub(null);
    }
  };

  const handleAddWarranty = () => {
    const newWarranty: Warranty = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Warranty',
      expiryDate: '',
      startDate: '',
      iconName: 'Shield'
    };
    setWarranties([...warranties, newWarranty]);
  };

  const handleDeleteWarranty = (id: string) => {
    setWarranties(prev => prev.filter(w => w.id !== id));
  };

  const handleEditWarranty = (warranty: Warranty) => {
    setEditingWarranty({ ...warranty });
    setIsWarrantyModalOpen(true);
  };

  const handleSaveWarranty = () => {
    if (editingWarranty) {
      setWarranties(prev => prev.map(w => w.id === editingWarranty.id ? editingWarranty : w));
      setIsWarrantyModalOpen(false);
      setEditingWarranty(null);
    }
  };

  const handleAddMisc = () => {
    setEditingMisc(null);
    setNewMisc({
      name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      store: '',
      notes: '',
      isPaid: false
    });
    setIsMiscModalOpen(true);
  };

  const handleEditMisc = (item: MiscItem) => {
    setEditingMisc({ ...item });
    setIsMiscModalOpen(true);
  };

  const handleDeleteMisc = (id: string) => {
    setMiscItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveMisc = () => {
    if (editingMisc) {
      // Logic for editing existing item
      if (editingMisc.isPaid) {
        const original = miscItems.find(i => i.id === editingMisc.id);
        if (original && !original.isPaid) {
          onTransaction?.(editingMisc.amount, 'expense', 'Checking', 'misc');
        }
      } else {
        const original = miscItems.find(i => i.id === editingMisc.id);
        if (original && original.isPaid) {
          onTransaction?.(editingMisc.amount, 'income', 'Checking', 'misc');
        }
      }
      setMiscItems(prev => prev.map(item => item.id === editingMisc.id ? editingMisc : item));
    } else if (newMisc.name && newMisc.amount) {
      // Logic for adding new item
      const itemToAdd: MiscItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newMisc.name || '',
        amount: newMisc.amount || 0,
        date: newMisc.date || new Date().toISOString().split('T')[0],
        store: newMisc.store || '',
        notes: newMisc.notes || '',
        isPaid: newMisc.isPaid || false
      };
      
      if (itemToAdd.isPaid) {
        onTransaction?.(itemToAdd.amount, 'expense', 'Checking', 'misc');
      }
      
      setMiscItems(prev => [...prev, itemToAdd]);
    }
    setIsMiscModalOpen(false);
    setEditingMisc(null);
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case 'paid': return 'border-l-[#2ECC71]';
      case 'due': return 'border-l-[#F39C12]';
      case 'overdue': return 'border-l-[#E74C3C]';
    }
  };

  const getIcon = (iconName: string | undefined, colorClass?: string) => {
    const size = 20;
    switch (iconName) {
      case 'Smartphone': return <Smartphone className={colorClass || "text-red-500"} size={size} />;
      case 'Zap': return <Zap className={colorClass || "text-yellow-500"} size={size} />;
      case 'Home': return <Home className={colorClass || "text-blue-500"} size={size} />;
      case 'Globe': return <Globe className={colorClass || "text-indigo-500"} size={size} />;
      case 'Music': return <Music className={colorClass || "text-green-500"} size={size} />;
      case 'ShieldCheck': return <ShieldCheck className={colorClass || "text-purple-500"} size={size} />;
      case 'ShoppingCart': return <ShoppingCart className={colorClass || "text-orange-500"} size={size} />;
      case 'Tv': return <Tv className={colorClass} size={size} />;
      default: return <Zap className="text-gray-400" size={size} />;
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
            <h2 className="text-3xl font-bold text-deep-navy tracking-tight">Bills & Subscriptions</h2>
            <p className="text-gray-500 mt-1">Manage your recurring payments and upcoming dues.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddBill}
            className="bg-clarity-purple text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-clarity-purple p-4 sm:p-6 rounded-3xl border border-clarity-purple shadow-lg shadow-clarity-purple/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 text-white rounded-xl">
                  <Calendar size={20} />
                </div>
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Budget</span>
              </div>
              <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-white/70 mt-1">Total monthly obligations</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-mist-purple shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-progress-green/10 text-progress-green rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid</span>
              </div>
              <p className="text-2xl font-bold text-progress-green">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-1">Successfully processed</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-mist-purple shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remaining</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">${totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-1">Upcoming payments</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex p-1 bg-gray-100 rounded-2xl border border-mist-purple/50 w-full max-w-xs">
              {['All', 'Paid', 'Upcoming'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    filter === tab 
                      ? 'bg-white text-clarity-purple shadow-sm' 
                      : 'text-gray-500 hover:text-deep-navy'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Bills List */}
          <div className="bg-white rounded-3xl border border-mist-purple overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-mist-purple flex justify-between items-center bg-gray-50/30">
              <h3 className="text-sm font-bold text-deep-navy uppercase tracking-widest">Upcoming Bills</h3>
              <button 
                onClick={handleAddBill}
                className="flex items-center gap-2 text-xs font-bold text-clarity-purple hover:text-deep-navy transition-colors"
              >
                <Plus size={16} />
                <span>Add Bill</span>
              </button>
            </div>
            <div className="divide-y divide-mist-purple/30">
              {filteredBills.map((bill) => (
                <motion.div
                  layout
                  key={bill.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 sm:p-6 hover:bg-gray-50 transition-colors border-l-4 ${getStatusColor(bill.status)} flex items-center gap-3 sm:gap-4`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-mist-purple/50">
                    {getIcon(bill.iconName)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-deep-navy">{bill.name}</p>
                    <p className="text-xs text-gray-400">Due {bill.dueDate}</p>
                    {bill.secondPaymentDate && (
                      <p className="text-[10px] text-clarity-purple font-bold uppercase tracking-widest mt-1">
                        2nd Payment: {bill.secondPaymentDate} ({bill.secondPaymentAmount})
                      </p>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="font-bold text-deep-navy">{bill.amount}</p>
                      {bill.status === 'overdue' && (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Overdue</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditBill(bill)}
                        className="p-2 hover:bg-soft-lavender rounded-xl text-gray-400 hover:text-clarity-purple transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteBill(bill.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Miscellaneous Section */}
          <section className="bg-white rounded-3xl border border-mist-purple overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-mist-purple flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-deep-navy uppercase tracking-widest">Miscellaneous Items</h3>
                  <p className="text-[10px] text-gray-400 font-bold">Shopping, groceries, and uncategorized expenses</p>
                </div>
              </div>
              <button 
                onClick={handleAddMisc}
                className="flex items-center gap-2 text-xs font-bold text-clarity-purple hover:text-deep-navy transition-colors"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>
            <div className="divide-y divide-mist-purple/30">
              {miscItems.length > 0 ? (
                miscItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center gap-4 border-l-4 ${item.isPaid ? 'border-l-progress-green' : 'border-l-orange-400'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-mist-purple/50">
                      <ShoppingBag size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-deep-navy">{item.name}</p>
                        {item.store && (
                          <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-md uppercase tracking-widest">
                            {item.store}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{item.date}</p>
                      {item.notes && <p className="text-[10px] text-gray-500 mt-1 italic">{item.notes}</p>}
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="font-bold text-deep-navy">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${item.isPaid ? 'text-progress-green' : 'text-orange-500'}`}>
                          {item.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditMisc(item)}
                          className="p-2 hover:bg-soft-lavender rounded-xl text-gray-400 hover:text-clarity-purple transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMisc(item.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-mist-purple">
                    <Plus size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">No miscellaneous items yet</p>
                  <button 
                    onClick={handleAddMisc}
                    className="mt-4 text-xs font-bold text-clarity-purple hover:underline"
                  >
                    Add your first item
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Auto Maintenance Section */}
          <section className="bg-white rounded-3xl border border-mist-purple overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-mist-purple bg-gray-50/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-clarity-purple/10 flex items-center justify-center text-clarity-purple shadow-sm">
                <Car size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-deep-navy">Auto Maintenance Estimator</h3>
                <p className="text-xs text-gray-500">Plan and track your vehicle repair expenses</p>
              </div>
            </div>
            <div className="p-8">
              <AutoMaintenanceScreen onAddToBudget={handleAddAutoMaintenanceToBudget} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Subscriptions Section */}
          <section className="bg-white p-4 sm:p-8 rounded-3xl border border-mist-purple shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-deep-navy">Subscriptions</h3>
              <button 
                onClick={handleAddSub}
                className="p-2 bg-soft-lavender text-clarity-purple rounded-xl hover:bg-clarity-purple hover:text-white transition-all shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {subs.map((sub) => (
                <div key={sub.id} className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-mist-purple/50 group hover:border-clarity-purple/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-clarity-purple font-bold text-xs shadow-sm border border-mist-purple/30">
                        {sub.icon}
                      </div>
                      <span className="text-sm font-bold text-deep-navy">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-600">{sub.cost}</span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEditSub(sub)}
                          className="p-1.5 text-gray-400 hover:text-clarity-purple"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSub(sub.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {sub.expiryDate && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <Calendar size={12} />
                      <span>Expires: {sub.expiryDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Warranty Tracker */}
          <section className="bg-white p-4 sm:p-8 rounded-3xl border border-mist-purple shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-growth-teal/10 rounded-xl text-growth-teal">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-bold text-deep-navy">Warranty Tracker</h3>
              </div>
              <button 
                onClick={handleAddWarranty}
                className="p-2 bg-soft-lavender text-clarity-purple rounded-xl hover:bg-clarity-purple hover:text-white transition-all shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {warranties.map((warranty) => (
                <div key={warranty.id} className="p-4 bg-gray-50 rounded-2xl border border-mist-purple/50 flex flex-col group hover:border-growth-teal/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-growth-teal/10 rounded-xl text-growth-teal border border-growth-teal/10">
                        {getIcon(warranty.iconName, "text-growth-teal")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-deep-navy">{warranty.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Expires {warranty.expiryDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEditWarranty(warranty)}
                        className="p-1.5 text-gray-400 hover:text-clarity-purple"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteWarranty(warranty.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Add Bill Modal */}
      <AnimatePresence>
        {isAddBillModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddBillModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Add New Bill</h3>
                  <button 
                    onClick={() => setIsAddBillModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Bill Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rent"
                      value={newBill.name}
                      onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Due Date</label>
                    <input 
                      type="date" 
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Amount</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $1,200.00"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Status</label>
                    <select 
                      value={newBill.status}
                      onChange={(e) => setNewBill({ ...newBill, status: e.target.value as BillStatus })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    >
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsAddBillModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveNewBill}
                    className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                  >
                    Add Bill
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingBill && (
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
              <div className="p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Edit Bill</h3>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Bill Name</label>
                    <input 
                      type="text" 
                      value={editingBill.name}
                      onChange={(e) => setEditingBill({ ...editingBill, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Due Date</label>
                    <input 
                      type="date" 
                      value={editingBill.dueDate}
                      onChange={(e) => setEditingBill({ ...editingBill, dueDate: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Amount</label>
                    <input 
                      type="text" 
                      value={editingBill.amount}
                      onChange={(e) => setEditingBill({ ...editingBill, amount: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Status</label>
                    <select 
                      value={editingBill.status}
                      onChange={(e) => setEditingBill({ ...editingBill, status: e.target.value as BillStatus })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    >
                      <option value="paid">Paid</option>
                      <option value="due">Due</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-mist-purple/30">
                    <h4 className="text-sm font-bold text-deep-navy mb-4">Second Payment (Optional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">2nd Due Date</label>
                        <input 
                          type="date" 
                          value={editingBill.secondPaymentDate || ''}
                          onChange={(e) => setEditingBill({ ...editingBill, secondPaymentDate: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">2nd Amount</label>
                        <input 
                          type="text" 
                          placeholder="e.g. $40.00"
                          value={editingBill.secondPaymentAmount || ''}
                          onChange={(e) => setEditingBill({ ...editingBill, secondPaymentAmount: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveBill}
                    className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription Edit Modal */}
      <AnimatePresence>
        {isSubModalOpen && editingSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Edit Subscription</h3>
                  <button onClick={() => setIsSubModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Name</label>
                    <input 
                      type="text" 
                      value={editingSub.name}
                      onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Cost</label>
                    <input 
                      type="text" 
                      value={editingSub.cost}
                      onChange={(e) => setEditingSub({ ...editingSub, cost: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Start Date</label>
                      <input 
                        type="date" 
                        value={editingSub.startDate || ''}
                        onChange={(e) => setEditingSub({ ...editingSub, startDate: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Expiry Date</label>
                      <input 
                        type="date" 
                        value={editingSub.expiryDate || ''}
                        onChange={(e) => setEditingSub({ ...editingSub, expiryDate: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => setIsSubModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                  <button onClick={handleSaveSub} className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all">Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warranty Edit Modal */}
      <AnimatePresence>
        {isWarrantyModalOpen && editingWarranty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWarrantyModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">Edit Warranty</h3>
                  <button onClick={() => setIsWarrantyModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Item Name</label>
                    <input 
                      type="text" 
                      value={editingWarranty.name}
                      onChange={(e) => setEditingWarranty({ ...editingWarranty, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Start Date</label>
                      <input 
                        type="date" 
                        value={editingWarranty.startDate || ''}
                        onChange={(e) => setEditingWarranty({ ...editingWarranty, startDate: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Expiry Date</label>
                      <input 
                        type="date" 
                        value={editingWarranty.expiryDate || ''}
                        onChange={(e) => setEditingWarranty({ ...editingWarranty, expiryDate: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => setIsWarrantyModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                  <button onClick={handleSaveWarranty} className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all">Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Miscellaneous Modal */}
      <AnimatePresence>
        {isMiscModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMiscModalOpen(false)}
              className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-deep-navy">
                    {editingMisc ? 'Edit Item' : 'Add Miscellaneous Item'}
                  </h3>
                  <button 
                    onClick={() => setIsMiscModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Item Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Grocery Shopping"
                      value={editingMisc ? editingMisc.name : newMisc.name}
                      onChange={(e) => editingMisc ? setEditingMisc({ ...editingMisc, name: e.target.value }) : setNewMisc({ ...newMisc, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Amount</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={editingMisc ? editingMisc.amount : newMisc.amount}
                        onChange={(e) => editingMisc ? setEditingMisc({ ...editingMisc, amount: parseFloat(e.target.value) }) : setNewMisc({ ...newMisc, amount: parseFloat(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Date</label>
                      <input 
                        type="date" 
                        value={editingMisc ? editingMisc.date : newMisc.date}
                        onChange={(e) => editingMisc ? setEditingMisc({ ...editingMisc, date: e.target.value }) : setNewMisc({ ...newMisc, date: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Store / Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Target, Walmart"
                      value={editingMisc ? editingMisc.store : newMisc.store}
                      onChange={(e) => editingMisc ? setEditingMisc({ ...editingMisc, store: e.target.value }) : setNewMisc({ ...newMisc, store: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Notes</label>
                    <textarea 
                      placeholder="Any additional details..."
                      value={editingMisc ? editingMisc.notes : newMisc.notes}
                      onChange={(e) => editingMisc ? setEditingMisc({ ...editingMisc, notes: e.target.value }) : setNewMisc({ ...newMisc, notes: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none h-20 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-mist-purple/50">
                    <button 
                      onClick={() => editingMisc ? setEditingMisc({ ...editingMisc, isPaid: !editingMisc.isPaid }) : setNewMisc({ ...newMisc, isPaid: !newMisc.isPaid })}
                      className={`w-10 h-6 rounded-full transition-all relative ${
                        (editingMisc ? editingMisc.isPaid : newMisc.isPaid) ? 'bg-progress-green' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        (editingMisc ? editingMisc.isPaid : newMisc.isPaid) ? 'left-5' : 'left-1'
                      }`} />
                    </button>
                    <span className="text-sm font-bold text-deep-navy">Mark as Paid</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsMiscModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveMisc}
                    className="flex-1 bg-clarity-purple text-white py-3 rounded-xl font-bold shadow-button hover:bg-opacity-90 transition-all"
                  >
                    {editingMisc ? 'Save Changes' : 'Add Item'}
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
