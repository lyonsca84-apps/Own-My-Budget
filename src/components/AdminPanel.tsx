import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Shield, Globe, Key, Send, Loader2, CheckCircle2, 
  AlertCircle, ChevronLeft, Mail, Users, BarChart3, Trash2, 
  UserPlus, ShieldCheck, Lock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

import firebaseConfig from '../../firebase-applet-config.json';

interface AdminPanelProps {
  user: any;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'config'>('users');
  const [projectId, setProjectId] = useState(firebaseConfig.projectId || '');
  const [idpId, setIdpId] = useState('facebook.com');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [authConfig, setAuthConfig] = useState<any>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const ownerEmail = 'lyonsca84@gmail.com';
  const isOwner = user?.email === ownerEmail;

  useEffect(() => {
    if (isOwner) {
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'analytics') fetchAnalytics();
    }
  }, [activeTab, isOwner]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await response.json();
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await response.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (response.ok) {
        setUsers(users.filter(u => u.uid !== uid));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateRole = async (uid: string, role: string) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${uid}/role`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      if (response.ok) {
        setUsers(users.map(u => u.uid === uid ? { ...u, profile: { ...u.profile, role } } : u));
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleCheckStatus = async () => {
    if (!projectId) {
      setStatus({ type: 'error', message: 'Please enter your Firebase Project ID first.' });
      return;
    }

    setStatusLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/auth/status?projectId=${projectId}`);
      const result = await response.json();

