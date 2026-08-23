import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Landmark, PiggyBank, Save, AlertCircle, ArrowRightLeft, ArrowRight } from 'lucide-react';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkingBalance: number;
  savingsBalance: number;
  onUpdate: (checking: number, savings: number) => void;
  onTransfer: (amount: number, from: string, to: string) => void;
}

export const BankModal: React.FC<BankModalProps> = ({ 
  isOpen, 
  onClose, 
  checkingBalance, 
  savingsBalance, 
  onUpdate,
  onTransfer
}) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'transfer'>('balances');
  const [checking, setChecking] = useState(checkingBalance.toString());
  const [savings, setSavings] = useState(savingsBalance.toString());
  
  // Transfer state
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFrom, setTransferFrom] = useState('Savings');
  const [transferTo, setTransferTo] = useState('Checking');
  
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const c = parseFloat(checking);
    const s = parseFloat(savings);
    
    if (!isNaN(c) && !isNaN(s)) {
      await onUpdate(c, s);
      onClose();
    }
    setLoading(false);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const amount = parseFloat(transferAmount);
    if (!isNaN(amount) && amount > 0) {
      await onTransfer(amount, transferFrom, transferTo);
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-soft-lavender rounded-xl text-clarity-purple">
                    <Landmark size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-deep-navy">Bank Accounts</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
                <button 
                  onClick={() => setActiveTab('balances')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'balances' ? 'bg-white text-clarity-purple shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Balances
                </button>
                <button 
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'transfer' ? 'bg-white text-clarity-purple shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Transfer
                </button>
              </div>

              {activeTab === 'balances' ? (
                <>
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                    <AlertCircle className="text-blue-500 shrink-0" size={20} />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Since we don't link to real banks, you can manually update your balances here. These numbers will be used for your budget tracking.
                    </p>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                          <Wallet size={14} />
                          Checking Account
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                            type="number" 
                            step="0.01"
                            value={checking}
                            onChange={(e) => setChecking(e.target.value)}
                            className="w-full bg-gray-50 border border-mist-purple/20 rounded-xl py-4 pl-12 pr-4 text-xl font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                          <PiggyBank size={14} />
                          Savings Account
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                            type="number" 
                            step="0.01"
                            value={savings}
                            onChange={(e) => setSavings(e.target.value)}
                            className="w-full bg-gray-50 border border-mist-purple/20 rounded-xl py-4 pl-12 pr-4 text-xl font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={20} />
                      <span>Update Balances</span>
                    </button>
                  </form>
                </>
              ) : (
                <form onSubmit={handleTransferSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">From</label>
                        <select 
                          value={transferFrom}
                          onChange={(e) => {
                            setTransferFrom(e.target.value);
                            if (e.target.value === transferTo) {
                              setTransferTo(transferFrom);
                            }
                          }}
                          className="w-full bg-gray-50 border border-mist-purple/20 rounded-xl py-3 px-4 text-sm font-bold text-deep-navy outline-none"
                        >
                          <option value="Checking">Checking</option>
                          <option value="Savings">Savings</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">To</label>
                        <select 
                          value={transferTo}
                          onChange={(e) => {
                            setTransferTo(e.target.value);
                            if (e.target.value === transferFrom) {
                              setTransferFrom(transferTo);
                            }
                          }}
                          className="w-full bg-gray-50 border border-mist-purple/20 rounded-xl py-3 px-4 text-sm font-bold text-deep-navy outline-none"
                        >
                          <option value="Checking">Checking</option>
                          <option value="Savings">Savings</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="number" 
                          step="0.01"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border border-mist-purple/20 rounded-xl py-4 pl-12 pr-4 text-xl font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !transferAmount || parseFloat(transferAmount) <= 0}
                    className="w-full bg-calm-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-calm-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowRightLeft size={20} />
                    <span>Transfer Money</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Wallet = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
