import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import {
  customerService,
  AdminCustomerDetail,
  CustomerStats,
  PaginationInfo
} from '../../../services/customerService';
import { CustomerDetailsModal } from '../customers/CustomerDetailsModal';
import { RegisterCustomerModal } from '../customers/RegisterCustomerModal';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomerDetail[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    disabledCustomers: 0,
    totalCustomerSpend: 0,
    averageCustomerValue: 0
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Disabled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        search: searchTerm,
        status: statusFilter,
        page: currentPage,
        limit: pageSize
      });
      setCustomers(res.customers);
      setStats(res.stats);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  const handleToggleStatus = async (customerId: string, targetStatus?: 'Active' | 'Disabled') => {
    try {
      const updated = await customerService.toggleStatus(customerId, targetStatus);
      showToast(`Customer account is now ${updated.status}.`);
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer(updated);
      }
      loadCustomers();
    } catch (err: any) {
      alert(err?.message || 'Failed to update customer status.');
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
              <Users className="w-5 h-5" />
            </span>
            <span>Customer Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered shoppers directory, order history, address records & account lifecycle
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Customer</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-bold border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Password-Safe</span>
          </div>

          <button
            onClick={() => {
              loadCustomers();
              showToast('Customer directory refreshed.');
            }}
            title="Refresh customer list"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Customers
            </span>
            <span className="text-lg font-bold text-slate-900">{stats.totalCustomers}</span>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Shoppers
            </span>
            <span className="text-lg font-bold text-emerald-600">{stats.activeCustomers}</span>
          </div>
        </div>

        {/* Disabled Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Disabled Accounts
            </span>
            <span className="text-lg font-bold text-rose-600">{stats.disabledCustomers}</span>
          </div>
        </div>

        {/* Total Customer Spend */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Spending
            </span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(stats.totalCustomerSpend)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, phone, email, address..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Status Tabs & Page Size */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({stats.totalCustomers})
            </button>
            <button
              onClick={() => {
                setStatusFilter('Active');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'Active'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({stats.activeCustomers})
            </button>
            <button
              onClick={() => {
                setStatusFilter('Disabled');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'Disabled'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disabled ({stats.disabledCustomers})
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Total Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4 text-center">Last Order</th>
                <th className="py-3.5 px-4 text-center">Account Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading customer accounts...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <Users className="w-9 h-9 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No registered customers found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Real customers appear here when they register on the storefront or save their details at checkout. You can also register a real customer directly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerModalOpen(true)}
                      className="mt-3.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm active:scale-98"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register Customer</span>
                    </button>
                  </td>
                </tr>
              ) : (
                customers.map(cust => {
                  const isActive = cust.status === 'Active';

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setIsModalOpen(true);
                              }}
                              className="font-bold text-slate-900 hover:text-brand-700 transition text-left"
                            >
                              {cust.name}
                            </button>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                              {cust.address}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={`tel:${cust.phone}`}
                          className="font-bold text-slate-700 hover:text-brand-700 flex items-center gap-1.5"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cust.phone}</span>
                        </a>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="truncate max-w-[150px] block" title={cust.email}>
                          {cust.email}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                          {cust.totalOrders}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-slate-900">
                          {formatCurrency(cust.totalSpent)}
                        </span>
                      </td>

                      {/* Last Order */}
                      <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                        {cust.lastOrderDate ? (
                          <>
                            <span className="font-medium text-slate-800 block">
                              {new Date(cust.lastOrderDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(cust.lastOrderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">No orders yet</span>
                        )}
                      </td>

                      {/* Account Status Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cust.id, isActive ? 'Disabled' : 'Active')}
                          title={isActive ? 'Click to disable customer account' : 'Click to enable customer account'}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{cust.status}</span>
                        </button>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(cust.createdAt).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setIsModalOpen(true);
                            }}
                            title="View Customer Profile"
                            className="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cust.id, isActive ? 'Disabled' : 'Active')}
                            title={isActive ? 'Disable Customer' : 'Enable Customer'}
                            className={`p-1.5 rounded-lg transition ${
                              isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                    pagination.page === i + 1
                      ? 'bg-brand-700 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isModalOpen}
        customer={selectedCustomer}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Register Customer Modal */}
      <RegisterCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={(newCust) => {
          loadCustomers();
          showToast(`Customer "${newCust.name}" registered successfully.`);
        }}
      />
    </div>
  );
};