      if (response.ok) {
        setAuthConfig(result.data);
        const isEmailEnabled = result.data.signIn?.email?.enabled;
        setStatus({ 
          type: isEmailEnabled ? 'success' : 'error', 
          message: isEmailEnabled 
            ? 'Email/Password authentication is ENABLED.' 
            : 'Email/Password authentication is DISABLED.' 
        });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to fetch auth status.' });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEnableEmailAuth = async () => {
    if (!projectId) {
      setStatus({ type: 'error', message: 'Please enter your Firebase Project ID first.' });
      return;
    }

    setEmailLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/auth/enable-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Email/Password authentication enabled successfully!' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to enable Email/Password auth.' });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/auth/configure-idp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          idpId,
          clientId,
          clientSecret,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Identity Provider configured successfully!' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to configure Identity Provider.' });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-red-100 text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-deep-navy mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">Only the application owner can access the admin panel.</p>
          <button onClick={onBack} className="px-6 py-3 bg-clarity-purple text-white rounded-xl font-bold">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-clarity-purple font-bold transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] shadow-xl border border-mist-purple/20 overflow-hidden"
        >
          <div className="bg-clarity-purple p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Shield size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-white/70 text-sm">Manage users, analytics, and configuration</p>
                </div>
              </div>
              
              <div className="flex bg-white/10 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-clarity-purple shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                  <Users size={16} />
                  Users
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white text-clarity-purple shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                  <BarChart3 size={16} />
                  Analytics
                </button>
                <button 
                  onClick={() => setActiveTab('config')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white text-clarity-purple shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                  <Settings size={16} />
                  Config
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-deep-navy">User Management</h2>
                  <button onClick={fetchUsers} className="text-sm text-clarity-purple font-bold hover:underline">Refresh List</button>
                </div>

                {usersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p>Loading user data...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                          <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Net Worth</th>
                          <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                          <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-soft-lavender flex items-center justify-center overflow-hidden">
                                  {u.photoURL ? (
                                    <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Shield size={20} className="text-clarity-purple" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-deep-navy">{u.displayName || 'Anonymous User'}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <select 
                                value={u.profile?.role || 'user'}
                                onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                                className="text-xs font-bold px-2 py-1 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-clarity-purple/20"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="premium">Premium</option>
                              </select>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-bold text-deep-navy">
                                ${u.profile?.netWorth?.toLocaleString() || '0'}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-xs text-gray-500">
                                {new Date(u.creationTime).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => setShowDeleteConfirm(u.uid)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-soft-lavender/20 rounded-2xl border border-clarity-purple/10">
                    <p className="text-xs font-bold text-clarity-purple uppercase tracking-wider mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-deep-navy">{analytics?.totalUsers || 0}</p>
                  </div>
                  <div className="p-6 bg-soft-lavender/20 rounded-2xl border border-clarity-purple/10">
                    <p className="text-xs font-bold text-clarity-purple uppercase tracking-wider mb-1">Total Net Worth</p>
                    <p className="text-3xl font-bold text-deep-navy">${analytics?.totalNetWorth?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="p-6 bg-soft-lavender/20 rounded-2xl border border-clarity-purple/10">
                    <p className="text-xs font-bold text-clarity-purple uppercase tracking-wider mb-1">Avg. Net Worth</p>
                    <p className="text-3xl font-bold text-deep-navy">${Math.round(analytics?.avgNetWorth || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-8 bg-white rounded-[32px] border border-mist-purple/20 shadow-sm">
                  <h3 className="text-lg font-bold text-deep-navy mb-6">User Sign-ups (Last 6 Months)</h3>
                  <div className="h-[300px] w-full">
                    {analytics?.signupsByMonth ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.signupsByMonth}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Loading chart data...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-8">
                <div className="p-6 bg-soft-lavender/20 rounded-2xl border border-clarity-purple/10">
                  <h3 className="text-lg font-bold text-deep-navy mb-4 flex items-center gap-2">
                    <Mail size={20} className="text-clarity-purple" />
                    Native Providers
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full space-y-4">
                      <p className="text-sm text-gray-500 mb-2">Enable or verify Email/Password authentication for your project.</p>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={handleEnableEmailAuth}
                          disabled={emailLoading || statusLoading || !projectId}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-clarity-purple text-clarity-purple rounded-xl font-bold hover:bg-soft-lavender transition-all disabled:opacity-50"
                        >
                          {emailLoading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                          <span>Enable Email/Password Auth</span>
                        </button>

                        <button
                          onClick={handleCheckStatus}
                          disabled={emailLoading || statusLoading || !projectId}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                          {statusLoading ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
                          <span>Check Auth Status</span>
                        </button>
                      </div>

                      {authConfig && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-white rounded-xl border border-mist-purple/20 shadow-sm"
                        >
                          <h4 className="text-xs font-bold text-deep-navy uppercase tracking-wider mb-3">Project Auth Configuration</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="text-xs text-gray-500">Email/Password</span>
                              <span className={`text-xs font-bold ${authConfig.signIn?.email?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                {authConfig.signIn?.email?.enabled ? 'ENABLED' : 'DISABLED'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="text-xs text-gray-500">Anonymous</span>
                              <span className={`text-xs font-bold ${authConfig.signIn?.anonymous?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                {authConfig.signIn?.anonymous?.enabled ? 'ENABLED' : 'DISABLED'}
                              </span>
                            </div>
                            {authConfig.idps?.map((idp: any) => (
                              <div key={idp.name} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 capitalize">{idp.name.split('/').pop()}</span>
                                <span className={`text-xs font-bold ${idp.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                  {idp.enabled ? 'ENABLED' : 'DISABLED'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-lg font-bold text-deep-navy mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-clarity-purple" />
                    Social Providers (OAuth)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-deep-navy flex items-center gap-2">
                        <Settings size={16} />
                        Firebase Project ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. my-project-123"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-mist-purple/20 rounded-xl focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-deep-navy flex items-center gap-2">
                        <Globe size={16} />
                        Provider ID (IdP)
                      </label>
                      <select
                        value={idpId}
                        onChange={(e) => setIdpId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-mist-purple/20 rounded-xl focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                      >
                        <option value="facebook.com">Facebook</option>
                        <option value="google.com">Google</option>
                        <option value="github.com">GitHub</option>
                        <option value="twitter.com">Twitter</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-deep-navy flex items-center gap-2">
                      <Key size={16} />
                      Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter OAuth Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-mist-purple/20 rounded-xl focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-deep-navy flex items-center gap-2">
                      <Lock size={16} />
                      Client Secret
                    </label>
                    <input
                      type="password"
                      placeholder="Enter OAuth Client Secret"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-mist-purple/20 rounded-xl focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all"
                    />
                  </div>

                  {status && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl flex items-start gap-3 text-sm ${
                        status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      <p>{status.message}</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-clarity-purple text-white rounded-2xl font-bold shadow-lg shadow-clarity-purple/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <Send size={18} />
                        <span>Configure Provider</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 p-6 bg-soft-lavender/30 rounded-2xl border border-clarity-purple/10">
                  <h3 className="text-sm font-bold text-clarity-purple mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Prerequisites & Setup
                  </h3>
                  <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
                    <p>
                      To use this panel, you must first set your Google Service Account credentials in the 
                      <strong>Settings &gt; Environment Variables</strong> menu:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><code>GOOGLE_CLIENT_EMAIL</code></li>
                      <li><code>GOOGLE_PRIVATE_KEY</code> (Full key including BEGIN/END lines)</li>
                      <li><code>GOOGLE_PROJECT_ID</code></li>
                    </ul>
                    <p>
                      This tool uses the Google Identity Toolkit API to programmatically enable Identity Providers in your Firebase project. 
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-mist-purple/20 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-deep-navy mb-2">Delete User?</h3>
              <p className="text-gray-500 mb-8">
                Are you sure you want to delete this user? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

