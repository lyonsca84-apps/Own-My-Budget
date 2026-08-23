import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  auth, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  browserPopupRedirectResolver,
  db,
  doc,
  setDoc,
  Timestamp,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, ChevronLeft, Eye, EyeOff, DollarSign } from 'lucide-react';

interface LoginScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onBack, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      onSuccess?.();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup
      } else {
        setError(err.message || 'Failed to sign in. Please ensure third-party cookies are enabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      onSuccess?.();
    } catch (err: any) {
      console.error("GitHub Sign-In Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup
      } else {
        setError(err.message || 'Failed to sign in with GitHub. Please ensure the provider is configured in the Admin Panel.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Create user profile in Firestore
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            displayName: name,
            email: email,
            photoURL: null,
            emergencyBalance: 0,
            netWorth: 0,
            hasSeenOnboarding: false,
            role: 'user',
            createdAt: Timestamp.now()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${userCredential.user.uid}`);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled in Firebase. If you are the admin, use the Admin Panel to enable it.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {onBack && (
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-clarity-purple font-bold transition-colors"
        >
          <ChevronLeft size={20} />
          Back to website
        </button>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-2xl border border-mist-purple/20"
      >
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-soft-lavender rounded-3xl flex items-center justify-center text-clarity-purple mb-8 shadow-inner">
            <DollarSign size={40} />
          </div>
          <h2 className="text-3xl font-bold text-deep-navy tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Welcome to Own My Budget'}
          </h2>
          <p className="mt-4 text-gray-400 text-sm leading-relaxed">
            {mode === 'login' 
              ? 'Sign in to continue your journey with your personal AI Budget Buddy.' 
              : 'Sign up now to start your journey with your personal AI Budget Buddy.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-mist-purple/20 rounded-2xl text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-mist-purple/20 rounded-2xl text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-mist-purple/20 rounded-2xl text-deep-navy focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-clarity-purple transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-clarity-purple text-white rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white border-2 border-mist-purple/30 rounded-2xl text-sm font-bold text-deep-navy hover:bg-gray-50 hover:border-clarity-purple/40 transition-all shadow-sm disabled:opacity-50 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </>
            )}
          </button>
          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white border-2 border-mist-purple/30 rounded-2xl text-sm font-bold text-deep-navy hover:bg-gray-50 hover:border-clarity-purple/40 transition-all shadow-sm disabled:opacity-50 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5" />
                <span>GitHub</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center pt-4">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm font-bold text-clarity-purple hover:underline"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="text-center pt-6">
          <p className="text-[10px] text-gray-400 leading-relaxed max-w-[280px] mx-auto">
            By continuing, you agree to our Terms of Service and Privacy Policy. 
            Google Sign-In works for both new and existing accounts.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
