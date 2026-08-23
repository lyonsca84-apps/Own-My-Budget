/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wallet, 
  TrendingUp, 
  Bell, 
  Settings,
  PieChart,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Plus,
  DollarSign,
  Receipt,
  Landmark,
  Search,
  ChevronRight,
  Pencil,
  X,
  AlertCircle,
  Shield,
  ShoppingCart,
  Sparkles,
  Lock,
  CheckCircle2,
  Menu,
  PiggyBank,
  Home,
  Coffee,
  Car,
  ShoppingBag,
  Briefcase,
  Tv
} from "lucide-react";
import { StreakBanner } from "./components/StreakBanner";
import { BudgetScreen } from "./components/BudgetScreen";
import { BillsScreen, initialBills, initialSubscriptions, initialWarranties, initialMiscItems } from "./components/BillsScreen";
import { CardsScreen } from "./components/CardsScreen";
import { LoansScreen } from "./components/LoansScreen";
import { EmergencyScreen } from "./components/EmergencyScreen";
import { SavingsScreen } from "./components/SavingsScreen";
import { GroceryTrackerScreen } from "./components/GroceryTrackerScreen";
import { TherapistScreen } from "./components/TherapistScreen";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { MarketingHero } from "./components/MarketingHero";
import { Sidebar } from "./components/Sidebar";
import { DashboardScreen } from "./components/DashboardScreen";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileModal } from "./components/ProfileModal";
import { AdminPanel } from "./components/AdminPanel";
import { TransferModal } from "./components/TransferModal";
import { BankModal } from "./components/BankModal";
import { ClarityTour } from "./components/ClarityTour";
import { EmergencyLog, SavingsChallenge, SavingsGoal, Badge, Bill, Subscription, Warranty, CardData, Loan, GroceryItem, SavingsActivity, MiscItem } from "./types";
import { 
  auth, 
  db, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDocFromServer,
  browserPopupRedirectResolver,
  handleFirestoreError,
  OperationType,
  serverTimestamp
} from "./firebase";
import { GoogleAuthProvider } from "firebase/auth";
import type { User } from "./firebase";

