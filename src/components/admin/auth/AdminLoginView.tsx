import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Store,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  HelpCircle,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

interface AdminLoginViewProps {
  onSuccess?: () => void;
  onExitToStorefront: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onSuccess,
  onExitToStorefront
}) => {
  const { login, requestPasswordReset, isLoading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & Error states
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Real-time client-side validation
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    try {
      const res = await login({
        email: email.trim(),
        password,
        rememberMe
      });

      if (res.success) {
        onSuccess?.();
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    }
  };

  const handleDemoCredentials = () => {
    setEmail('admin@aonekirana.com');
    setPassword('admin123');
    setValidationErrors({});
    setErrorMessage(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetStatus('Please enter a valid administrator email.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await requestPasswordReset(resetEmail.trim());
      setResetStatus(res.message);
    } catch (err: any) {
      setResetStatus('Unable to process password reset. Please try again.');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Aone Kirana Logo"
            className="w-20 h-20 object-contain rounded-2xl mx-auto mb-3 drop-shadow-md hover:scale-105 transition-transform"
          />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Aone Kirana Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Restricted access for store managers & inventory controllers
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
            <span>JWT Secure Authentication</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Authentication Error</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="admin@aonekirana.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition ${
                    validationErrors.email
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-bold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter administrator password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition ${
                    validationErrors.password
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-brand-500 focus:border-brand-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 rounded-lg transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-brand-700 border-slate-300 focus:ring-brand-500 accent-brand-700 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-600">Remember me for 7 days</span>
              </label>
            </div>

            {/* Login Button with Loading State */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition duration-150 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-700 block text-[11px]">Developer / Testing Credentials:</span>
                <span className="text-slate-500 text-[10px] block font-mono">admin@aonekirana.com • admin123</span>
              </div>
              <button
                type="button"
                onClick={handleDemoCredentials}
                className="px-2.5 py-1 bg-white hover:bg-brand-50 text-brand-800 border border-brand-200 rounded-lg text-[10px] font-extrabold shadow-2xs transition active:scale-95 whitespace-nowrap"
              >
                Autofill
              </button>
            </div>
          </div>
        </div>

        {/* Back to Customer Storefront Link */}
        <div className="text-center mt-5">
          <button
            onClick={onExitToStorefront}
            className="text-xs font-bold text-slate-600 hover:text-brand-800 inline-flex items-center gap-1.5 transition"
          >
            <span>Return to Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Reset Admin Password</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetStatus(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="mt-4 space-y-3">
              <p className="text-xs text-slate-500">
                Enter your registered administrator email to receive secure recovery credentials.
              </p>

              <div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="admin@aonekirana.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {resetStatus && (
                <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-700 flex-shrink-0" />
                  <span>{resetStatus}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isSubmittingReset ? 'Dispatching...' : 'Send Recovery Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
