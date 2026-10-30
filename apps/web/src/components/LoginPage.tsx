import { useState } from 'react';
import type { UserRole, AuthUser } from '../types/gym';
import { loginUser } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, role: UserRole) => void;
}

const PRESET_ACCOUNTS = [
  {
    role: 'MEMBER' as UserRole,
    name: 'Martin Vance',
    email: 'member@gym.com',
    password: 'Password123!',
    tag: 'Member',
    desc: 'Workouts, daily programs & check-in',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
  },
  {
    role: 'TRAINER' as UserRole,
    name: 'Alex Hunter',
    email: 'trainer@gym.com',
    password: 'Password123!',
    tag: 'Trainer',
    desc: 'Assigned athletes & plan assignment',
    avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200',
  },
  {
    role: 'ADMIN' as UserRole,
    name: 'Sarah Connor',
    email: 'admin@gym.com',
    password: 'Password123!',
    tag: 'Admin',
    desc: 'Studio metrics, roster & announcements',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
  },
];

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('MEMBER');
  const [email, setEmail] = useState('member@gym.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.password);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Attempt Cloudflare Worker API Login
    const apiResult = await loginUser(email.trim(), password.trim());

    if (apiResult?.success && apiResult?.data?.user) {
      const u = apiResult.data.user;
      const authUser: AuthUser = {
        id: u.id,
        name: `${u.first_name} ${u.last_name}`.trim(),
        email: u.email,
        role: u.role,
        avatarUrl: u.avatar_url,
        token: apiResult.data.tokens?.access_token,
      };
      setLoading(false);
      onLoginSuccess(authUser, u.role);
      return;
    }

    // Local fallback matching preset accounts or active user role
    const matchingPreset = PRESET_ACCOUNTS.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchingPreset && password === matchingPreset.password) {
      const authUser: AuthUser = {
        id: `usr-${matchingPreset.role.toLowerCase()}-0001`,
        name: matchingPreset.name,
        email: matchingPreset.email,
        role: matchingPreset.role,
        avatarUrl: matchingPreset.avatarUrl,
      };
      setLoading(false);
      onLoginSuccess(authUser, matchingPreset.role);
      return;
    }

    // Generic fallback for custom entered credentials
    if (password.length >= 6) {
      const authUser: AuthUser = {
        id: `usr-${selectedRole.toLowerCase()}-${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        role: selectedRole,
      };
      setLoading(false);
      onLoginSuccess(authUser, selectedRole);
      return;
    }

    setLoading(false);
    setErrorMsg('Invalid email or password. Password must be at least 6 characters.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 antialiased selection:bg-amber-400 selection:text-black">
      <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md mx-auto">
            <img src="/fitpulse-logo.png" alt="FITPULSE Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FITPULSE Studio</h1>
            <p className="text-xs text-slate-500 mt-0.5">Select a role or sign in with your credentials</p>
          </div>
        </div>

        {/* Role Quick Selector Cards */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Select Account Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_ACCOUNTS.map((preset) => {
              const isSelected = selectedRole === preset.role;
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <img
                    src={preset.avatarUrl}
                    alt={preset.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 mb-1.5"
                  />
                  <span className="text-xs font-semibold">{preset.tag}</span>
                  <span className={`text-[10px] mt-0.5 truncate w-full ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {preset.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email or Mobile
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. member@gym.com"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-sm flex items-center justify-center space-x-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span>Sign in as {selectedRole === 'ADMIN' ? 'Admin' : selectedRole === 'TRAINER' ? 'Trainer' : 'Member'}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Default test password: <span className="font-mono text-slate-600 font-semibold">Password123!</span>
          </p>
        </div>

      </div>
    </div>
  );
}
