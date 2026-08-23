import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, 
  Users, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight, 
  Utensils, 
  Tag,
  Search,
  ShoppingCart,
  Box,
  Pencil,
  X,
  Trash2,
  Loader2,
  ChevronLeft,
  Store,
  Image as ImageIcon,
  AlertCircle,
  ArrowRight,
  Info,
  Sparkles,
  TrendingUp,
  Lock
} from 'lucide-react';
import { GroceryItem, GroceryStorePrice } from '../types';

export const GroceryTrackerScreen: React.FC<{
  onTransaction?: (amount: number, type: 'income' | 'expense', account?: 'Checking' | 'Savings' | 'Emergency', category?: string) => void;
  groceryBudget: number;
  setGroceryBudget: (budget: number) => void;
  items: GroceryItem[];
  setItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setActiveTab?: (tab: string) => void;
  user?: any;
  userData?: any;
  totalGrocerySpent: number;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}> = ({ onTransaction, groceryBudget, setGroceryBudget, items, setItems, setActiveTab, userData, totalGrocerySpent, showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'pantry'>('list');
  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStore, setNewItemStore] = useState('Walmart');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryItem['category']>('Produce');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(groceryBudget.toString());
  const [clippedCoupons, setClippedCoupons] = useState<number[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [pendingItem, setPendingItem] = useState<Partial<GroceryItem> | null>(null);
  const [showStoreModal, setShowStoreModal] = useState<string | null>(null);
  const [customStoreName, setCustomStoreName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = userData?.plan === 'premium_20';

  const defaultStores = ['Walmart', 'Target', 'Kroger', 'Trader Joe\'s', 'Whole Foods', 'Other/Custom'];
  const [customStores, setCustomStores] = useState<string[]>([]);
  const allStores = [...defaultStores.slice(0, -1), ...customStores, 'Other/Custom'];

  const cartTotal = items.reduce((sum, item) => sum + (item.checked ? item.price * item.quantity : 0), 0);
  const estimatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    if (apiKey && !aiRef.current) {
      try {
        aiRef.current = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.error("Failed to initialize Gemini AI:", err);
      }
    }
  }, []);

  // Progress includes what we've already spent this month + what's currently in our cart
  const totalProjectedSpent = totalGrocerySpent + cartTotal;
  const budgetProgress = groceryBudget > 0 ? (totalProjectedSpent / groceryBudget) * 100 : 0;

  const recipes = [
    { 
      name: 'Avocado Salad', 
      available: 4, 
      needed: 5, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
      ingredients: ['2 Ripe Avocados', '1 cup Cherry Tomatoes', '1/2 Red Onion', 'Fresh Cilantro', 'Lime Juice', 'Olive Oil'],
      steps: [
        'Dice avocados and halve the cherry tomatoes.',
        'Finely chop the red onion and cilantro.',
        'Combine all ingredients in a large bowl.',
        'Drizzle with lime juice and olive oil.',
        'Season with salt and pepper to taste.'
      ]
    },
    { 
      name: 'Creamy Pesto Pasta', 
      available: 3, 
      needed: 6, 
      image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&h=600&fit=crop',
      ingredients: ['1 lb Penne Pasta', '1/2 cup Basil Pesto', '1/2 cup Heavy Cream', '1/4 cup Parmesan Cheese', '2 cloves Garlic', 'Fresh Basil'],
      steps: [
        'Boil pasta in salted water until al dente.',
        'In a pan, sauté minced garlic in a bit of oil.',
        'Stir in pesto and heavy cream, simmer for 2 mins.',
        'Toss the cooked pasta with the sauce.',
        'Top with parmesan and fresh basil.'
      ]
    },
  ];

  const addItem = (categoryOverride?: GroceryItem['category']) => {
    if (!newItemName.trim()) return;
    
    const price = parseFloat(newItemPrice) || 0;
    const quantity = parseInt(newItemQuantity) || 1;
    const category = categoryOverride || newItemCategory;
    const store = newItemStore === 'Other/Custom' ? customStoreName : newItemStore;

    const newItem: GroceryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      price,
      quantity,
      checked: false,
      location: 'list',
      category,
      store,
      notes: newItemNotes,
      storePrices: [
        { storeName: store, price }
      ]
    };

    setItems(prev => [...prev, newItem]);
    
    // Sync with dashboard if price is set
    if (price > 0) {
      onTransaction?.(price * quantity, 'expense', 'Checking', 'grocery');
    }

    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQuantity('1');
    setNewItemNotes('');
    setCustomStoreName('');
    setIsAddingItem(null);

    // Save custom store if new
    if (newItemStore === 'Other/Custom' && customStoreName && !customStores.includes(customStoreName)) {
      setCustomStores(prev => [...prev, customStoreName]);
    }
  };

  const confirmPendingItem = () => {
    if (!pendingItem) return;
    
    const newItem: GroceryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: pendingItem.name || 'Unknown Item',
      price: pendingItem.price || 0,
      quantity: 1,
      checked: false,
      location: 'list',
      category: (pendingItem.category as any) || 'Other',
      image: pendingItem.image,
      matchedImage: pendingItem.matchedImage,
      store: pendingItem.store || 'Target',
      storePrices: pendingItem.storePrices || [],
      notes: pendingItem.notes
    };

    setItems(prev => [...prev, newItem]);
    
    // Sync with dashboard
    if (newItem.price > 0) {
      onTransaction?.(newItem.price, 'expense', 'Checking', 'grocery');
    }

    setPendingItem(null);
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2ECC71', '#27AE60']
    });
  };

  const deleteItem = (id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete && itemToDelete.location === 'list' && itemToDelete.price > 0) {
      // Refund the amount if it was in the list (already "spent" but now removed)
      onTransaction?.(itemToDelete.price * itemToDelete.quantity, 'income', 'Checking', 'grocery');
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, image: reader.result as string } : item
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        const actualDelta = newQuantity - item.quantity;
        
        if (actualDelta !== 0 && item.price > 0) {
          onTransaction?.(
            Math.abs(item.price * actualDelta), 
            actualDelta > 0 ? 'expense' : 'income', 
            'Checking', 
            'grocery'
          );
        }
        
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const toggleCheck = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleCheckout = () => {
    if (cartTotal > 0) {
      // Items are already synced with budget on addition/edit
      // Checkout moves checked items to pantry and celebrates
      setItems(prev => prev.map(item => 
        item.checked ? { ...item, checked: false, location: 'pantry' } : item
      ));
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8E44AD', '#2ECC71', '#3498DB']
      });
      
      showToast?.('success', `Successfully purchased ${items.filter(i => i.checked).length} items!`);
    }
  };

  const handleSnap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      if (!aiRef.current) {
        throw new Error('AI service not initialized. Please check your API key.');
      }

      const result = await aiRef.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type
                }
              },
              {
                text: `Identify the grocery item in this image. 
                  Research and find current pricing for this item at major retailers (Target, Walmart, Trader Joe's, Whole Foods).
                  Also find a high-quality product image URL.
                  Return the result as a JSON object with:
                  - name: string
                  - category: string (Produce, Dairy, Meat, Bakery, Frozen, Pantry, Beverages, Snacks, Household, Personal Care, Other)
                  - price: number (average or typical price)
                  - storePrices: array of { storeName: string, price: number, unit: string, variation: string }
                  - imageUrl: string (direct link to a product photo)
                  - confidence: number (0-1)` 
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = result.text;
      const cleanText = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanText);

      setPendingItem({
        name: data.name,
        category: data.category,
        price: data.price,
        storePrices: data.storePrices,
        image: data.imageUrl,
        matchedImage: data.imageUrl,
        store: data.storePrices[0]?.storeName || 'Target'
      });

    } catch (error) {
      console.error("AI Scan failed:", error);
      showToast?.('error', "Failed to scan item. Please try adding it manually.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const oldTotal = item.price * item.quantity;
        const newTotal = newPrice * item.quantity;
        const diff = newTotal - oldTotal;
        
        if (diff !== 0) {
          onTransaction?.(Math.abs(diff), diff > 0 ? 'expense' : 'income', 'Checking', 'grocery');
        }
        
        return { ...item, price: newPrice };
      }
      return item;
    }));
  };

  const handleAddCustomStore = (itemId: string) => {
    if (!customStoreName.trim() || !customPrice) return;
    
    const price = parseFloat(customPrice);
    if (isNaN(price)) return;

    handleUpdatePrice(itemId, price);
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStorePrice: GroceryStorePrice = {
          storeName: customStoreName,
          price: price
        };
        return {
          ...item,
          store: customStoreName,
          storePrices: [...(item.storePrices || []), newStorePrice]
        };
      }
      return item;
    }));

    setCustomStoreName('');
    setCustomPrice('');
    setShowStoreModal(null);
  };

  const categories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Pantry', 'Beverages', 'Snacks', 'Household', 'Personal Care', 'Other'] as const;

  return (
    <div className="bg-white min-h-screen pb-20 space-y-8">
      {/* Title */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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
            <h2 className="text-[32px] font-bold text-deep-navy tracking-tight leading-tight">Smart Grocery Tracker</h2>
            <p className="text-gray-500 font-medium mt-1">Manage your family's shopping list and pantry in one place.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-mist-purple/50 self-start md:self-center">
          <button 
            onClick={() => setActiveSubTab('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'list' ? 'bg-white text-clarity-purple shadow-sm' : 'text-gray-400 hover:text-deep-navy'}`}
          >
            <ShoppingCart size={18} />
            Shopping List
          </button>
          <button 
            onClick={() => setActiveSubTab('pantry')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'pantry' ? 'bg-white text-clarity-purple shadow-sm' : 'text-gray-400 hover:text-deep-navy'}`}
          >
            <Box size={18} />
            Pantry Inventory
          </button>
        </div>
      </header>

      {/* Top Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-growth-teal to-[#2ECC71] rounded-[32px] p-6 lg:p-10 text-white shadow-xl shadow-growth-teal/20 relative overflow-hidden group"
      >
        {/* Faded Background Icon */}
        <div className="absolute -right-6 -bottom-6 text-white/10 transform -rotate-12 pointer-events-none">
          <ShoppingCart size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 w-full md:w-auto">
            <div className="flex items-center justify-between md:justify-start gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Cart Total</p>
                <h3 className="text-[48px] font-bold leading-none tracking-tight">${cartTotal.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-[1px] bg-white/20 hidden md:block" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Budget</p>
                  <button 
                    onClick={() => {
                      setTempBudget(groceryBudget.toString());
                      setIsEditingBudget(true);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
                {isEditingBudget ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">$</span>
                    <input 
                      type="number"
                      autoFocus
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      onBlur={() => {
                        setGroceryBudget(parseFloat(tempBudget) || 0);
                        setIsEditingBudget(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setGroceryBudget(parseFloat(tempBudget) || 0);
                          setIsEditingBudget(false);
                        }
                      }}
                      className="bg-white/10 border-none rounded-lg px-2 py-1 w-24 text-2xl font-bold focus:ring-2 focus:ring-white/30 outline-none"
                    />
                  </div>
                ) : (
                  <h3 className="text-[32px] font-bold leading-none tracking-tight">${groceryBudget.toFixed(2)}</h3>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-white/80">
                <span>Budget Progress</span>
                <span>{budgetProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                  className={`h-full rounded-full ${budgetProgress > 100 ? 'bg-red-400' : 'bg-white'}`}
                />
              </div>
            </div>
            <p className="text-sm text-white/70 font-medium">Estimated List Total: ${estimatedTotal.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cartTotal <= 0}
            className="bg-white text-growth-teal px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 group w-full md:w-auto justify-center"
          >
            <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-lg">Checkout</span>
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Snap Button - Premium Gated */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleSnap}
      />
      <button 
        onClick={() => {
          if (isPremium) {
            fileInputRef.current?.click();
          } else {
            setShowPremiumModal(true);
          }
        }}
        disabled={isScanning}
        className="w-full border-2 border-dashed border-mist-purple rounded-[32px] p-8 lg:p-12 flex flex-col items-center justify-center gap-6 hover:bg-gray-50 hover:border-clarity-purple/30 transition-all group relative overflow-hidden"
      >
        {!isPremium && (
          <div className="absolute top-6 right-6 bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Lock size={10} />
            Premium Feature
          </div>
        )}
        {isScanning ? (
          <div className="w-20 h-20 rounded-3xl bg-soft-lavender flex items-center justify-center text-clarity-purple animate-spin">
            <Loader2 size={40} />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-soft-lavender flex items-center justify-center text-clarity-purple group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-clarity-purple/10">
            <Camera size={40} />
          </div>
        )}
        <div className="text-center relative z-10">
          <p className="text-deep-navy font-bold text-xl tracking-tight">
            {isScanning ? "Scanning your items..." : "Snap your fridge or pantry"}
          </p>
          <p className="text-gray-500 font-medium mt-1">
            {isScanning ? "Identifying products with AI" : "Our AI will auto-fill your inventory for you!"}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-clarity-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {activeSubTab === 'list' ? (
        <div className="space-y-8">
          {/* Grouped Checklist */}
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category}</h4>
                  <button 
                    onClick={() => {
                      setIsAddingItem(category);
                      setNewItemCategory(category);
                    }}
                    className="flex items-center gap-3 bg-soft-lavender text-clarity-purple px-6 py-3 rounded-2xl text-sm font-bold hover:bg-clarity-purple hover:text-white transition-all shadow-md active:scale-95"
                  >
                    <Plus size={18} />
                    <span>Add new items</span>
                  </button>
                </div>

                {isAddingItem === category && (
                  <div className="bg-white p-6 rounded-[28px] border border-clarity-purple/30 shadow-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Item Name</label>
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="What are you buying?"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Store</label>
                        <select 
                          value={newItemStore}
                          onChange={(e) => setNewItemStore(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none appearance-none cursor-pointer"
                        >
                          {allStores.map(store => (
                            <option key={store} value={store}>{store}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {newItemStore === 'Other/Custom' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Custom Store Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter store name..."
                          value={customStoreName}
                          onChange={(e) => setCustomStoreName(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Category</label>
                        <select 
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value as any)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none appearance-none cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Quantity</label>
                        <input 
                          type="number" 
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Notes (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Organic only"
                          value={newItemNotes}
                          onChange={(e) => setNewItemNotes(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setIsAddingItem(null)}
                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-mist-purple"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => addItem()}
                        className="flex-[2] bg-clarity-purple text-white py-3.5 rounded-xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-[20px] border border-mist-purple overflow-hidden shadow-sm">
                  {items.filter(i => i.location !== 'pantry' && i.category === category).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border-b border-mist-purple/30 last:border-0 hover:bg-gray-50 transition-colors group">
                      <button 
                        onClick={() => toggleCheck(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-growth-teal border-growth-teal text-white' : 'border-mist-purple bg-white'}`}
                      >
                        {item.checked && <Check size={14} />}
                      </button>
                      
                      <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-mist-purple/30 group/img">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Camera size={20} />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Camera size={16} className="text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(item.id, e)}
                          />
                        </label>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm truncate ${item.checked ? 'text-gray-400 line-through' : 'text-deep-navy'}`}>{item.name}</p>
                          {item.isPending && (
                            <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle size={8} />
                              AI Identified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button 
                            onClick={() => setShowStoreModal(item.id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-clarity-purple hover:underline"
                          >
                            <Store size={10} />
                            {item.store || 'Select Store'}
                          </button>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500 font-medium">${item.price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 px-2 border border-mist-purple/20">
                          <button 
                            onClick={() => {
                              if (item.quantity > 1) {
                                onTransaction?.(item.price, 'income', 'Checking', 'grocery');
                                updateQuantity(item.id, -1);
                              }
                            }} 
                            className="p-1 hover:text-clarity-purple transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => {
                              onTransaction?.(item.price, 'expense', 'Checking', 'grocery');
                              updateQuantity(item.id, 1);
                            }} 
                            className="p-1 hover:text-clarity-purple transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Premium Upsell Modal */}
          <AnimatePresence>
            {showPremiumModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
                >
                  <div className="relative h-48 bg-gradient-to-br from-clarity-purple to-deep-navy flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
                    </div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-white mx-auto mb-4 border border-white/20 shadow-2xl">
                        <Sparkles size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Unlock AI Scanning</h3>
                    </div>
                    <button 
                      onClick={() => setShowPremiumModal(false)}
                      className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-soft-lavender flex items-center justify-center text-clarity-purple shrink-0">
                          <Camera size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-deep-navy">Instant Recognition</p>
                          <p className="text-sm text-gray-500 font-medium">Snap a photo of any item to auto-fill name, price, and category.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-growth-teal/10 flex items-center justify-center text-growth-teal shrink-0">
                          <Store size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-deep-navy">Live Store Pricing</p>
                          <p className="text-sm text-gray-500 font-medium">Compare prices across Walmart, Target, Kroger, and more instantly.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-deep-navy">Budget Integration</p>
                          <p className="text-sm text-gray-500 font-medium">Automatically sync scanned items with your monthly budget goals.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-4 border border-mist-purple/50">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Premium Plan</p>
                          <span className="text-clarity-purple font-black">$20/mo</span>
                        </div>
                        <p className="text-sm font-bold text-deep-navy">Everything in Free + AI Features</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setShowPremiumModal(false);
                          // In a real app, this would trigger the upgrade flow
                          showToast?.('info', "Upgrade flow would start here!");
                        }}
                        className="w-full bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-xl shadow-clarity-purple/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Upgrade to Premium
                        <ArrowRight size={18} />
                      </button>
                      <p className="text-center text-[10px] font-medium text-gray-400">Cancel anytime. Secure payment via Stripe.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* AI Confirmation Modal */}
          <AnimatePresence>
            {pendingItem && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
                >
                  <div className="relative h-56 bg-gray-100">
                    {pendingItem.image ? (
                      <img src={pendingItem.image} alt={pendingItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={64} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-growth-teal text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">
                          AI Match Found
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{pendingItem.name}</h3>
                    </div>
                    <button 
                      onClick={() => setPendingItem(null)}
                      className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Store & Price</h4>
                        <span className="text-[10px] font-bold text-clarity-purple bg-soft-lavender px-2 py-1 rounded-md">Live Pricing</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {pendingItem.storePrices?.map((sp, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPendingItem({ ...pendingItem, store: sp.storeName, price: sp.price })}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                              pendingItem.store === sp.storeName 
                                ? 'border-clarity-purple bg-soft-lavender/30' 
                                : 'border-mist-purple hover:border-clarity-purple/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                pendingItem.store === sp.storeName ? 'bg-clarity-purple text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <Store size={20} />
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-deep-navy text-sm">{sp.storeName}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{sp.variation || 'Standard'} • {sp.unit || 'each'}</p>
                              </div>
                            </div>
                            <p className="text-lg font-black text-deep-navy">${sp.price.toFixed(2)}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setPendingItem(null)}
                        className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-mist-purple"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={confirmPendingItem}
                        className="flex-[2] bg-clarity-purple text-white py-4 rounded-2xl font-bold shadow-xl shadow-clarity-purple/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Add to My List
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Store Selection Modal */}
          <AnimatePresence>
            {showStoreModal && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-deep-navy">Update Store & Price</h3>
                    <button onClick={() => setShowStoreModal(null)} className="text-gray-400 hover:text-deep-navy">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {items.find(i => i.id === showStoreModal)?.storePrices?.map((sp, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleUpdatePrice(showStoreModal, sp.price);
                            setItems(prev => prev.map(item => 
                              item.id === showStoreModal ? { ...item, store: sp.storeName } : item
                            ));
                            setShowStoreModal(null);
                          }}
                          className="flex items-center justify-between p-4 rounded-2xl border border-mist-purple hover:border-clarity-purple transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Store size={18} className="text-gray-400 group-hover:text-clarity-purple" />
                            <span className="font-bold text-sm">{sp.storeName}</span>
                          </div>
                          <span className="font-black text-deep-navy">${sp.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-mist-purple space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Custom Store</p>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Store Name (e.g. Local Market)"
                          value={customStoreName}
                          onChange={(e) => setCustomStoreName(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                        />
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              value={customPrice}
                              onChange={(e) => setCustomPrice(e.target.value)}
                              className="w-full bg-gray-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none"
                            />
                          </div>
                          <button 
                            onClick={() => handleAddCustomStore(showStoreModal)}
                            className="bg-clarity-purple text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-clarity-purple/10"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Digital Coupons */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold text-deep-navy">Digital Coupons</h3>
              <button className="text-clarity-purple text-xs font-bold uppercase tracking-wider">View All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
              {[
                { id: 1, store: 'Whole Foods', discount: '$5.00 OFF', expiry: 'Exp. Mar 12', color: 'bg-green-50' },
                { id: 2, store: 'Trader Joe\'s', discount: '20% OFF', expiry: 'Exp. Mar 15', color: 'bg-green-50' },
                { id: 3, store: 'Safeway', discount: '$10.00 OFF', expiry: 'Exp. Mar 10', color: 'bg-green-50' },
              ].map((coupon, idx) => (
                <div key={idx} className={`min-w-[180px] ${coupon.color} rounded-[20px] p-5 border border-green-100 shadow-sm space-y-3`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-green-600">
                      <Tag size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{coupon.store}</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-700">{coupon.discount}</p>
                    <p className="text-[10px] font-bold text-green-600/60 uppercase mt-1">{coupon.expiry}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!clippedCoupons.includes(coupon.id)) {
                        setClippedCoupons([...clippedCoupons, coupon.id]);
                        confetti({
                          particleCount: 50,
                          spread: 40,
                          origin: { y: 0.8 },
                          colors: ['#2ECC71', '#27AE60']
                        });
                      }
                    }}
                    className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      clippedCoupons.includes(coupon.id)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    {clippedCoupons.includes(coupon.id) ? 'Clipped!' : 'Clip Coupon'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Recipe Suggestions */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-deep-navy px-1">Recipe Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((recipe, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white rounded-[24px] border border-mist-purple overflow-hidden shadow-sm group cursor-pointer"
                >
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                    <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-deep-navy shadow-sm">
                      {recipe.available}/{recipe.needed} Ingredients
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-deep-navy text-sm">{recipe.name}</h4>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">Based on your pantry</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-soft-lavender flex items-center justify-center text-clarity-purple group-hover:bg-clarity-purple group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recipe Modal */}
          <AnimatePresence>
            {selectedRecipe && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                >
                  <div className="relative h-64 flex-shrink-0">
                    <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => setSelectedRecipe(null)}
                      className="absolute top-6 right-6 p-2 bg-white/90 backdrop-blur-sm rounded-full text-deep-navy hover:bg-white transition-all shadow-lg"
                    >
                      <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-3xl font-bold text-white">{selectedRecipe.name}</h3>
                      <p className="text-white/80 text-sm font-medium mt-1">Healthy & Delicious</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-deep-navy flex items-center gap-2">
                          <ShoppingCart size={20} className="text-clarity-purple" />
                          Ingredients
                        </h4>
                        <ul className="space-y-3">
                          {selectedRecipe.ingredients.map((ing: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-clarity-purple" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-deep-navy flex items-center gap-2">
                          <Utensils size={20} className="text-clarity-purple" />
                          Instructions
                        </h4>
                        <div className="space-y-4">
                          {selectedRecipe.steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-4">
                              <span className="text-clarity-purple font-black text-lg opacity-30">{i + 1}</span>
                              <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-mist-purple bg-gray-50 flex justify-end">
                    <button 
                      onClick={() => setSelectedRecipe(null)}
                      className="bg-clarity-purple text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all"
                    >
                      Close Recipe
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : items.filter(i => i.location === 'pantry').length > 0 ? (
        <div className="space-y-8">
          {categories.map(category => {
            const pantryItems = items.filter(i => i.location === 'pantry' && i.category === category);
            if (pantryItems.length === 0) return null;
            
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-6 bg-clarity-purple rounded-full" />
                  <h3 className="text-lg font-bold text-deep-navy">{category}</h3>
                  <span className="text-xs font-bold text-gray-400 ml-auto">{pantryItems.length} items</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pantryItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-[24px] p-5 border border-mist-purple shadow-sm flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-mist-purple/50">
                        {item.image || item.matchedImage ? (
                          <img src={item.image || item.matchedImage} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCart size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-deep-navy truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{item.quantity} {item.unit || 'units'} • In Stock</p>
                      </div>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <Box size={40} />
          </div>
          <div>
            <p className="text-deep-navy font-bold">Pantry Inventory is Empty</p>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Items you purchase will automatically appear here to help you track your stock!</p>
          </div>
        </div>
      )}
    </div>
  );
};
