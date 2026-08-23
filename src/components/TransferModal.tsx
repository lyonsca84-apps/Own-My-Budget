import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, DollarSign, Landmark, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (amount: number, from: string, to: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onTransfer }) => {
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('Checking');
  const [to, setTo] = useState('Savings');
  const [step, setStep] = useState<'input' | 'success'>('input');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    setStep('success');
    onTransfer(val, from, to);
    
    setTimeout(() => {
      onClose();
      // Reset after animation
      setTimeout(() => {
        setStep('input');
        setAmount('');
      }, 500);
    }, 2000);
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
                <h3 className="text-2xl font-bold text-deep-navy">Transfer Funds</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {step === 'input' ? (
                <form onSubmit={handleTransfer} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">From</label>
                        <div className="relative">
                          <select 
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-4 pr-10 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 outline-none appearance-none transition-all"
                          >
                            <option>Checking</option>
                            <option>Savings</option>
                            <option>Emergency</option>
                          </select>
                          <Landmark className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">To</label>
                        <div className="relative">
                          <select 
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-4 pr-10 text-deep-navy font-medium focus:ring-2 focus:ring-clarity-purple/20 outline-none appearance-none transition-all"
                          >
                            <option>Savings</option>
                            <option>Checking</option>
                            <option>Emergency</option>
                            <option>Investment</option>
                          </select>
                          <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="number" 
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Confirm Transfer</span>
                    <ArrowRight size={20} />
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-2xl font-bold text-deep-navy">Transfer Successful!</h4>
                  <p className="text-gray-500">
                    ${parseFloat(amount).toLocaleString()} has been moved from {from} to {to}.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
