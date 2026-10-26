import React, { useState } from 'react';
import { ShoppingBag, Bike, Phone, KeyRound, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { deliveryService, DeliveryPerson, INITIAL_RIDERS } from '../../services/deliveryService';

interface RiderLoginViewProps {
  onLoginSuccess: (rider: DeliveryPerson) => void;
  onBackToStore: () => void;
}

export const RiderLoginView: React.FC<RiderLoginViewProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your registered mobile number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await deliveryService.riderLogin(phone, pin);
      if (res.success && res.rider) {
        onLoginSuccess(res.rider);
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (rider: DeliveryPerson) => {
    setPhone(rider.phone);
    setPin('1234');
    setIsLoading(true);
    setError(null);
    try {
      const res = await deliveryService.riderLogin(rider.phone, '1234');
      if (res.success && res.rider) {
        onLoginSuccess(res.rider);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between py-6 px-4">
      {/* Top Bar Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Aone Kirana"
            className="w-9 h-9 object-contain rounded-xl flex-shrink-0"
          />
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">Aone Kirana</span>
            <span className="block text-[10px] text-purple-300 font-semibold tracking-wider uppercase">
              Rider Fleet Portal
            </span>
          </div>
        </div>

        <button
          onClick={onBackToStore}
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >
          Customer Store
        </button>
      </div>

      {/* Main Login Form Card */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Hero Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-purple-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-900/30 mb-3 border border-purple-400/30">
              <Bike className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Delivery Partner Login</h2>
            <p className="text-xs text-slate-400 mt-1">
              Tikathali & Lalitpur Local Delivery Network
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 9801122334"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  4-Digit Security PIN
                </label>
                <span className="text-[10px] text-purple-300 font-semibold">(Default: 1234)</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-700 hover:bg-brand-600 disabled:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 active:scale-98 transition mt-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Rider Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Partner (1-Click Test)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                Online Hub
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_RIDERS.map(rider => (
                <button
                  key={rider.id}
                  type="button"
                  onClick={() => handleQuickLogin(rider)}
                  className="p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-700/80 hover:border-brand-500/80 rounded-2xl text-left transition flex items-center gap-2.5 group cursor-pointer"
                >
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">
                      {rider.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {rider.phone} • {rider.completedDeliveries} Trips
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center text-slate-500 text-xs flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
        <span>Aone Kirana Express Partner Network • Tikathali Hub</span>
      </div>
    </div>
  );
};
