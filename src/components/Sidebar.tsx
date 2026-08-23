import React from 'react';
import { 
  Wallet, 
  PieChart, 
  Receipt, 
  Landmark, 
  CreditCard, 
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  HelpCircle,
  AlertCircle,
  Shield,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { auth, signOut, type User } from '../firebase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User | null;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
  onTourClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onProfileClick, onAdminClick, onTourClick }) => {
  const navItems = [
    { id: 'wallet', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'budget', label: 'Budgeting', icon: <PieChart size={20} /> },
    { id: 'bills', label: 'Bills & Subs', icon: <Receipt size={20} /> },
    { id: 'loans', label: 'Loans', icon: <Landmark size={20} /> },
    { id: 'cards', label: 'Credit Cards', icon: <CreditCard size={20} /> },
    { id: 'emergency', label: 'Emergency', icon: <AlertCircle size={20} /> },
    { id: 'savings', label: 'Savings', icon: <PiggyBank size={20} /> },
    { id: 'grocery', label: 'Grocery Tracker', icon: <ShoppingCart size={20} /> },
    { id: 'therapist', label: 'AI Budget Buddy', icon: <Sparkles size={20} /> },
  ];


  return (
    <aside className="hidden lg:flex flex-col w-72 bg-clean-white border-r border-mist-purple h-screen sticky top-0 overflow-y-auto scrollbar-hide">
      <div className="p-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-clarity-purple rounded-xl flex items-center justify-center text-clean-white shadow-lg shadow-clarity-purple/20">
          <DollarSign size={24} />
        </div>
        <h1 className="text-2xl font-bold text-deep-navy tracking-tight">Own My Budget</h1>
      </div>

      <div className="px-6 space-y-8">
        <section className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                activeTab === item.id
                  ? 'bg-clarity-purple text-clean-white shadow-xl shadow-clarity-purple/30'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-deep-navy'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-clean-white' : 'text-gray-400 group-hover:text-deep-navy'}`}>
                {item.icon}
              </div>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </section>

        <section className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Support</p>
          <button
            onClick={onTourClick}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-gray-400 hover:bg-clarity-purple/5 hover:text-clarity-purple transition-all group"
          >
            <div className="text-gray-400 group-hover:text-clarity-purple">
              <Sparkles size={20} />
            </div>
            <span className="text-sm">Guided Tour</span>
          </button>
        </section>
      </div>

      <div className="mt-auto p-6 border-t border-mist-purple/50">
        {user && (
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-500" />
            <span className="text-sm">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};
