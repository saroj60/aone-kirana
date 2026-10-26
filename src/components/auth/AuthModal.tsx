import React, { useState } from 'react';
import { X, Lock, User, Phone, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'signup' }) => {
  const { registerCustomer, loginCustomer } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Registration fields: Name and Number
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign-in fields: Number and Password
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto clean phone number
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    // Only allow digits and limit to 10
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 10);
    setter(cleaned);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (fullName.trim().length < 2) {
      setErrorMsg('Name must be at least 2 characters.');
      return;
    }

    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).');
      return;
    }

    setLoading(true);

    try {
      const res = await registerCustomer(
        fullName.trim(),
        phone.trim(),
        password.trim() || '123456',
        'Ward 5, Tikathali Chowk, Lalitpur'
      );

      if (res.success) {
        setSuccessMsg(res.message || `Welcome to Aone Kirana, ${fullName}!`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginPhone.trim()) {
      setErrorMsg('Please enter your registered mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginCustomer(loginPhone.trim(), loginPassword.trim());

      if (res.success) {
        setSuccessMsg(res.message || 'Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your mobile number.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
      style={{ zIndex: 1000 }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-brand-700 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            <Sparkles className="w-6 h-6 text-brand-700" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {mode === 'signup' ? 'Create Customer Account' : 'Welcome to Aone Kirana'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signup'
              ? 'Register with your name and mobile number for fast delivery'
              : 'Enter your mobile number to access orders and express checkout'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register (Name & Number)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {errorMsg.includes('already exists') && mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => {
                    setLoginPhone(phone);
                    setMode('signin');
                    setErrorMsg('');
                  }}
                  className="block mt-1 font-bold text-brand-700 hover:underline"
                >
                  Click here to Sign In with {phone} →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* REGISTRATION FORM (Name and Number) */}
        {mode === 'signup' ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Saroj Shrestha"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
                />
              </div>
            </div>

            {/* Mobile Number Field (Nepal 10-digits) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Mobile Number (Nepal) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">10 digits</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-500 pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+977</span>
                  <span className="text-slate-300">|</span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value, setPhone)}
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  className="w-full pl-20 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Used for order updates and free delivery coordination.
              </p>
            </div>

            {/* Optional Password or PIN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Password / PIN (Optional)</span>
                <span className="text-[10px] text-brand-700 font-medium">Default: 123456</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password or 4-digit PIN"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
                />
              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={loading || phone.length < 10 || !fullName.trim()}
              className="w-full mt-2 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-brand-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security note */}
            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your phone number is kept private & verified for deliveries</span>
              </span>
            </div>
          </form>
        ) : (
          /* SIGN IN FORM (Number and Password) */
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-500 pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+977</span>
                  <span className="text-slate-300">|</span>
                </div>
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={e => handlePhoneChange(e.target.value, setLoginPhone)}
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  className="w-full pl-20 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Password / PIN</span>
                <span className="text-[10px] text-slate-400">Default: 123456</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password or PIN"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-700 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loginPhone.length < 10}
              className="w-full mt-2 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-brand-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                Don't have an account? Register with Name & Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
