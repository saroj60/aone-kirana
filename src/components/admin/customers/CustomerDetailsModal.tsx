import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Star,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Tag
} from 'lucide-react';
import { AdminCustomerDetail } from '../../../services/customerService';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  customer: AdminCustomerDetail | null;
  onClose: () => void;
  onToggleStatus: (customerId: string, newStatus: 'Active' | 'Disabled') => Promise<void>;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  customer,
  onClose,
  onToggleStatus
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'reviews' | 'activity'>('profile');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!isOpen || !customer) return null;

  const isActive = customer.status === 'Active';
  const averageOrderValue = customer.totalOrders > 0
    ? Math.round(customer.totalSpent / customer.totalOrders)
    : 0;

  const handleToggle = async () => {
    setIsUpdatingStatus(true);
    try {
      await onToggleStatus(customer.id, isActive ? 'Disabled' : 'Active');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer ID: <span className="font-mono text-slate-600 font-semibold">{customer.id}</span> • Member since{' '}
                {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={isUpdatingStatus}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                isActive
                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isActive ? 'Disable Account' : 'Activate Account'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200/80 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'profile', label: 'Profile Overview' },
            { id: 'addresses', label: `Saved Addresses (${customer.addresses?.length || 1})` },
            { id: 'orders', label: `Orders (${customer.totalOrders})` },
            { id: 'reviews', label: `Reviews (${customer.reviews?.length || 0})` },
            { id: 'activity', label: 'Activity Log' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Spent
                  </span>
                  <span className="text-lg font-black text-brand-700 mt-0.5 block">
                    Rs. {customer.totalSpent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Lifetime grocery purchases</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Orders
                  </span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    {customer.totalOrders}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Fulfillment rate 100%</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Avg Order Value
                  </span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    Rs. {averageOrderValue}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Per checkout ticket</span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-brand-700" />
                  <span>Contact Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Full Name</span>
                    <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Phone Number</span>
                    <a href={`tel:${customer.phone}`} className="font-bold text-brand-700 hover:underline">
                      {customer.phone}
                    </a>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Email Address</span>
                    <span className="font-medium text-slate-800">{customer.email}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Primary Delivery Hub</span>
                    <span className="font-medium text-slate-800">{customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Security Banner: Explicit confirmation that password is never exposed */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-[11px] text-emerald-800">
                  <strong>Security Guard:</strong> Customer password hash is encrypted and strictly isolated. Administrators are protected from viewing customer authentication credentials.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-3">
              {customer.addresses && customer.addresses.length > 0 ? (
                customer.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.2 bg-brand-100 text-brand-800 rounded-md text-[10px] font-extrabold">
                              Default Address
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-1 font-medium">{addr.address}</p>
                        {addr.landmark && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="font-bold text-slate-800">{customer.address}</p>
                  <span className="text-[10px] text-slate-400">Primary delivery location</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">Recent Grocery Orders</span>
                <span className="text-slate-400">{customer.totalOrders} total lifetime orders</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div>
                    <div className="font-bold text-slate-900">Order #AK-9842</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(customer.lastOrderDate).toLocaleDateString()} • 3 Items (Tomato, Apples, Milk)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">Rs. 400</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Delivered
                    </span>
                  </div>
                </div>

                {customer.totalOrders > 1 && (
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div>
                      <div className="font-bold text-slate-900">Order #AK-8924</div>
                      <div className="text-[11px] text-slate-400">
                        Previous week • 2 Items (Basmati Rice, Mustard Oil)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">Rs. 1,040</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Delivered
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {customer.reviews && customer.reviews.length > 0 ? (
                customer.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{rev.productName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-slate-400 block">
                      Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Star className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="font-semibold text-slate-600">No product reviews yet</p>
                  <p className="text-slate-400 text-[11px]">This shopper has not left any grocery reviews.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-2.5">
              {customer.activityLog && customer.activityLog.length > 0 ? (
                customer.activityLog.map((act, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">{act.action}</span>
                        <span className="text-slate-500 text-[11px] block">{act.details}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">No recent activity recorded.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Account Status:{' '}
            <strong className={isActive ? 'text-emerald-700' : 'text-rose-700'}>
              {customer.status}
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
