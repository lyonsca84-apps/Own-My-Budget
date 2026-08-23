import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  DollarSign, 
  Apple, 
  Play, 
  Star, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Zap,
  ShoppingCart,
  ChevronRight,
  Receipt,
  PiggyBank,
  Landmark,
  CreditCard,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Send,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

export const MarketingHero: React.FC<{ onStart?: (targetTab?: any, mode?: 'login' | 'signup') => void }> = ({ onStart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-clarity-purple selection:text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#9B59B6] opacity-[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1ABC9C] opacity-[0.03] rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      
      {/* Navigation Bar */}
      <nav className="relative z-50 max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-clarity-purple rounded-full flex items-center justify-center text-white shadow-lg shadow-clarity-purple/20">
            <DollarSign size={24} />
          </div>
          <span className="text-deep-navy text-xl font-bold tracking-tight">Own My Budget</span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {[
            { name: 'Features', href: '#features' },
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'Pricing', href: '#pricing' }
          ].map((link) => (
            <a key={link.name} href={link.href} className="text-gray-500 hover:text-clarity-purple font-medium transition-colors text-sm">
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={() => onStart?.('wallet', 'login')}
            className="px-6 py-2.5 text-clarity-purple font-bold text-sm border-2 border-clarity-purple/20 rounded-xl hover:bg-clarity-purple/5 transition-all"
          >
            Login
          </button>
          <button 
            onClick={() => onStart?.('wallet', 'signup')}
            className="px-6 py-2.5 bg-clarity-purple text-white font-bold text-sm rounded-xl shadow-lg shadow-clarity-purple/20 hover:scale-105 transition-transform"
          >
            Get started for free
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-deep-navy hover:bg-gray-100 rounded-xl transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-24 left-0 w-full bg-white border-b border-mist-purple z-40 overflow-hidden"
          >
            <div className="px-8 py-8 flex flex-col gap-6">
              {[
                { name: 'Features', href: '#features' },
                { name: 'How It Works', href: '#how-it-works' },
                { name: 'Pricing', href: '#pricing' }
              ].map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold text-deep-navy hover:text-clarity-purple transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-mist-purple/20 w-full" />
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    onStart?.('wallet', 'login');
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 text-clarity-purple font-bold border-2 border-clarity-purple/20 rounded-2xl"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    onStart?.('wallet', 'signup');
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 bg-clarity-purple text-white font-bold rounded-2xl shadow-lg shadow-clarity-purple/20"
                >
                  Get started for free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side */}
        <div className="space-y-10">
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[56px] leading-[1.1] font-bold text-deep-navy tracking-tight"
            >
              Budgeting, finally <br />
              <span className="text-clarity-purple">explained simply.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-[20px] text-gray-500 leading-relaxed max-w-xl"
            >
              Own My Budget is the first budgeting app designed for people who've never been taught how to budget. Voice-powered. Shame-free. Clear.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => onStart?.('wallet', 'signup')}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#9B59B6] to-[#3498D8] text-white rounded-2xl font-bold shadow-xl shadow-clarity-purple/20 hover:scale-105 transition-transform group"
            >
              <div className="flex gap-1">
                <Apple size={20} />
                <Play size={20} fill="currentColor" className="scale-75" />
              </div>
              Get started for free
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-8 pt-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex text-orange-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-xs font-bold text-deep-navy uppercase tracking-wider">4.9 ★ App Store</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-growth-teal" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Free to start</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Phone Mockup */}
        <div className="relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: -10 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-20 w-[320px] h-[640px] bg-deep-navy rounded-[48px] p-3 shadow-[0_50px_100px_-20px_rgba(155,89,182,0.3)] border-[8px] border-gray-800 perspective-1000"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Screen Content Placeholder */}
            <div className="w-full h-full bg-white rounded-[36px] overflow-hidden relative">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100" />
                  <div className="w-8 h-8 rounded-full bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded-full" />
                  <div className="h-8 w-48 bg-gray-200 rounded-full" />
                </div>
                <div className="h-40 w-full bg-gradient-to-br from-clarity-purple to-blue-500 rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-50 rounded-2xl" />
                  <div className="h-24 bg-gray-50 rounded-2xl" />
                </div>
              </div>
              {/* Bottom Nav Mock */}
              <div className="absolute bottom-0 w-full h-16 bg-white border-t border-gray-100 flex justify-around items-center px-4">
                {[...Array(4)].map((_, i) => <div key={i} className="w-6 h-6 rounded-lg bg-gray-100" />)}
              </div>
            </div>
          </motion.div>

          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-12 z-30 bg-white rounded-2xl p-4 shadow-xl border border-mist-purple/20 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-soft-lavender flex items-center justify-center text-clarity-purple">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-deep-navy">AI Budget Buddy</p>
              <p className="text-[10px] text-gray-400">Personalized guidance</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-40 -left-20 z-30 bg-white rounded-2xl p-4 shadow-xl border border-mist-purple/20 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-deep-navy">Progress Streaks</p>
              <p className="text-[10px] text-gray-400">Stay motivated</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 -right-12 z-30 bg-white rounded-2xl p-4 shadow-xl border border-mist-purple/20 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-growth-teal/10 flex items-center justify-center text-growth-teal">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-deep-navy">Grocery Tracker</p>
              <p className="text-[10px] text-gray-400">Smart inventory</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Subtle Radial Glow in Top Right */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-clarity-purple opacity-[0.05] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-[#F7F4FB]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[42px] font-bold text-[#0A192F] tracking-tight leading-tight">
              Everything you need to take control
            </h2>
            <p className="text-[18px] text-gray-500 max-w-2xl mx-auto">
              One app. Every tool you need to finally understand your money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Budget Buddy',
                desc: 'Just talk. Your AI coach builds your budget by listening.',
                icon: <MessageSquare size={24} />,
                color: 'bg-[#9B59B6]',
                accent: 'border-t-[#9B59B6]'
              },
              {
                title: 'Bills & Subscriptions',
                desc: 'Never miss a payment or forget a warranty again.',
                icon: <Receipt size={24} />,
                color: 'bg-[#3498D8]',
                accent: 'border-t-[#3498D8]'
              },
              {
                title: 'Savings Challenges',
                desc: 'Progress bars, streaks, and badges make saving actually fun.',
                icon: <PiggyBank size={24} />,
                color: 'bg-[#1ABC9C]',
                accent: 'border-t-[#1ABC9C]'
              },
              {
                title: 'Smart Grocery Tracker',
                desc: 'Snap your fridge. Get a shopping list and recipes automatically.',
                icon: <ShoppingCart size={24} />,
                color: 'bg-[#2ECC71]',
                accent: 'border-t-[#2ECC71]'
              },
              {
                title: 'Debt & Loans Overview',
                desc: 'Understand every loan you owe in one calm, clear place.',
                icon: <Landmark size={24} />,
                color: 'bg-[#0A192F]',
                accent: 'border-t-[#0A192F]'
              },
              {
                title: 'Credit Card Alerts',
                desc: 'Know your interest rate. Find better options when yours is too high.',
                icon: <CreditCard size={24} />,
                color: 'bg-[#9B59B6]',
                accent: 'border-t-[#9B59B6]'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white p-8 rounded-[20px] shadow-sm border-t-2 ${feature.accent} flex flex-col items-start space-y-4 hover:shadow-md transition-shadow h-full`}
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5`}>
                  {feature.icon}
                </div>
                <h3 className="text-[20px] font-semibold text-[#0A192F]">{feature.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="how-it-works" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[#0A192F] tracking-tight">
              Real people. Real clarity.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Sarah Jenkins',
                role: 'Freelance Designer',
                quote: "I used to dread checking my bank account. Now, I actually look forward to my weekly check-in with the AI coach. It feels like talking to a friend who actually understands math.",
                accent: 'border-[#9B59B6]/30'
              },
              {
                name: 'Michael Chen',
                role: 'Software Engineer',
                quote: "The grocery tracker is a game changer. I've cut my food waste by 40% and finally stopped buying duplicate spices. The UI is the cleanest I've ever seen in a finance app.",
                accent: 'border-[#1ABC9C]/30'
              },
              {
                name: 'Elena Rodriguez',
                role: 'Marketing Manager',
                quote: "Savings challenges made me save $2,000 for my emergency fund in just 3 months. The streaks and badges are surprisingly addictive. I finally feel in control of my future.",
                accent: 'border-[#3498D8]/30'
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white p-8 rounded-[20px] border ${testimonial.accent} shadow-sm space-y-6 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-[17px] italic text-[#0A192F] leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#0A192F]">{testimonial.name}</p>
                    <p className="text-[14px] text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social Proof Banner */}
          <div className="w-full bg-gradient-to-r from-[#9B59B6] to-[#3498D8] rounded-2xl p-6 text-white text-center font-medium tracking-wide shadow-xl shadow-clarity-purple/20">
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm md:text-base">
              <span className="flex items-center gap-2">★ 4.9 rating on App Store</span>
              <span className="hidden md:block opacity-30">|</span>
              <span>50,000+ users</span>
              <span className="hidden md:block opacity-30">|</span>
              <span>Featured in Forbes & NerdWallet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-[#9B59B6] to-[#3498D8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-[48px] font-bold text-white tracking-tight leading-tight">
              Your money. Finally making sense.
            </h2>
            <p className="text-[18px] text-white/90 max-w-2xl mx-auto">
              Join thousands of people who stopped being overwhelmed and started feeling in control.
            </p>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => onStart?.('therapist', 'signup')}
              className="flex items-center gap-3 px-10 py-5 bg-white text-[#9B59B6] rounded-2xl font-bold shadow-2xl hover:scale-105 transition-transform"
            >
              <Sparkles size={28} />
              <span className="text-xl">Get started for free</span>
            </button>
          </div>

          <div className="flex justify-center items-center gap-8 pt-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex text-white/40">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">App Store</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex text-white/40">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Play Store</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white pt-20 pb-10 border-t border-mist-purple/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Column 1: Logo & Social */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-clarity-purple rounded-full flex items-center justify-center text-white">
                  <DollarSign size={18} />
                </div>
                <span className="text-deep-navy text-lg font-bold tracking-tight">Own My Budget</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                The first budgeting app designed for people who've never been taught how to budget.
              </p>
              <div className="flex items-center gap-4 text-clarity-purple">
                <a href="#" className="hover:scale-110 transition-transform"><Instagram size={20} /></a>
                <a href="#" className="hover:scale-110 transition-transform"><Twitter size={20} /></a>
                <a href="#" className="hover:scale-110 transition-transform"><Facebook size={20} /></a>
                <a href="#" className="hover:scale-110 transition-transform"><Youtube size={20} /></a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-deep-navy uppercase tracking-widest">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-clarity-purple transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-clarity-purple transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-clarity-purple transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-clarity-purple transition-colors">Download App</a></li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-deep-navy uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-clarity-purple transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-clarity-purple transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-clarity-purple transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-clarity-purple transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-deep-navy uppercase tracking-widest">Newsletter</h4>
              <p className="text-sm text-gray-500">Get money tips in your inbox</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-gray-50 border border-mist-purple/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                />
                <button className="bg-clarity-purple text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-mist-purple/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              © 2026 Own My Budget Inc. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 italic">
              Made with ❤️ for people who deserve financial clarity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
