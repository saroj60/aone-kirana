import React, { useState } from 'react';
import { X, MapPin, Clock, CreditCard, CheckCircle2, ShieldCheck, User, Save, Edit3, AlertCircle, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { cart, subtotal, deliveryFee, finalTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();
  const { user, profile } = useAuth();

  // Load existing saved customer name/phone if previously saved
  const savedName = localStorage.getItem('aone_customer_name') || profile?.fullName || '';
  const savedPhone = localStorage.getItem('aone_customer_phone') || profile?.phone || '';

  const [customerName, setCustomerName] = useState(savedName);
  const [customerPhone, setCustomerPhone] = useState(savedPhone);
  const [specificAddress, setSpecificAddress] = useState(profile?.address || selectedLocation.landmark || '');
  const [isContactSaved, setIsContactSaved] = useState(() => {
    return Boolean(savedName.trim() && savedPhone.trim().length >= 10);
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const [deliverySlot, setDeliverySlot] = useState<'express' | 'evening'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'eSewa' | 'Khalti' | 'Fonepay'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate and save contact details
  const handleSaveContact = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setContactError(null);

    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();

    if (!trimmedName) {
      setContactError('Please enter your full name');
      return false;
    }

    // Nepal phone validation: 10 digits
    const phoneClean = trimmedPhone.replace(/\D/g, '');
    if (phoneClean.length !== 10) {
      setContactError('Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX)');
      return false;
    }

    // Save to localStorage
    localStorage.setItem('aone_customer_name', trimmedName);
    localStorage.setItem('aone_customer_phone', trimmedPhone);

    // Also persist customer to Admin database / storage
    customerService.saveRegisteredCustomer({
      fullName: trimmedName,
      phone: trimmedPhone,
      address: `${selectedLocation.address || selectedLocation.name}${specificAddress ? `, ${specificAddress}` : ''}`
    });

    setIsContactSaved(true);
    setIsEditingContact(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure name and phone are saved before proceeding
    if (!isContactSaved || isEditingContact) {
      const saved = handleSaveContact();
      if (!saved) return;
    }

    setIsSubmitting(true);

    try {
      await placeOrder({
        items: cart,
        subtotal,
        deliveryFee,
        total: finalTotal,
        deliveryAddress: `${selectedLocation.address || selectedLocation.name}${selectedLocation.landmark ? ` (Landmark: ${selectedLocation.landmark})` : ''}${specificAddress ? `, ${specificAddress}` : ''}`,
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim(),
        paymentMethod,
        deliverySlot,
        userId: user?.id || null
      });

      clearCart();
      onSuccess();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-popover flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-fadeIn" style={{ zIndex: 1100 }}>
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Checkout & Delivery</h3>
            <p className="text-xs text-slate-500">Fast delivery straight to your doorstep</p>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          {/* Customer Details Section */}
          {isContactSaved && !isEditingContact ? (
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Contact Details Saved</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Saved
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{customerName}</p>
                  <p className="text-xs font-semibold text-slate-600">+977 {customerPhone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingContact(true)}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          ) : (
            <div className="bg-brand-50/40 p-4 rounded-2xl border-2 border-brand-200 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-700" />
                  <span>Enter & Save Name and Number</span>
                </h4>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-full border border-brand-200">
                  Required to order
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => {
                      setCustomerName(e.target.value);
                      if (contactError) setContactError(null);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mobile Number (Nepal) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => {
                      setCustomerPhone(e.target.value);
                      if (contactError) setContactError(null);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    placeholder="98XXXXXXXX / 97XXXXXXXX"
                    maxLength={10}
                  />
                </div>
              </div>

              {contactError && (
                <div className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              {saveSuccessNotice && (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                  <span>Name and number saved successfully!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Name & Number</span>
              </button>
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Address</h4>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-[11px] text-brand-700 font-bold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[180px]">
                  {selectedLocation.address || selectedLocation.name || 'Detect or Save Location'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Change</span>
              </button>
            </div>

            {(!selectedLocation.address || selectedLocation.address === '') && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                <span>Please confirm or detect your current location.</span>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg"
                >
                  Set Location
                </button>
              </div>
            )}

            <input
              type="text"
              required
              value={specificAddress}
              onChange={e => setSpecificAddress(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-600"
              placeholder="House number, Tol, or nearby Landmark"
            />

            {/* Single Store Hub Coverage Badge */}
            <div className="bg-purple-50/80 border border-purple-200/80 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-brand-900 font-semibold">
              <span className="flex items-center gap-1.5 truncate">
                <Store className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                <span className="truncate">Fulfilled by <strong>Aone Kirana Central Store</strong> (Tikathali)</span>
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md font-bold shrink-0">
                6 km Coverage
              </span>
            </div>
          </div>

          {/* Delivery Slot */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Speed</h4>
            <div className="grid grid-cols-2 gap-2">
              <label
                onClick={() => setDeliverySlot('express')}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-start gap-1 transition ${
                  deliverySlot === 'express'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Express Delivery</span>
                </div>
                <span className="text-[11px] text-brand-700 font-semibold">30–60 Minutes</span>
              </label>

              <label
                onClick={() => setDeliverySlot('evening')}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-start gap-1 transition ${
                  deliverySlot === 'evening'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Evening Slot</span>
                </div>
                <span className="text-[11px] text-slate-500">Today 5:00 PM – 7:00 PM</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Option</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'COD', label: 'Cash on Delivery', sub: 'Pay at door' },
                { id: 'eSewa', label: 'eSewa', sub: 'Digital Wallet', color: 'text-green-600' },
                { id: 'Khalti', label: 'Khalti', sub: 'Instant Pay', color: 'text-purple-600' },
                { id: 'Fonepay', label: 'Fonepay QR', sub: 'Scan & Pay', color: 'text-rose-600' }
              ].map(opt => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200 font-bold text-brand-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{opt.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Submit */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-slate-500">Total Payable Amount:</span>
              <span className="text-lg font-black text-brand-700">Rs. {finalTotal}</span>
            </div>

            {isContactSaved && !isEditingContact ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-700 hover:bg-brand-800 active:scale-98 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Placing your order...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Place Order (Rs. {finalTotal})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full py-3 bg-brand-700 hover:bg-brand-800 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Name & Number to Place Order</span>
              </button>
            )}

            <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              Verified & Guaranteed Fresh by Aone Kirana Store
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
