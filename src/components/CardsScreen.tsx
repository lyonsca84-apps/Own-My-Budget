import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  AlertCircle, 
  Plus, 
  Pencil,
  X,
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Info,
  Calendar,
  DollarSign,
  ChevronLeft,
  TrendingUp,
  CheckCircle2,
  Clock,
  Undo
} from 'lucide-react';
import { CardData } from '../types';

const COLORS = [
  { name: 'Deep Navy', value: 'bg-[#2D3047]' },
  { name: 'Clarity Purple', value: 'bg-[#9B59B6]' },
  { name: 'Calm Blue', value: 'bg-[#3498D8]' },
  { name: 'Growth Teal', value: 'bg-[#1ABC9C]' },
  { name: 'Amex Blue', value: 'bg-[#0071CE]' },
  { name: 'Home Depot Orange', value: 'bg-[#F96302]' },
  { name: 'Whole Foods Green', value: 'bg-[#00674b]' },
  { name: 'Yellow', value: 'bg-[#D4AC0D]' },
  { name: 'Silver Gradient', value: 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800' },
];

const PATTERNS = [
  { name: 'None', value: '' },
  { name: 'Topographic', value: 'pattern-topographic' },
  { name: 'Geometric', value: 'pattern-geometric' },
  { name: 'Abstract', value: 'pattern-abstract' },
  { name: 'Stripes', value: 'pattern-stripes' },
  { name: 'Diamond', value: 'pattern-diamond' },
  { name: 'Dots', value: 'pattern-dots' },
  { name: 'Waves', value: 'pattern-waves' },
  { name: 'Grid', value: 'pattern-grid' },
  { name: 'Zigzag', value: 'pattern-zigzag' },
  { name: 'Carbon', value: 'pattern-carbon' },
];

const getCardBackground = (card: CardData) => {
  if (card.customColor) {
    return `${card.customColor} ${card.customPattern || ''}`;
  }
  
  const nameLower = card.name.toLowerCase();
  
  // Specific Bank Branding Rules
  if (nameLower.includes('chase sapphire')) {
    return 'bg-[#2D3047]'; // Navy Blue
  }
  if (nameLower.includes('whole foods')) {
    return 'bg-[#00674b]'; // Emerald Green
  }
  if (nameLower.includes('orange cash')) {
    return 'bg-[#F96302]'; // Orange
  }
  if (nameLower.includes('platinum business')) {
    return 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800'; // Platinum Silver
  }
  
  // General Brand Rules
  if (nameLower.includes('amex') || nameLower.includes('american express')) {
    return 'bg-[#0071CE]';
  }
  if (nameLower.includes('home depot')) {
    return 'bg-[#F96302]';
  }
  
  return `bg-gradient-to-br from-gray-700 to-gray-900`;
};

interface CardsScreenProps {
  cardList: CardData[];
  setCardList: React.Dispatch<React.SetStateAction<CardData[]>>;
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  setActiveTab?: (tab: string) => void;
  user?: any;
}

const CardEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  card: CardData;
  onSave: (id: string, updates: Partial<CardData>) => void;
  onDelete: (id: string) => void;
  onMakePayment: (card: CardData) => void;
}> = ({ isOpen, onClose, card, onSave, onDelete, onMakePayment }) => {
  const [localCard, setLocalCard] = useState<CardData>({
    ...card,
    name: card.name || '',
    number: card.number || '',
    balance: card.balance || '$0.00',
    balanceValue: card.balanceValue || 0,
    available: card.available || '$0.00',
    availableValue: card.availableValue || 0,
    limit: card.limit || '$0.00',
    limitValue: card.limitValue || 0,
    apr: card.apr || 0,
    minPaymentDue: card.minPaymentDue || 0,
    payment1Amount: card.payment1Amount || 0,
    payment1Date: card.payment1Date || '',
    payment2Amount: card.payment2Amount || 0,
    payment2Date: card.payment2Date || '',
    notes: card.notes || '',
    customColor: card.customColor || COLORS[0].value,
    customPattern: card.customPattern || PATTERNS[0].value
  });

  useEffect(() => {
    setLocalCard({
      ...card,
      name: card.name || '',
      number: card.number || '',
      balance: card.balance || '$0.00',
      balanceValue: card.balanceValue || 0,
      available: card.available || '$0.00',
      availableValue: card.availableValue || 0,
      limit: card.limit || '$0.00',
      limitValue: card.limitValue || 0,
      apr: card.apr || 0,
      minPaymentDue: card.minPaymentDue || 0,
      payment1Amount: card.payment1Amount || 0,
      payment1Date: card.payment1Date || '',
      payment2Amount: card.payment2Amount || 0,
      payment2Date: card.payment2Date || '',
      notes: card.notes || '',
      customColor: card.customColor || COLORS[0].value,
      customPattern: card.customPattern || PATTERNS[0].value
    });
  }, [card]);

  const handleUpdateLocal = (updates: Partial<CardData>) => {
    setLocalCard(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(card.id, localCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="px-8 py-6 border-b border-mist-purple flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getCardBackground(card)}`} />
            <h3 className="text-xl font-bold text-deep-navy">Edit {localCard.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Info & Payments */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Card Name</label>
                  <input 
                    type="text" 
                    value={localCard.name}
                    onChange={(e) => handleUpdateLocal({ name: e.target.value })}
                    className="w-full bg-white border border-mist-purple rounded-xl py-2.5 px-4 text-sm text-deep-navy font-bold focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">APR %</label>
                  <input 
                    type="number" 
                    value={localCard.apr}
                    onChange={(e) => handleUpdateLocal({ apr: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-mist-purple rounded-xl py-2.5 px-4 text-sm text-deep-navy font-bold focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Starting Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                    <input 
                      type="number" 
                      value={localCard.balanceValue ?? ''}
                      onChange={(e) => handleUpdateLocal({ balanceValue: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-mist-purple rounded-xl py-2.5 pl-8 pr-4 text-sm text-deep-navy font-bold focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Min Payment Due</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                    <input 
                      type="number" 
                      value={localCard.minPaymentDue ?? ''}
                      onChange={(e) => handleUpdateLocal({ minPaymentDue: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-mist-purple rounded-xl py-2.5 pl-8 pr-4 text-sm text-deep-navy font-bold focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-deep-navy uppercase tracking-widest flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-clarity-purple" />
                    Payment Tracking
                  </div>
                  <button 
                    type="button"
                    onClick={() => onMakePayment(localCard)}
                    className="flex items-center gap-2 bg-clarity-purple/10 text-clarity-purple px-4 py-2 rounded-xl text-xs font-bold hover:bg-clarity-purple hover:text-white transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Log New Payment</span>
                  </button>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-mist-purple/50">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Payment 1 Amount</label>
                    <input 
                      type="number" 
                      value={localCard.payment1Amount ?? ''}
                      onChange={(e) => handleUpdateLocal({ payment1Amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-mist-purple/30 rounded-xl py-2 px-3 text-sm text-deep-navy font-bold focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Payment 1 Date</label>
                    <input 
                      type="date" 
                      value={localCard.payment1Date || ''}
                      onChange={(e) => handleUpdateLocal({ payment1Date: e.target.value })}
                      className="w-full bg-gray-50 border border-mist-purple/30 rounded-xl py-2 px-3 text-sm text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-mist-purple/50">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Payment 2 Amount (Optional)</label>
                    <input 
                      type="number" 
                      value={localCard.payment2Amount ?? ''}
                      onChange={(e) => handleUpdateLocal({ payment2Amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-mist-purple/30 rounded-xl py-2 px-3 text-sm text-deep-navy font-bold focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Payment 2 Date</label>
                    <input 
                      type="date" 
                      value={localCard.payment2Date || ''}
                      onChange={(e) => handleUpdateLocal({ payment2Date: e.target.value })}
                      className="w-full bg-gray-50 border border-mist-purple/30 rounded-xl py-2 px-3 text-sm text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Education */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                  rows={3}
                  value={localCard.notes || ''}
                  onChange={(e) => handleUpdateLocal({ notes: e.target.value })}
                  placeholder="Add any specific details about this card..."
                  className="w-full bg-white border border-mist-purple rounded-xl py-3 px-4 text-sm text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="bg-clarity-purple/5 p-5 rounded-2xl border border-clarity-purple/10 space-y-3">
                <div className="flex items-center gap-2 text-clarity-purple">
                  <Info size={18} />
                  <h4 className="text-sm font-bold">Educational Tip</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This card payment is part of your monthly spending plan. Tracking what you paid and what remains can help you see your progress clearly.
                </p>
                <ul className="text-[11px] text-gray-500 space-y-1 list-disc ml-4">
                  <li>APR affects how expensive it is to carry a balance</li>
                  <li>Paying more than the minimum can reduce debt faster</li>
                  <li>Tracking balances helps you understand total debt</li>
                </ul>
              </div>

              {/* Customization in Edit Modal */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-deep-navy uppercase tracking-widest">Card Style</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleUpdateLocal({ customColor: color.value })}
                          className={`w-8 h-8 rounded-full ${color.value} border-2 transition-all ${localCard.customColor === color.value ? 'border-clarity-purple scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Pattern</label>
                    <div className="flex flex-wrap gap-2">
                      {PATTERNS.map((pattern) => (
                        <button
                          key={pattern.value}
                          onClick={() => handleUpdateLocal({ customPattern: pattern.value })}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border-2 transition-all ${localCard.customPattern === pattern.value ? 'border-clarity-purple bg-soft-lavender text-clarity-purple' : 'border-mist-purple text-gray-400 hover:border-clarity-purple/30'}`}
                        >
                          {pattern.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-mist-purple flex items-center justify-between bg-gray-50">
          <button 
            onClick={() => { onDelete(card.id); onClose(); }}
            className="flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
          >
            <Trash2 size={18} />
            <span>Delete Card</span>
          </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-clarity-purple text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const CardsScreen: React.FC<CardsScreenProps> = ({ cardList, setCardList, onTransaction, setActiveTab }) => {
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [newCardData, setNewCardData] = useState<Partial<CardData>>({
    name: '',
    number: '•••• 0000',
    balanceValue: 0,
    limitValue: 0,
    apr: 0,
    minPaymentDue: 0,
    gradient: 'from-gray-700 to-gray-900',
    notes: '',
    customColor: COLORS[0].value,
    customPattern: PATTERNS[0].value
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState<{ cardId: string; amount: number; slot: 1 | 2 } | null>(null);

  const months = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 
    'May 2026', 'June 2026', 'July 2026', 'August 2026', 
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const handleMakePayment = (card: CardData) => {
    setSelectedCard(card);
    setPaymentAmount((card.minPaymentDue || 0).toString());
    setIsPaymentModalOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedCard || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount)) return;

    onTransaction?.(amount, 'expense', 'Checking', 'card');
    
    setCardList(prev => prev.map(c => {
      if (c.id === selectedCard.id) {
        let updated;
        let slot: 1 | 2 = 1;
        // Log in next available slot
        if (!c.payment1Amount) {
          updated = { ...c, payment1Amount: amount, payment1Date: new Date().toISOString().split('T')[0] };
          slot = 1;
        } else {
          // If payment1 exists, add to payment2 or just update payment2
          updated = { ...c, payment2Amount: (c.payment2Amount || 0) + amount, payment2Date: new Date().toISOString().split('T')[0] };
          slot = 2;
        }

        setLastPayment({ cardId: selectedCard.id, amount, slot });

        const totalPaid = (updated.payment1Amount || 0) + (updated.payment2Amount || 0);
        if (totalPaid >= (updated.balanceValue || 0)) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#9B59B6', '#8E44AD', '#2ECC71']
          });
        }
        return updated;
      }
      return c;
    }));

    setIsPaymentModalOpen(false);
    setSelectedCard(null);
    setPaymentAmount('');
  };

  const handleUndoPayment = () => {
    if (!lastPayment) return;

    const { cardId, amount, slot } = lastPayment;
    
    // Reverse the transaction
    onTransaction?.(amount, 'income', 'Checking', 'card');

    // Restore the balance/payment slots
    setCardList(prev => prev.map(c => {
      if (c.id === cardId) {
        if (slot === 1) {
          return { ...c, payment1Amount: 0, payment1Date: '' };
        } else {
          return { ...c, payment2Amount: Math.max(0, (c.payment2Amount || 0) - amount) };
        }
      }
      return c;
    }));

    setLastPayment(null);
  };

  const toggleSummaryExpand = (id: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSummaries(newExpanded);
  };

  const handleUpdateCard = (id: string, updates: Partial<CardData>) => {
    setCardList(prev => prev.map(card => {
      if (card.id === id) {
        const updatedCard = { ...card, ...updates };
        // Recalculate available and balance if needed
        // For this specific UI, we treat balanceValue as the "Starting Balance"
        // and calculate "Remaining Balance" based on payments.
        return updatedCard;
      }
      return card;
    }));
  };

  const handleDeleteCard = (id: string) => {
    setCardList(prev => prev.filter(card => card.id !== id));
  };

  const handleSaveNewCard = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const cardToAdd: CardData = {
      id: newId,
      name: newCardData.name || 'New Credit Card',
      number: newCardData.number || '•••• 0000',
      balance: `$${(newCardData.balanceValue || 0).toLocaleString()}`,
      balanceValue: newCardData.balanceValue || 0,
      available: `$${((newCardData.limitValue || 0) - (newCardData.balanceValue || 0)).toLocaleString()}`,
      availableValue: (newCardData.limitValue || 0) - (newCardData.balanceValue || 0),
      limit: `$${(newCardData.limitValue || 0).toLocaleString()}`,
      limitValue: newCardData.limitValue || 0,
      apr: newCardData.apr || 0,
      gradient: newCardData.gradient || 'from-gray-400 to-gray-600',
      spending: [],
      minPaymentDue: newCardData.minPaymentDue || 0,
      payment1Amount: 0,
      payment1Date: '',
      payment2Amount: 0,
      payment2Date: '',
      notes: newCardData.notes || '',
      customColor: newCardData.customColor,
      customPattern: newCardData.customPattern
    };
    setCardList(prev => [...prev, cardToAdd]);
    setIsAddModalOpen(false);
    setNewCardData({
      name: '',
      number: '•••• 0000',
      balanceValue: 0,
      limitValue: 0,
      apr: 0,
      minPaymentDue: 0,
      gradient: 'from-gray-400 to-gray-600',
      notes: '',
      customColor: COLORS[0].value,
      customPattern: PATTERNS[0].value
    });
  };

  const handleAddCard = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (card: CardData) => {
    setSelectedCard(card);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab?.('wallet')}
            className="lg:hidden p-2 bg-white border border-mist-purple rounded-xl text-gray-400 hover:text-clarity-purple transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-deep-navy tracking-tight">Credit Cards</h2>
            <p className="text-gray-500 mt-1">Track payments, balances, and optimize your budget.</p>
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
            onClick={handleAddCard}
            className="hidden md:flex bg-clarity-purple text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus size={20} />
            <span>Add New Card</span>
          </button>
        </div>
      </div>

      {/* Add New Card Button - Mobile Only (Replaced by the one in the header for consistency if needed, but keeping the one below for now) */}
      {/* Actually, let's remove the one below and just use the header one */}

      {/* Alerts & Strategies Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Debt Summary */}
        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-clarity-purple">
            <CreditCard size={20} />
            <h3 className="font-bold text-deep-navy">Debt Overview</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Credit Debt</p>
              <p className="text-3xl font-bold text-deep-navy">
                ${cardList.reduce((sum, card) => {
                  const totalPaid = (card.payment1Amount || 0) + (card.payment2Amount || 0);
                  return sum + ((card.balanceValue || 0) - totalPaid);
                }, 0).toLocaleString()}
              </p>
            </div>
            <div className="pt-4 border-t border-mist-purple/30 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Monthly Min</p>
                <p className="text-sm font-bold text-deep-navy">
                  ${cardList.reduce((sum, card) => sum + (card.minPaymentDue || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Avg APR</p>
                <p className="text-sm font-bold text-deep-navy">
                  {cardList.length > 0 
                    ? (cardList.reduce((sum, card) => sum + card.apr, 0) / cardList.length).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Rate Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <h3 className="font-bold text-deep-navy">Interest Alerts</h3>
          </div>
          <div className="space-y-3 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
            {cardList.filter(c => c.apr > 20).length > 0 ? (
              cardList.filter(c => c.apr > 20).map(card => (
                <div key={`alert-${card.id}`} className="p-3 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-700">{card.name}</p>
                  <p className="text-[10px] text-red-600 mt-1">High APR ({card.apr}%). Prioritize this payoff.</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-growth-teal/5 rounded-2xl border border-growth-teal/10 text-center">
                <p className="text-xs font-bold text-growth-teal">All clear!</p>
                <p className="text-[10px] text-gray-500 mt-1">Healthy interest rates.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payoff Strategy Summary */}
        <div className="bg-white p-6 rounded-3xl border border-mist-purple shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-calm-blue">
            <TrendingUp size={20} />
            <h3 className="font-bold text-deep-navy">Payoff Strategy</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-clarity-purple/5 rounded-2xl border border-clarity-purple/10">
              <h4 className="text-[10px] font-bold text-clarity-purple uppercase tracking-wider mb-1">Avalanche</h4>
              <p className="text-[9px] text-gray-600 leading-relaxed">Pay highest APR first to save interest.</p>
            </div>
            <div className="p-3 bg-calm-blue/5 rounded-2xl border border-calm-blue/10">
              <h4 className="text-[10px] font-bold text-calm-blue uppercase tracking-wider mb-1">Snowball</h4>
              <p className="text-[9px] text-gray-600 leading-relaxed">Pay lowest balance first for momentum.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level 1 & 2: Mobile Carousel */}
      <div className="md:hidden space-y-4">
        <div className="px-4">
          <button 
            type="button"
            onClick={handleAddCard}
            className="w-full bg-clarity-purple text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus size={20} />
            <span>Add New Card</span>
          </button>
        </div>
        <div className="-mx-4 overflow-hidden">
          {cardList.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 px-8 gap-4">
            {cardList.map((card) => {
              const totalPaid = (card.payment1Amount || 0) + (card.payment2Amount || 0);
              const remainingBalance = (card.balanceValue || 0) - totalPaid;
              
              const nameLower = card.name.toLowerCase();
              const isVisa = nameLower.includes('visa');
              const isMastercard = nameLower.includes('mastercard') || nameLower.includes('mc');
              const isAmex = nameLower.includes('amex') || nameLower.includes('american express');

              return (
                <motion.div
                  key={`mobile-carousel-${card.id}`}
                  onClick={() => openEditModal(card)}
                  className={`flex-shrink-0 w-[85vw] max-w-md h-52 rounded-[2rem] p-6 snap-center shadow-xl ${getCardBackground(card)} relative overflow-hidden cursor-pointer active:scale-95 transition-transform`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-full flex flex-col justify-between text-white relative z-10">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold tracking-tight text-white">{card.name}</h3>
                      <div className="flex flex-col items-center gap-2">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(card);
                          }}
                          className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md border border-white/10 hover:bg-white/30 transition-colors cursor-pointer"
                        >
                          <Pencil size={14} className="text-white" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(card.id);
                          }}
                          className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md border border-white/10 hover:bg-red-500/40 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Current Balance</p>
                      <p className="text-2xl font-bold tracking-tighter text-white">
                        ${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-white/70">Paid</p>
                          <p className="text-xs font-bold text-white">${totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-white/70">APR</p>
                          <p className="text-xs font-bold text-white">{card.apr}%</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {isVisa ? (
                          <div className="italic font-black text-xl leading-none opacity-95 tracking-tighter">VISA</div>
                        ) : isMastercard ? (
                          <div className="flex items-center gap-0.5 opacity-95">
                            <div className="w-4 h-4 rounded-full bg-[#EB001B]/80" />
                            <div className="w-4 h-4 rounded-full bg-[#F79E1B]/80 -ml-2.5" />
                          </div>
                        ) : isAmex ? (
                          <div className="bg-[#016FD0] px-1 py-0.5 rounded-sm text-[8px] font-black tracking-tighter border border-white/20">AMEX</div>
                        ) : (
                          <div className="italic font-black text-xl leading-none opacity-90 tracking-tighter">VISA</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-2xl" />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center bg-white rounded-3xl border border-dashed border-mist-purple mx-4">
            <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-deep-navy">No cards yet</h3>
            <p className="text-sm text-gray-400 mt-2">Add your first card to get started</p>
          </div>
        )}
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Left Side: Preview (Dark Background like in the image) */}
              <div className="w-full md:w-1/2 bg-[#121212] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pattern-topographic" />
                
                <div className="relative z-10 w-full max-w-sm">
                  <h4 className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-6 text-center">Card Preview</h4>
                  
                  <motion.div 
                    className={`w-full aspect-[1.58/1] rounded-3xl p-6 shadow-2xl relative overflow-hidden ${newCardData.customColor} ${newCardData.customPattern}`}
                    layoutId="card-preview"
                  >
                    <div className="h-full flex flex-col justify-between text-white relative z-10">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold tracking-tight text-white">{newCardData.name || 'New Card'}</h3>
                        <div className="italic font-black text-xl leading-none opacity-90 tracking-tighter">VISA</div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Current Balance</p>
                        <p className="text-2xl font-bold tracking-tighter text-white">
                          ${(newCardData.balanceValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-white/70">Limit</p>
                            <p className="text-xs font-bold text-white">${(newCardData.limitValue || 0).toLocaleString()}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-white/70">APR</p>
                            <p className="text-xs font-bold text-white">{newCardData.apr || 0}%</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-medium tracking-[0.2em]">{newCardData.number || '•••• 0000'}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Side: Configuration */}
              <div className="w-full md:w-1/2 p-8 space-y-6 bg-white overflow-y-auto max-h-[80vh] md:max-h-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-deep-navy">Customize Card</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Card Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Chase Sapphire"
                      value={newCardData.name}
                      onChange={(e) => setNewCardData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-50 border border-mist-purple rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-clarity-purple/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Balance</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newCardData.balanceValue || ''}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, balanceValue: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-gray-50 border border-mist-purple rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-clarity-purple/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Limit</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newCardData.limitValue || ''}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, limitValue: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-gray-50 border border-mist-purple rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-clarity-purple/20"
                      />
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Choose Color</label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setNewCardData(prev => ({ ...prev, customColor: color.value }))}
                          className={`w-10 h-10 rounded-full ${color.value} border-2 transition-all ${newCardData.customColor === color.value ? 'border-clarity-purple scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pattern Selection */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Choose Pattern</label>
                    <div className="flex flex-wrap gap-2">
                      {PATTERNS.map((pattern) => (
                        <button
                          key={pattern.value}
                          onClick={() => setNewCardData(prev => ({ ...prev, customPattern: pattern.value }))}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${newCardData.customPattern === pattern.value ? 'border-clarity-purple bg-soft-lavender text-clarity-purple' : 'border-mist-purple text-gray-400 hover:border-clarity-purple/30'}`}
                        >
                          {pattern.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleSaveNewCard}
                  className="w-full bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all cursor-pointer mt-4"
                >
                  Create Custom Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedCard && (
          <CardEditModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            card={selectedCard}
            onSave={handleUpdateCard}
            onDelete={handleDeleteCard}
            onMakePayment={handleMakePayment}
          />
        )}
      </AnimatePresence>

      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cardList.map((card) => {
          const totalPaid = (card.payment1Amount || 0) + (card.payment2Amount || 0);
          const remainingBalance = (card.balanceValue || 0) - totalPaid;
          
          // Infer card type for logo
          const nameLower = card.name.toLowerCase();
          const isVisa = nameLower.includes('visa');
          const isMastercard = nameLower.includes('mastercard') || nameLower.includes('mc');
          const isAmex = nameLower.includes('amex') || nameLower.includes('american express');
          
          return (
            <motion.div
              key={`desktop-${card.id}`}
              onClick={() => openEditModal(card)}
              className={`relative h-56 rounded-[2rem] p-7 cursor-pointer overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl ${getCardBackground(card)}`}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card Content */}
              <div className="h-full flex flex-col justify-between text-white relative z-10">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold tracking-tight drop-shadow-sm text-white">{card.name}</h3>
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(card);
                      }}
                      className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-inner hover:bg-white/30 transition-colors"
                      title="Edit Card"
                    >
                      <Pencil size={15} className="text-white" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-inner hover:bg-red-500/40 transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 size={15} className="text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Current Balance</p>
                  <p className="text-3xl font-bold tracking-tighter drop-shadow-md text-white">
                    ${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex gap-8">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/70">Total Paid</p>
                      <p className="text-sm font-bold text-white">${totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/70">APR</p>
                      <p className="text-sm font-bold text-white">{card.apr}%</p>
                    </div>
                  </div>
                  
                  {/* Branded Logo Treatment */}
                  <div className="flex flex-col items-end">
                    {isVisa ? (
                      <div className="italic font-black text-2xl leading-none opacity-95 tracking-tighter flex items-center">
                        VISA<span className="text-[8px] align-top ml-0.5">®</span>
                      </div>
                    ) : isMastercard ? (
                      <div className="flex items-center gap-0.5 opacity-95">
                        <div className="w-5 h-5 rounded-full bg-[#EB001B]/80" />
                        <div className="w-5 h-5 rounded-full bg-[#F79E1B]/80 -ml-3" />
                        <span className="text-[10px] font-black ml-1">mastercard</span>
                      </div>
                    ) : isAmex ? (
                      <div className="bg-[#016FD0] px-1.5 py-0.5 rounded-sm text-[10px] font-black tracking-tighter border border-white/30">
                        AMEX
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="italic font-black text-2xl leading-none opacity-90 tracking-tighter">VISA</div>
                        <div className="text-[7px] font-bold uppercase tracking-widest opacity-60">Platinum</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            </motion.div>
          );
        })}
      </div>


      {/* Summary Section Below */}
      <section className="space-y-6 pt-12 border-t border-mist-purple/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-growth-teal/10 rounded-xl text-growth-teal">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-xl font-bold text-deep-navy">Credit Card Payment Summary</h3>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-mist-purple rounded-xl text-sm font-bold text-deep-navy shadow-sm hover:bg-gray-50 transition-all"
            >
              <Calendar size={16} className="text-clarity-purple" />
              {selectedMonth}
              <ChevronDown size={14} className={`transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMonthDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-mist-purple rounded-2xl shadow-xl z-[50] py-2 max-h-60 overflow-y-auto"
                >
                  {months.map(month => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-soft-lavender transition-colors ${selectedMonth === month ? 'text-clarity-purple bg-soft-lavender/50' : 'text-gray-600'}`}
                    >
                      {month}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3">
          {cardList.map((card) => {
            const isExpanded = expandedSummaries.has(card.id);
            const totalPaid = (card.payment1Amount || 0) + (card.payment2Amount || 0);
            const remainingBalance = (card.balanceValue || 0) - totalPaid;
            const isPaidInFull = remainingBalance <= 0;
            const isPending = totalPaid > 0 && !isPaidInFull;
            const isNoPayment = totalPaid === 0 && !isPaidInFull;
            const progress = Math.min(100, (totalPaid / (card.balanceValue || 1)) * 100);

            return (
              <div 
                key={`summary-${card.id}`} 
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-500 ${
                  isPaidInFull 
                    ? 'border-growth-teal bg-growth-teal/5 shadow-lg shadow-growth-teal/5' 
                    : isPending
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div 
                  onClick={() => toggleSummaryExpand(card.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${getCardBackground(card)}`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-deep-navy">{card.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isPaidInFull ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-growth-teal uppercase tracking-widest">
                            <CheckCircle2 size={10} />
                            Paid in Full
                          </span>
                        ) : isPending ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                            <Clock size={10} />
                            Pending
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock size={10} />
                            No Payment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${progress}%`,
                          opacity: isPaidInFull ? 1 : [0.6, 1, 0.6]
                        }}
                        transition={{
                          width: { duration: 1 },
                          opacity: { 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            display: isPaidInFull ? "none" : "block"
                          }
                        }}
                        className={`h-full rounded-full transition-colors duration-500 ${
                          isPaidInFull ? 'bg-growth-teal' : isPending ? 'bg-amber-400' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakePayment(card);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isPaidInFull 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-clarity-purple text-white shadow-md hover:bg-opacity-90 active:scale-95'
                        }`}
                        disabled={isPaidInFull}
                      >
                        Pay
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid</p>
                      <p className={`text-sm font-black ${isPaidInFull ? 'text-growth-teal' : isPending ? 'text-amber-600' : 'text-gray-400'}`}>
                        ${totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remaining</p>
                      <p className={`text-sm font-black ${isPaidInFull ? 'text-growth-teal' : isPending ? 'text-amber-700' : 'text-gray-600'}`}>
                        ${remainingBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-gray-300">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 border-t border-mist-purple/20 bg-gray-50/30"
                    >
                      <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">APR</p>
                          <p className="text-xs font-bold text-deep-navy">{card.apr}%</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Min Payment</p>
                          <p className="text-xs font-bold text-deep-navy">${(card.minPaymentDue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Statement Balance</p>
                          <p className="text-xs font-bold text-deep-navy">${(card.balanceValue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last Payment</p>
                          <p className="text-xs font-bold text-deep-navy">{card.payment1Date || 'No payments yet'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {cardList.length === 0 && (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-mist-purple">
              <CreditCard size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-medium">No cards added yet. Add a card above to see your summary.</p>
            </div>
          )}
        </div>
      </section>
      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-deep-navy">Log Payment</h3>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <div className="bg-clarity-purple/5 p-4 rounded-2xl border border-clarity-purple/10">
                  <p className="text-xs font-bold text-clarity-purple uppercase tracking-widest mb-1">Paying To</p>
                  <p className="text-lg font-bold text-deep-navy">{selectedCard.name}</p>
                  <p className="text-xs text-gray-500">Current Balance: ${((selectedCard.balanceValue || 0) - ((selectedCard.payment1Amount || 0) + (selectedCard.payment2Amount || 0))).toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-mist-purple rounded-2xl focus:ring-2 focus:ring-clarity-purple outline-none font-bold text-lg"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentAmount(selectedCard.minPaymentDue?.toString() || '0')}
                      className="py-3 bg-white border border-mist-purple rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Min: ${selectedCard.minPaymentDue}
                    </button>
                    <button 
                      onClick={() => setPaymentAmount(((selectedCard.balanceValue || 0) - ((selectedCard.payment1Amount || 0) + (selectedCard.payment2Amount || 0))).toString())}
                      className="py-3 bg-white border border-mist-purple rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Full Balance
                    </button>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={confirmPayment}
                  className="w-full bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  Confirm & Log Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
