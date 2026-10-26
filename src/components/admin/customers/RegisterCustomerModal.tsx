import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Compass
} from 'lucide-react';
import { customerService, AdminCustomerDetail } from '../../../services/customerService';

interface RegisterCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: AdminCustomerDetail) => void;
}

export const RegisterCustomerModal: React.FC<RegisterCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Ward 5, Tikathali Chowk, Lalitpur');
  const [landmark, setLandmark] = useState('');
  const [status, setStatus] = useState<'Active' | 'Disabled'>('Active');
  const [password, setPassword] = useState('password123');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please provide a full customer name (at least 2 characters).');
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).');
      return;
    }

    const trimmedAddress = address.trim() || 'Ward 5, Tikathali Chowk, Lalitpur';

    setIsSubmitting(true);
    try {
      const res = await customerService.saveRegisteredCustomer({
        name: trimmedName,
        fullName: trimmedName,
        phone: cleanPhone,
        email: email.trim() || `${cleanPhone}@aonekirana.np`,
        address: trimmedAddress,
        landmark: landmark.trim(),
        status
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to register customer. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server error occurred during customer registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Register Real Customer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a new customer directly to MongoDB database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-700" />
              <span>Customer Full Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Shrestha"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-700" />
              <span>Nepal Mobile Number</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                +977
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="98XXXXXXXX / 97XXXXXXXX"
                className="w-full pl-14 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">10-digit mobile number used for login and order updates.</p>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
              <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ramesh@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-700" />
              <span>Primary Delivery Address</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ward, Area, Municipality (e.g. Ward 5, Tikathali Chowk, Lalitpur)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Nearby Landmark / Tol / House No</span>
              <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              placeholder="e.g. Near Health Post / Opposite Big Mart"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
            />
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                onClick={() => setStatus('Active')}
                className={`px-3 py-2 rounded-xl border cursor-pointer text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  status === 'Active'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Account</span>
              </label>

              <label
                onClick={() => setStatus('Disabled')}
                className={`px-3 py-2 rounded-xl border cursor-pointer text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  status === 'Disabled'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Disabled</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Customer is immediately saved to MongoDB and ready for order placement.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Customer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
