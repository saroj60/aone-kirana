import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Briefcase,
  Bell,
  Shield,
  Save,
  Check,
  Smartphone,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  RefreshCw,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import {
  settingService,
  AllSettings,
  AdminSession,
  INITIAL_SETTINGS
} from '../../../services/settingService';

type SettingsTab = 'store' | 'delivery' | 'payment' | 'business' | 'notifications' | 'security';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [settings, setSettings] = useState<AllSettings>(INITIAL_SETTINGS);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  // Load settings and sessions
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedSessions] = await Promise.all([
        settingService.getSettings(),
        settingService.getSessions()
      ]);
      setSettings(fetchedSettings);
      setSessions(fetchedSessions);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const updated = await settingService.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Password Change Handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    if (newPassword !== confirmNewPassword) {
      setPassErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await settingService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      setPassSuccessMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPassErrorMsg(err?.message || 'Failed to update admin password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Logout other sessions
  const handleLogoutOtherSessions = async () => {
    if (!window.confirm('Are you sure you want to terminate all other active admin sessions?')) return;
    try {
      const res = await settingService.logoutAllSessions();
      alert(res.message);
      const updated = await settingService.getSessions();
      setSessions(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to logout sessions');
    }
  };

  const navItems: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'store', label: 'Store Information', icon: Store },
    { id: 'delivery', label: 'Delivery Rules', icon: Truck },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
    { id: 'business', label: 'Business & Tax', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Admin Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Store Settings & Configuration</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                  MongoDB Persisted
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage contact details, delivery parameters, payment providers, tax rules, and security
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            title="Refresh Settings"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-700' : ''}`} />
          </button>

          {activeTab !== 'security' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-700/10 transition active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Settings Layout: Left Nav Tabs + Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Vertical Nav Tabs */}
        <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-xs h-fit space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                  isActive
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Container */}
        <div className="lg:col-span-3 space-y-5">
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Settings updated and persisted to database successfully.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. STORE INFORMATION */}
          {activeTab === 'store' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Store Profile & Location</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Displayed on the customer storefront header, receipts, and order invoices
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Store Brand Name *
                  </label>
                  <input
                    type="text"
                    value={settings.store.name}
                    onChange={e =>
                      setSettings({ ...settings, store: { ...settings.store, name: e.target.value } })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Store Logo Path / URL
                  </label>
                  <input
                    type="text"
                    value={settings.store.logo}
                    onChange={e =>
                      setSettings({ ...settings, store: { ...settings.store, logo: e.target.value } })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Support Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={settings.store.phone}
                    onChange={e =>
                      setSettings({ ...settings, store: { ...settings.store, phone: e.target.value } })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Customer Support Email *
                  </label>
                  <input
                    type="email"
                    value={settings.store.email}
                    onChange={e =>
                      setSettings({ ...settings, store: { ...settings.store, email: e.target.value } })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Physical Store Address / Dispatch Hub *
                </label>
                <input
                  type="text"
                  value={settings.store.address}
                  onChange={e =>
                    setSettings({ ...settings, store: { ...settings.store, address: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Opening & Delivery Hours *
                </label>
                <input
                  type="text"
                  value={settings.store.openingHours}
                  onChange={e =>
                    setSettings({ ...settings, store: { ...settings.store, openingHours: e.target.value } })
                  }
                  placeholder="e.g. 6:30 AM – 9:30 PM (7 Days a Week)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* 2. DELIVERY RULES */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Delivery Parameters & Thresholds</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controls local radius fees, minimum free delivery qualifications, and checkout ETA
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Standard Delivery Fee (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.delivery.fee}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        delivery: { ...settings.delivery, fee: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default fee applied below free threshold</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Free Delivery Threshold (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.delivery.freeThreshold}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        delivery: { ...settings.delivery, freeThreshold: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Orders crossing this amount get Rs. 0 delivery</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Express Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={settings.delivery.radiusKm}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        delivery: { ...settings.delivery, radiusKm: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Operational radius centered around Tikathali hub</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Delivery Window
                  </label>
                  <input
                    type="text"
                    value={settings.delivery.estimatedTime}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        delivery: { ...settings.delivery, estimatedTime: e.target.value }
                      })
                    }
                    placeholder="e.g. 30–60 minutes"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Displayed on storefront banner and cart summary</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. PAYMENT GATEWAYS */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Payment Methods & Integration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle supported checkout options and configure merchant credentials
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Cash on Delivery */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Cash on Delivery (COD)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Customers pay in cash upon doorstep delivery</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.payment.cod.enabled}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            cod: { ...settings.payment.cod, enabled: e.target.checked }
                          }
                        })
                      }
                      className="w-4 h-4 text-brand-700 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                {/* eSewa */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>eSewa Mobile Wallet</span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-extrabold px-2 py-0.5 rounded-full">
                          Digital Wallet
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">Instant online payment through eSewa epay gateway</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={settings.payment.esewa.enabled}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              esewa: { ...settings.payment.esewa, enabled: e.target.checked }
                            }
                          })
                        }
                        className="w-4 h-4 text-brand-700 rounded border-slate-300 focus:ring-brand-500"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  {settings.payment.esewa.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          eSewa Merchant Code
                        </label>
                        <input
                          type="text"
                          value={settings.payment.esewa.merchantCode}
                          onChange={e =>
                            setSettings({
                              ...settings,
                              payment: {
                                ...settings.payment,
                                esewa: { ...settings.payment.esewa, merchantCode: e.target.value }
                              }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Khalti */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Khalti Digital Wallet</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                          Khalti SDK
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">Accept Khalti wallet balances and connected e-banking</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={settings.payment.khalti.enabled}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              khalti: { ...settings.payment.khalti, enabled: e.target.checked }
                            }
                          })
                        }
                        className="w-4 h-4 text-brand-700 rounded border-slate-300 focus:ring-brand-500"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  {settings.payment.khalti.enabled && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Khalti Live Public Key
                      </label>
                      <input
                        type="text"
                        value={settings.payment.khalti.publicKey}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              khalti: { ...settings.payment.khalti, publicKey: e.target.value }
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                {/* Card Payment */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Debit & Credit Card Payment</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                        Visa / Mastercard
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Accept card payments via Fonepay / SCT switch</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.payment.card.enabled}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            card: { ...settings.payment.card, enabled: e.target.checked }
                          }
                        })
                      }
                      className="w-4 h-4 text-brand-700 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4. BUSINESS & TAX */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Business, Currency & Invoice Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure store billing currency, tax rates, and invoice sequential prefixes
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Currency Symbol / Code *
                  </label>
                  <input
                    type="text"
                    value={settings.business.currency}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, currency: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: NPR (Rs.)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tax / VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.business.taxPercent}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, taxPercent: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">0% for daily raw essential groceries</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Invoice Order Prefix *
                  </label>
                  <input
                    type="text"
                    value={settings.business.invoicePrefix}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, invoicePrefix: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">E.g. AK- will generate #AK-9842</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Automated Alerts & Notifications</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure real-time notifications for incoming orders, low stock, and customer promos
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Order Notifications */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="font-bold text-slate-900 text-sm">Incoming Order Notifications</div>
                  <p className="text-slate-500">Alert store staff immediately when a customer places an order</p>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderEmail}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderEmail: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>Email Alerts</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderPush}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderPush: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>In-App Audio & Push Alerts</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderSms}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              orderSms: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>SMS to Dispatch Phone</span>
                    </label>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Low Stock Inventory Warnings</div>
                      <p className="text-slate-500 mt-0.5">Warn admin when product units drop below threshold</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={settings.notifications.lowStockAlerts}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              lowStockAlerts: e.target.checked
                            }
                          })
                        }
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  {settings.notifications.lowStockAlerts && (
                    <div className="pt-2 border-t border-slate-200/80 max-w-xs">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Default Stock Alert Threshold (Units)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settings.notifications.lowStockThreshold}
                        onChange={e =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              lowStockThreshold: Number(e.target.value)
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Promotional Broadcasts */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Promotional Broadcasts</div>
                    <p className="text-slate-500 mt-0.5">Send coupon and discount campaign updates to customers</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.notifications.promotionalBroadcasts}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            promotionalBroadcasts: e.target.checked
                          }
                        })
                      }
                      className="rounded border-slate-300 text-brand-700"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 6. SECURITY & SESSIONS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand-700" />
                    <span>Change Admin Password</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your account password with secure bcrypt hashing
                  </p>
                </div>

                {passSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{passSuccessMsg}</span>
                  </div>
                )}

                {passErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{passErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs max-w-md">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl pr-10 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl pr-10 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition disabled:opacity-50"
                  >
                    {isChangingPass ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Admin Sessions List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Active Admin Sessions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Devices currently authorized and signed in to the admin panel
                    </p>
                  </div>

                  <button
                    onClick={handleLogoutOtherSessions}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout All Other Sessions</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {sessions.map(sess => (
                    <div key={sess.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          {sess.device.includes('Mobile') || sess.device.includes('Android') ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Monitor className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                This Device (Active)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {sess.browser} • IP: {sess.ipAddress} • {sess.location}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <div>
                          Last Active:{' '}
                          <strong className="text-slate-700">
                            {new Date(sess.lastActive).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