type Tab = 'wallet' | 'budget' | 'cards' | 'bills' | 'loans' | 'emergency' | 'savings' | 'grocery' | 'marketing' | 'therapist';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('wallet');
  const [intendedTab, setIntendedTab] = useState<Tab>('wallet');
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('signup');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      setHasSeenOnboarding(false);
      setUserData(null);
    }
  }, [user?.uid]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' && user?.email === 'lyonsca84@gmail.com') {
      setIsAdminPanelOpen(true);
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      return true;
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/popup-blocked') {
        setToast({ type: 'error', message: "The sign-in popup was blocked by your browser. Please allow popups for this site and try again." });
      } else if (error.code !== 'auth/cancelled-popup-request') {
        setToast({ type: 'error', message: "Sign in failed: " + error.message + ". Please ensure third-party cookies are enabled." });
      }
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Check if user profile exists in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Test connection
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if(error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration. This may be due to incorrect project ID or missing Firestore provisioning.");
          }
          // Skip logging for other errors, as this is simply a connection test.
        }

        try {
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create initial profile
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              emergencyBalance: 12450.00,
              checkingBalance: 8450.00,
              savingsBalance: 103550.80,
              netWorth: 124450.80,
              totalIncomeAdded: 0,
              totalBudgetAllocated: 0,
              totalGrocerySpent: 0,
              totalBillsPaid: 0,
              totalLoanPayments: 0,
              totalCreditCardPayments: 0,
              totalSavingsAdded: 0,
              totalEmergencyFundAdded: 0,
              groceryItems: [],
              hasSeenOnboarding: false,
              role: 'user',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Show splash for 3 seconds
    return () => clearTimeout(timer);
  }, []);
  const [monthlyIncome, setMonthlyIncome] = useState(6450.00);
  const [monthlyExpenses, setMonthlyExpenses] = useState(3840.00);
  const [netWorth, setNetWorth] = useState(124450.80);
  const [checkingBalance, setCheckingBalance] = useState(8450.00);
  const [savingsBalance, setSavingsBalance] = useState(103550.80);
  
  // New financial tracking states
  const [totalIncomeAdded, setTotalIncomeAdded] = useState(0);
  const [totalBudgetAllocated, setTotalBudgetAllocated] = useState(0);
  const [totalGrocerySpent, setTotalGrocerySpent] = useState(0);
  const [totalBillsPaid, setTotalBillsPaid] = useState(0);
  const [totalLoanPayments, setTotalLoanPayments] = useState(0);
  const [totalCreditCardPayments, setTotalCreditCardPayments] = useState(0);
  const [totalSavingsAdded, setTotalSavingsAdded] = useState(0);
  const [totalEmergencyFundAdded, setTotalEmergencyFundAdded] = useState(0);

  const [goals, setGoals] = useState([
    { id: '1', name: "New Car", current: 12000, target: 25000, color: "bg-growth-teal" },
    { id: '2', name: "Europe Trip", current: 4500, target: 8000, color: "bg-calm-blue" },
  ]);

  // Bills & Subs State
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [subs, setSubs] = useState<Subscription[]>(initialSubscriptions);
  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties);

  // Cards State
  const [cardList, setCardList] = useState<CardData[]>([]);

  // Budget State
  const [paychecks, setPaychecks] = useState([
    { id: '1', date: 'Feb 01, 2026', amount: '$1,600.00', source: 'TechCorp Inc.', received: true },
    { id: '2', date: 'Feb 15, 2026', amount: '$1,600.00', source: 'TechCorp Inc.', received: true },
  ]);
  const [categories, setCategories] = useState([
    { name: 'Housing', value: 1200, color: '#9B59B6', iconName: 'Home', percent: 80 },
    { name: 'Food', value: 450, color: '#3498D8', iconName: 'Coffee', percent: 65 },
    { name: 'Transport', value: 300, color: '#1ABC9C', iconName: 'Car', percent: 45 },
    { name: 'Shopping', value: 250, color: '#2ECC71', iconName: 'ShoppingBag', percent: 30 },
  ]);

  // Sync total budget allocated whenever categories change
  useEffect(() => {
    if (!user) return;
    const total = categories.reduce((acc, c) => acc + (c.value || 0), 0);
    if (total !== totalBudgetAllocated) {
      setTotalBudgetAllocated(total);
      updateDoc(doc(db, 'users', user.uid), { totalBudgetAllocated: total })
        .catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
    }
  }, [categories, user, totalBudgetAllocated]);

  // Loans State
  const [mortgages, setMortgages] = useState<Loan[]>([
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
  ]);
  const [personals, setPersonals] = useState<Loan[]>([
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
  ]);

  // Emergency Fund State
  const [emergencyBalance, setEmergencyBalance] = useState(12450.00);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyLog[]>([
    { id: '1', date: 'Mar 08, 2026', category: 'Medical', iconName: 'Stethoscope', description: 'Emergency Room Visit', notes: 'Severe allergic reaction to shellfish', amount: 850.00, status: 'Paid' },
    { id: '2', date: 'Mar 05, 2026', category: 'Car', iconName: 'Car', description: 'New Alternator', notes: 'Car wouldn\'t start in the morning', amount: 425.00, status: 'Paid' },
    { id: '3', date: 'Feb 28, 2026', category: 'Home', iconName: 'Wrench', description: 'Pipe Leak Repair', notes: 'Kitchen sink pipe burst', amount: 250.00, status: 'Paid' },
  ]);

  // Savings State
  const [totalSavingsBalance, setTotalSavingsBalance] = useState(12450.80);
  const [groceryBudget, setGroceryBudget] = useState(600.00);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [miscItems, setMiscItems] = useState<MiscItem[]>(initialMiscItems);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsActivities, setSavingsActivities] = useState<SavingsActivity[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [generalSavings, setGeneralSavings] = useState(0);

  // Updated Savings Challenge State
  const [savingsChallenge, setSavingsChallenge] = useState<SavingsChallenge>({
    blocks: [
      { id: '1', weeks: 'Weeks 1-5', amountSaved: 0, isCompleted: false },
      { id: '2', weeks: 'Weeks 6-10', amountSaved: 0, isCompleted: false },
      { id: '3', weeks: 'Weeks 11-15', amountSaved: 0, isCompleted: false },
      { id: '4', weeks: 'Weeks 16-20', amountSaved: 0, isCompleted: false },
      { id: '5', weeks: 'Weeks 21-25', amountSaved: 0, isCompleted: false },
      { id: '6', weeks: 'Weeks 26-30', amountSaved: 0, isCompleted: false },
      { id: '7', weeks: 'Weeks 31-35', amountSaved: 0, isCompleted: false },
      { id: '8', weeks: 'Weeks 36-40', amountSaved: 0, isCompleted: false },
      { id: '9', weeks: 'Weeks 41-45', amountSaved: 0, isCompleted: false },
      { id: '10', weeks: 'Weeks 46-50', amountSaved: 0, isCompleted: false },
      { id: '11', weeks: 'Weeks 51-52', amountSaved: 0, isCompleted: false },
    ],
    totalSaved: 0,
    multiplier: 1
  });

  // Calculate derived metrics
  const totalCardDebt = cardList.reduce((sum, card) => sum + parseFloat(card.balance.replace(/[$,]/g, '') || '0'), 0);
  const totalLoanDebt = [...mortgages, ...personals].reduce((sum, loan) => sum + (loan.remainingBalance || 0), 0);
  const totalDebt = totalCardDebt + totalLoanDebt;
  
  // Total Savings = General Savings + 52-Week Challenge Total + Linked Goal Savings
  const challengeTotal = savingsChallenge.totalSaved || 0;
  const linkedGoalsTotal = savingsGoals.reduce((sum, goal) => sum + (goal.current || 0), 0);
  const calculatedSavingsBalance = generalSavings + challengeTotal + linkedGoalsTotal;

  const calculatedNetWorth = checkingBalance + calculatedSavingsBalance + emergencyBalance - totalDebt;
  
  const totalIncome = paychecks.reduce((sum, p) => sum + (p.received ? parseFloat(p.amount.replace(/[$,]/g, '') || '0') : 0), 0);
  const totalExpenses = categories.reduce((sum, c) => sum + (c.value || 0), 0);

  // Peace Score: (Savings + Emergency) / (Monthly Expenses * 6)
  const runwayMonths = (calculatedSavingsBalance + emergencyBalance) / (totalExpenses || 1);
  const peaceScore = Math.min(Math.round((runwayMonths / 6) * 100), 100);

  // Sync user data from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        // Only update local state from snapshot if it's true, or if we're not in the middle of an update
        // This prevents the race condition where handleOnboardingComplete sets it to true
        // but a stale snapshot sets it back to false
        if (data.hasSeenOnboarding === true) {
          setHasSeenOnboarding(true);
        }
        if (data.netWorth !== undefined) setNetWorth(data.netWorth);
        if (data.checkingBalance !== undefined) setCheckingBalance(data.checkingBalance);
        if (data.savingsBalance !== undefined) setSavingsBalance(data.savingsBalance);
        if (data.emergencyBalance !== undefined) setEmergencyBalance(data.emergencyBalance);

        // New financial metrics
        if (data.totalIncomeAdded !== undefined) setTotalIncomeAdded(data.totalIncomeAdded);
        if (data.totalBudgetAllocated !== undefined) setTotalBudgetAllocated(data.totalBudgetAllocated);
        if (data.totalGrocerySpent !== undefined) setTotalGrocerySpent(data.totalGrocerySpent);
        if (data.totalBillsPaid !== undefined) setTotalBillsPaid(data.totalBillsPaid);
        if (data.totalLoanPayments !== undefined) setTotalLoanPayments(data.totalLoanPayments);
        if (data.totalCreditCardPayments !== undefined) setTotalCreditCardPayments(data.totalCreditCardPayments);
        if (data.totalSavingsAdded !== undefined) setTotalSavingsAdded(data.totalSavingsAdded);
        if (data.totalEmergencyFundAdded !== undefined) setTotalEmergencyFundAdded(data.totalEmergencyFundAdded);

        // Financial states
        if (data.paychecks) setPaychecks(data.paychecks);
        if (data.categories) setCategories(data.categories);
        if (data.bills) setBills(data.bills);
        if (data.subs) setSubs(data.subs);
        if (data.warranties) setWarranties(data.warranties);
        if (data.cardList) setCardList(data.cardList);
        if (data.mortgages) setMortgages(data.mortgages);
        if (data.personals) setPersonals(data.personals);
        if (data.goals) setGoals(data.goals);
        if (data.savingsChallenge) {
          const challenge = data.savingsChallenge;
          // Ensure blocks exists before setting
          if (challenge.blocks && Array.isArray(challenge.blocks)) {
            setSavingsChallenge(challenge);
          }
        }
        if (data.savingsGoals) setSavingsGoals(Array.isArray(data.savingsGoals) ? data.savingsGoals : []);
        if (data.savingsActivities) setSavingsActivities(Array.isArray(data.savingsActivities) ? data.savingsActivities : []);
        if (data.badges) setBadges(Array.isArray(data.badges) ? data.badges : []);
        if (data.generalSavings !== undefined) setGeneralSavings(data.generalSavings);
        if (data.groceryBudget) setGroceryBudget(data.groceryBudget);
        if (data.groceryItems) setGroceryItems(data.groceryItems);
        if (data.miscItems) setMiscItems(Array.isArray(data.miscItems) ? data.miscItems : []);
      }
    });

    // Sync emergency logs
    const logsQuery = query(
      collection(db, 'emergencyLogs'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyLog[];
      setEmergencyLogs(logsData);
    });

    return () => {
      unsubscribe();
      unsubscribeLogs();
    };
  }, [user]);

  // Persistence Effects
  useEffect(() => {
    if (!user) return;
    const syncData = async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          paychecks,
          categories,
          bills,
          subs,
          warranties,
          cardList,
          mortgages,
          personals,
          goals,
          savingsGoals,
          savingsActivities,
          badges,
          generalSavings,
          savingsChallenge,
          groceryBudget,
          groceryItems,
          miscItems
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    };
    const timeoutId = setTimeout(syncData, 2000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [user, paychecks, categories, bills, subs, warranties, cardList, mortgages, personals, goals, savingsGoals, savingsActivities, badges, generalSavings, savingsChallenge, groceryBudget, groceryItems, miscItems]);

  const handleEditNetWorth = () => {
    setEditingItem({ type: 'networth', value: netWorth });
    setIsEditModalOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setEditingItem({ type: 'goal', ...goal });
    setIsEditModalOpen(true);
  };

  const handleAddNewGoal = () => {
    setEditingItem({ 
      type: 'goal', 
      id: `goal-${Date.now()}`, 
      name: '', 
      current: 0, 
      target: 0, 
      color: 'bg-clarity-purple',
      isNew: true 
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);
  }, [activeTab]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingItem.type === 'networth') {
      const newValue = parseFloat(editingItem.value);
      setNetWorth(newValue);
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          netWorth: newValue
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else if (editingItem.type === 'goal') {
      if (editingItem.isNew) {
        setGoals(prev => [...prev, { ...editingItem, isNew: undefined }]);
      } else {
        setGoals(prev => prev.map(g => g.id === editingItem.id ? { ...editingItem } : g));
      }
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleUpdateBankBalances = async (checking: number, savings: number) => {
    if (!user) return;
    setCheckingBalance(checking);
    setGeneralSavings(savings);
    const newNetWorth = checking + (savings + challengeTotal + linkedGoalsTotal) + emergencyBalance - totalDebt;
    setNetWorth(newNetWorth);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        checkingBalance: checking,
        generalSavings: savings,
        netWorth: newNetWorth
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleTransfer = async (amount: number, from: string, to: string) => {
    if (!user) return;
    
    let newChecking = checkingBalance;
    let newGeneralSavings = generalSavings;
    let newEmergency = emergencyBalance;

    // Subtract from source
    if (from === 'Checking') newChecking -= amount;
    else if (from === 'Savings') newGeneralSavings -= amount;
    else if (from === 'Emergency') newEmergency -= amount;

    // Add to destination
    if (to === 'Checking') newChecking += amount;
    else if (to === 'Savings') newGeneralSavings += amount;
    else if (to === 'Emergency') newEmergency += amount;

    setCheckingBalance(newChecking);
    setGeneralSavings(newGeneralSavings);
    setEmergencyBalance(newEmergency);
    const newNetWorth = newChecking + (newGeneralSavings + challengeTotal + linkedGoalsTotal) + newEmergency - totalDebt;
    setNetWorth(newNetWorth);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        checkingBalance: newChecking,
        generalSavings: newGeneralSavings,
        emergencyBalance: newEmergency,
        netWorth: newNetWorth
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleTransaction = async (
    amount: number, 
    type: 'income' | 'expense', 
    account: 'Checking' | 'Savings' | 'Emergency' = 'Checking',
    category?: 'grocery' | 'bill' | 'loan' | 'card' | 'savings' | 'emergency' | 'income'
  ) => {
    if (!user) return;
    
    let newChecking = checkingBalance;
    let newGeneralSavings = generalSavings;
    let newEmergency = emergencyBalance;
    
    let newTotalIncomeAdded = totalIncomeAdded;
    let newTotalGrocerySpent = totalGrocerySpent;
    let newTotalBillsPaid = totalBillsPaid;
    let newTotalLoanPayments = totalLoanPayments;
    let newTotalCreditCardPayments = totalCreditCardPayments;
    let newTotalSavingsAdded = totalSavingsAdded;
    let newTotalEmergencyFundAdded = totalEmergencyFundAdded;

    const change = type === 'income' ? amount : -amount;

    if (account === 'Checking') newChecking += change;
    else if (account === 'Savings') newGeneralSavings += change;
    else if (account === 'Emergency') newEmergency += change;

    // Update specific totals
    if (type === 'income') {
      if (category === 'income' || !category) {
        newTotalIncomeAdded += amount;
      }
    } else if (type === 'expense' && category) {
      if (category === 'grocery') newTotalGrocerySpent += amount;
      else if (category === 'bill') newTotalBillsPaid += amount;
      else if (category === 'loan') newTotalLoanPayments += amount;
      else if (category === 'card') newTotalCreditCardPayments += amount;
      else if (category === 'savings') newTotalSavingsAdded += amount;
      else if (category === 'emergency') newTotalEmergencyFundAdded += amount;
    }

    setCheckingBalance(newChecking);
    setGeneralSavings(newGeneralSavings);
    setEmergencyBalance(newEmergency);
    
    setTotalIncomeAdded(newTotalIncomeAdded);
    setTotalGrocerySpent(newTotalGrocerySpent);
    setTotalBillsPaid(newTotalBillsPaid);
    setTotalLoanPayments(newTotalLoanPayments);
    setTotalCreditCardPayments(newTotalCreditCardPayments);
    setTotalSavingsAdded(newTotalSavingsAdded);
    setTotalEmergencyFundAdded(newTotalEmergencyFundAdded);

    const newNetWorth = newChecking + (newGeneralSavings + challengeTotal + linkedGoalsTotal) + newEmergency - totalDebt;
    setNetWorth(newNetWorth);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        checkingBalance: newChecking,
        generalSavings: newGeneralSavings,
        emergencyBalance: newEmergency,
        netWorth: newNetWorth,
        totalIncomeAdded: newTotalIncomeAdded,
        totalGrocerySpent: newTotalGrocerySpent,
        totalBillsPaid: newTotalBillsPaid,
        totalLoanPayments: newTotalLoanPayments,
        totalCreditCardPayments: newTotalCreditCardPayments,
        totalSavingsAdded: newTotalSavingsAdded,
        totalEmergencyFundAdded: newTotalEmergencyFundAdded
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleOnboardingComplete = async (answers?: any) => {
    setHasSeenOnboarding(true);
    if (user) {
      try {
        const updateData: any = {
          hasSeenOnboarding: true,
          role: 'client'
        };
        
        if (answers) {
          updateData.onboardingAnswers = answers;
          updateData.displayName = answers.name || user.displayName;
        }

        await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans text-deep-navy selection:bg-clarity-purple/10 selection:text-clarity-purple">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-progress-green text-white' : 
              toast.type === 'error' ? 'bg-red-500 text-white' : 
              'bg-clarity-purple text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : 
             toast.type === 'error' ? <AlertCircle size={18} /> : 
             <Sparkles size={18} />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
              <X size={14} />
            </button>
          </motion.div>
        )}

        {showSplash ? (
          <SplashScreen key="splash" />
        ) : !user ? (
          <LoginScreen key="login" mode={loginMode} setMode={setLoginMode} />
        ) : !hasSeenOnboarding ? (
          <OnboardingScreen key="onboarding" onComplete={handleOnboardingComplete} user={user} />
        ) : isAdminPanelOpen && user?.email === 'lyonsca84@gmail.com' ? (
          <AdminPanel key="admin" user={user} onBack={() => setIsAdminPanelOpen(false)} />
        ) : (
          <div key="main" className="flex h-screen-safe overflow-hidden">
            <ClarityTour 
              isOpen={isTourOpen} 
              onClose={() => setIsTourOpen(false)} 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              user={user}
              onProfileClick={() => setIsProfileModalOpen(true)}
              onAdminClick={() => setIsAdminPanelOpen(true)}
              onTourClick={() => setIsTourOpen(true)}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F8F9FD]">
              {/* Top Header */}
              <header className="h-20 lg:h-24 px-4 lg:px-8 flex items-center justify-between bg-transparent flex-shrink-0">
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="w-8 h-8 bg-clarity-purple rounded-lg flex items-center justify-center text-white shadow-lg shadow-clarity-purple/20">
                    <DollarSign size={18} />
                  </div>
                  <h1 className="text-lg font-bold text-deep-navy tracking-tight">Own My Budget</h1>
                </div>

                <div className="flex-1 flex justify-end items-center gap-4">
                  {/* Search Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                        isSearchOpen ? 'bg-clarity-purple text-white border-clarity-purple' : 'bg-white text-gray-400 border-mist-purple hover:text-clarity-purple'
                      }`}
                    >
                      <Search size={20} />
                    </button>

                    <AnimatePresence>
                      {isSearchOpen && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSearchOpen(false)}
                            className="fixed inset-0 z-40 bg-black/5"
                          />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="fixed sm:absolute top-20 sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-96 bg-white rounded-2xl border border-mist-purple shadow-2xl z-50 p-4"
                          >
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type="text" 
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search transactions, bills..." 
                                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-10 text-sm focus:ring-2 focus:ring-clarity-purple/20 transition-all"
                              />
                              {searchQuery && (
                                <button 
                                  onClick={() => setSearchQuery('')}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <button className="relative p-2.5 bg-white border border-mist-purple rounded-xl text-gray-400 hover:text-clarity-purple transition-all shadow-sm">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  </button>
                  
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Balance</p>
                    <p className="text-lg font-bold text-clarity-purple">${netWorth.toLocaleString()}</p>
                  </div>

                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-3 pl-0 lg:pl-4 lg:border-l border-mist-purple"
                  >
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName || user.displayName || 'User'}`} 
                      alt="Profile" 
                      className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl object-cover border-2 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-gray-400">Hi,</p>
                      <p className="text-sm font-bold text-deep-navy">{(userData?.displayName || user.displayName)?.split(' ')[0] || 'User'}</p>
                    </div>
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto scrollbar-hide px-2 lg:px-8 pb-36 lg:pb-12">
                <AnimatePresence mode="wait" initial={false}>
                  {activeTab === 'wallet' && (
                    <DashboardScreen 
                      key="wallet"
                      user={user}
                      netWorth={calculatedNetWorth}
                      checkingBalance={checkingBalance}
                      savingsBalance={calculatedSavingsBalance}
                      emergencyBalance={emergencyBalance}
                      totalIncome={totalIncome}
                      totalExpenses={totalExpenses}
                      peaceScore={peaceScore}
                      goals={goals}
                      setActiveTab={setActiveTab}
                      onSendMoney={() => setIsTransferModalOpen(true)}
                      onRequestMoney={() => setIsTransferModalOpen(true)}
                      onEditBank={() => setIsBankModalOpen(true)}
                      onAddGoal={() => {
                        setEditingItem({ type: 'goal', isNew: true, name: '', current: 0, target: 0, color: 'bg-clarity-purple' });
                        setIsEditModalOpen(true);
                      }}
                      onStartTour={() => setIsTourOpen(true)}
                      cardList={cardList}
                      // New financial metrics
                      totalIncomeAdded={totalIncomeAdded}
                      totalBudgetAllocated={totalBudgetAllocated}
                      totalGrocerySpent={totalGrocerySpent}
                      totalBillsPaid={totalBillsPaid}
                      totalLoanPayments={totalLoanPayments}
                      totalCreditCardPayments={totalCreditCardPayments}
                      totalSavingsAdded={totalSavingsAdded}
                      totalEmergencyFundAdded={totalEmergencyFundAdded}
                    />
                  )}
                  {activeTab === 'budget' && (
                    <BudgetScreen 
                      key="budget" 
                      user={user} 
                      paychecks={paychecks}
                      setPaychecks={setPaychecks}
                      categories={categories}
                      setCategories={setCategories}
                      onTransaction={handleTransaction}
                      groceryBudget={groceryBudget}
                      setActiveTab={setActiveTab}
                      totalGrocerySpent={totalGrocerySpent}
                    />
                  )}
                  {activeTab === 'cards' && (
                    <CardsScreen 
                      key="cards" 
                      user={user} 
                      cardList={cardList}
                      setCardList={setCardList}
                      onTransaction={handleTransaction}
                      setActiveTab={setActiveTab}
                    />
                  )}
                  {activeTab === 'bills' && (
                    <BillsScreen 
                      key="bills" 
                      user={user} 
                      bills={bills}
                      setBills={setBills}
                      subs={subs}
                      setSubs={setSubs}
                      warranties={warranties}
                      setWarranties={setWarranties}
                      miscItems={miscItems}
                      setMiscItems={setMiscItems}
                      onTransaction={handleTransaction}
                      setActiveTab={setActiveTab}
                    />
                  )}
                  {activeTab === 'loans' && (
                    <LoansScreen 
                      key="loans" 
                      mortgages={mortgages}
                      setMortgages={setMortgages}
                      personals={personals}
                      setPersonals={setPersonals}
                      onTransaction={handleTransaction}
                      setActiveTab={setActiveTab}
                    />
                  )}
                  {activeTab === 'emergency' && (
                    <EmergencyScreen 
                      key="emergency" 
                      user={user} 
                      balance={emergencyBalance}
                      setBalance={setEmergencyBalance}
                      logs={emergencyLogs}
                      setLogs={setEmergencyLogs}
                      savingsGoals={savingsGoals}
                      setSavingsGoals={setSavingsGoals}
                      savingsActivities={savingsActivities}
                      setSavingsActivities={setSavingsActivities}
                      onTransaction={handleTransaction}
                      setActiveTab={setActiveTab}
                      showToast={showToast}
                    />
                  )}
                  {activeTab === 'savings' && (
                    <SavingsScreen 
                      key="savings" 
                      challenge={savingsChallenge}
                      setChallenge={setSavingsChallenge}
                      savingsGoals={savingsGoals}
                      setSavingsGoals={setSavingsGoals}
                      savingsActivities={savingsActivities}
                      setSavingsActivities={setSavingsActivities}
                      badges={badges}
                      setBadges={setBadges}
                      generalSavings={generalSavings}
                      setGeneralSavings={setGeneralSavings}
                      totalBalance={calculatedSavingsBalance}
                      onTransaction={handleTransaction}
                      setActiveTab={setActiveTab}
                      user={user}
                      showToast={showToast}
                    />
                  )}
                  {activeTab === 'grocery' && (
                    <GroceryTrackerScreen 
                      key="grocery" 
                      user={user}
                      userData={userData}
                      onTransaction={handleTransaction}
                      groceryBudget={groceryBudget}
                      setGroceryBudget={setGroceryBudget}
                      items={groceryItems}
                      setItems={setGroceryItems}
                      setActiveTab={setActiveTab}
                      totalGrocerySpent={totalGrocerySpent}
                      showToast={showToast}
                    />
                  )}
                  {activeTab === 'therapist' && (
                    <TherapistScreen 
                      key="therapist" 
                      user={user}
                      dashboardData={{
                        netWorth: calculatedNetWorth,
                        checkingBalance,
                        savingsBalance,
                        emergencyBalance,
                        totalIncome,
                        totalExpenses,
                        peaceScore,
                        goals,
                        totalDebt
                      }}
                      setActiveTab={setActiveTab}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Bottom Navigation */}
              <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-mist-purple px-6 pt-3 pb-safe flex items-center justify-between z-[60] shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
                {[
                  { id: 'wallet', icon: <LayoutDashboard size={24} />, label: 'Home' },
                  { id: 'budget', icon: <PieChart size={24} />, label: 'Budget' },
                  { id: 'grocery', icon: <ShoppingCart size={24} />, label: 'Grocery' },
                  { id: 'bills', icon: <Receipt size={24} />, label: 'Bills' },
                  { id: 'cards', icon: <CreditCard size={24} />, label: 'Cards' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 transition-all cursor-pointer active:opacity-60 ${
                      activeTab === item.id ? 'text-clarity-purple scale-110' : 'text-gray-400'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={`flex flex-col items-center gap-1 transition-all cursor-pointer active:opacity-60 ${
                    isMobileMenuOpen ? 'text-clarity-purple scale-110' : 'text-gray-400'
                  }`}
                >
                  <div className="w-6 h-6 flex flex-col justify-center gap-1">
                    <div className="h-0.5 w-full bg-current rounded-full" />
                    <div className="h-0.5 w-full bg-current rounded-full" />
                    <div className="h-0.5 w-full bg-current rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">More</span>
                </button>
              </nav>

              {/* Mobile More Menu Overlay */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="fixed inset-0 bg-deep-navy/60 backdrop-blur-md z-[70] lg:hidden"
                    />
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[80] p-8 lg:hidden max-h-[80vh] overflow-y-auto"
                    >
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'loans', label: 'Loans', icon: <Landmark size={20} />, color: 'bg-blue-50 text-blue-500' },
                          { id: 'emergency', label: 'Emergency', icon: <AlertCircle size={20} />, color: 'bg-red-50 text-red-500' },
                          { id: 'savings', label: 'Savings', icon: <PiggyBank size={20} />, color: 'bg-growth-teal/10 text-growth-teal' },
                          { id: 'grocery', label: 'Groceries', icon: <ShoppingCart size={20} />, color: 'bg-orange-50 text-orange-500' },
                          { id: 'therapist', label: 'AI Budget Buddy', icon: <Sparkles size={20} />, color: 'bg-clarity-purple/10 text-clarity-purple' },
                          { id: 'tour', label: 'Guided Tour', icon: <Sparkles size={20} />, color: 'bg-clarity-purple text-white', isTour: true },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (item.isTour) {
                                setIsTourOpen(true);
                              } else {
                                setActiveTab(item.id as any);
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all cursor-pointer active:opacity-60 ${
                              activeTab === item.id ? 'bg-clarity-purple text-white' : 'bg-gray-50 text-deep-navy'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white/20 text-white' : item.color}`}>
                              {item.icon}
                            </div>
                            <span className="text-sm">{item.label}</span>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          signOut(auth);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mt-8 flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 text-red-500 font-bold"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}
      </AnimatePresence>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user}
        userData={userData}
      />

      <AnimatePresence>
        {isEditModalOpen && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-deep-navy">
                  {editingItem.isNew ? 'Add New Goal' : `Edit ${editingItem.type === 'networth' ? 'Net Worth' : 'Goal'}`}
                </h3>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {editingItem.type === 'networth' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Total Net Worth</label>
                    <input 
                      type="number" 
                      value={editingItem.value}
                      onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                      className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Goal Name</label>
                      <input 
                        type="text" 
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Current</label>
                        <input 
                          type="number" 
                          value={editingItem.current}
                          onChange={(e) => setEditingItem({ ...editingItem, current: parseFloat(e.target.value) })}
                          className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Target</label>
                        <input 
                          type="number" 
                          value={editingItem.target}
                          onChange={(e) => setEditingItem({ ...editingItem, target: parseFloat(e.target.value) })}
                          className="w-full bg-gray-50 border border-mist-purple rounded-xl px-4 py-3 focus:ring-2 focus:ring-clarity-purple/20 transition-all outline-none"
                          required
                        />
                      </div>
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

      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        onTransfer={handleTransfer}
      />

      <BankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        checkingBalance={checkingBalance}
        savingsBalance={generalSavings}
        onUpdate={handleUpdateBankBalances}
        onTransfer={handleTransfer}
      />
    </div>
  );
}




