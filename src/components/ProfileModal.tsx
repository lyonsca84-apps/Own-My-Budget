import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Calendar, Shield, LogOut, Github } from 'lucide-react';
import { auth, signOut, type User as FirebaseUser } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
  userData: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, userData }) => {
  if (!user) return null;

  const joinDate = userData?.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-clarity-purple to-calm-blue relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-deep-navy">{user.displayName}</h2>
                  <p className="text-gray-500">Member since {joinDate}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-clarity-purple shadow-sm">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-deep-navy font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-clarity-purple shadow-sm">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                      <p className="text-deep-navy font-medium">Verified User</p>
                    </div>
                  </div>

                  {user.providerData.some(p => p.providerId === 'github.com') && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-clarity-purple/10">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
                        <Github size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connected Account</p>
                        <p className="text-deep-navy font-medium">GitHub Connected</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => {
                      signOut(auth);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
