import React from 'react';

export interface SavingsActivity {
  id: string;
  description: string;
  amount: string;
  date: string;
  type: 'goal' | 'challenge' | 'general';
}

export interface EmergencyLog {
  id: string;
  date: string;
  category: string;
  iconName: string;
  description: string;
  notes?: string;
  amount: number;
  status: 'Paid' | 'Pending';
  createdAt?: any;
}

export interface SavingsChallengeBlock {
  id: string;
  weeks: string; // e.g., "Weeks 1-5"
  amountSaved: number;
  isCompleted: boolean;
  notes?: string;
}

export interface SavingsChallenge {
  blocks: SavingsChallengeBlock[];
  totalSaved: number;
  multiplier: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  type: 'Emergency Fund' | 'Retirement' | 'Vacation' | 'Car Repair' | 'Home Expense' | 'Medical Expense' | 'Holiday Savings' | 'Back-to-school' | 'Custom Goal';
  target: number;
  current: number;
  color: string;
  isEmergencyRelated: boolean;
  isCompleted: boolean;
  createdAt: any;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  dateEarned: string;
  type: 'savings' | 'challenge' | 'emergency' | 'streak';
}

export interface Bill {
  id: string;
  name: string;
  dueDate: string;
  amount: string;
  status: 'paid' | 'due' | 'overdue';
  iconName?: string;
  secondPaymentDate?: string;
  secondPaymentAmount?: string;
}

export interface Subscription {
  id: string;
  name: string;
  cost: string;
  icon: string;
  startDate?: string;
  expiryDate?: string;
}

export interface Warranty {
  id: string;
  name: string;
  expiryDate: string;
  startDate?: string;
  iconName?: string;
}

export interface CardData {
  id: string;
  name: string;
  number: string;
  balance: string; // This will now represent the "Starting Balance"
  balanceValue: number;
  available: string;
  availableValue: number;
  limit: string;
  limitValue: number;
  apr: number;
  gradient: string;
  spending: { category: string; amount: number; color: string }[];
  // New fields for the updated Credit Cards section
  minPaymentDue: number;
  payment1Amount: number;
  payment1Date: string;
  payment2Amount: number;
  payment2Date: string;
  notes: string;
  // Customization
  customColor?: string;
  customPattern?: string;
}

export interface GroceryStorePrice {
  storeName: string;
  price: number;
  unit?: string;
  variation?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  checked: boolean;
  location?: 'list' | 'pantry';
  category: 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Frozen' | 'Pantry' | 'Beverages' | 'Snacks' | 'Household' | 'Personal Care' | 'Other';
  image?: string;
  matchedImage?: string;
  store?: string;
  storePrices?: GroceryStorePrice[];
  notes?: string;
  isPending?: boolean;
}

export interface Loan {
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

export interface MiscItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  store?: string;
  notes?: string;
  isPaid: boolean;
}
