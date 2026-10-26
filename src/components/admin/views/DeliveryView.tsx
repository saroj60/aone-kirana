import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Phone,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Settings2,
  Package,
  XCircle,
  Navigation,
  Compass,
  Bike
} from 'lucide-react';
import {
  deliveryService,
  DeliveryPerson,
  DeliveryOrder,
  DeliveryZone,
  DeliveryHistoryTrip,
  DeliveryDashboardStats,
  OrderDeliveryStatus
} from '../../../services/deliveryService';
import { AddRiderModal } from '../delivery/AddRiderModal';
import { DispatchOrderModal } from '../delivery/DispatchOrderModal';
import { ZoneSettingsModal } from '../delivery/ZoneSettingsModal';

export const DeliveryView: React.FC = () => {
  // Data state
  const [stats, setStats] = useState<DeliveryDashboardStats>({
    pendingDeliveries: 0,
    activeDeliveries: 0,
    completedToday: 0,
    availableRiders: 0,
    totalRiders: 0,
    totalZones: 0
  });
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [riders, setRiders] = useState<DeliveryPerson[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [history, setHistory] = useState<DeliveryHistoryTrip[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dispatches' | 'riders' | 'zones' | 'history'>('dispatches');

  // Filters for deliveries
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Modals state
  const [isAddRiderOpen, setIsAddRiderOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState<DeliveryOrder | null>(null);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Failure prompt modal / note
  const [failingOrderId, setFailingOrderId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState('Customer unreachable at delivery address');

  // Load data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getDashboardData();
      setStats(data.stats);
      setDeliveries(data.deliveries);
      setRiders(data.riders);
      setZones(data.zones);

      const historyData = await deliveryService.getHistory();
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load delivery data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered deliveries list
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.deliveryStatus === statusFilter;
      const matchesZone = zoneFilter === 'all' || order.zone === zoneFilter;

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [deliveries, searchTerm, statusFilter, zoneFilter]);

  // Handle Dispatch confirmation
  const handleConfirmDispatch = async (orderId: string, riderId: string) => {
    await deliveryService.assignRider(orderId, riderId);
    await fetchData();
  };

  // Quick Status Advance
  const handleAdvanceStatus = async (order: DeliveryOrder, nextStatus: OrderDeliveryStatus) => {
    try {
      await deliveryService.updateStatus(order.id, nextStatus);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || 'Failed to update delivery status');
    }
  };

  // Submit Failure
  const handleConfirmFailure = async () => {
    if (!failingOrderId) return;
    try {
      await deliveryService.updateStatus(failingOrderId, 'Failed', failureReason);
      setFailingOrderId(null);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || 'Failed to record failed delivery');
    }
  };

  // Quick Rider Status Change
  const handleRiderStatusToggle = async (rider: DeliveryPerson, newStatus: DeliveryPerson['status']) => {
    // If the rider has active deliveries, caution if marking Off Duty
    if (rider.currentAssignedOrders.length > 0 && newStatus === 'Off Duty') {
      const confirmed = window.confirm(
        `${rider.name} has active assigned orders (${rider.currentAssignedOrders.join(', ')}). Are you sure you want to mark them Off Duty?`
      );
      if (!confirmed) return;
    }
    rider.status = newStatus;
    setRiders([...riders]);
    // Save to storage/backend
    try {
      const updatedList = riders.map(r => (r.id === rider.id ? { ...r, status: newStatus } : r));
      localStorage.setItem('aone_delivery_riders_v1', JSON.stringify(updatedList));
      await fetchData();
    } catch (e) {
      console.warn(e);
    }
  };

  // Helper status color classes
  const getStatusBadge = (status: OrderDeliveryStatus) => {
    switch (status) {
      case 'Waiting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Picked Up':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Failed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Delivery & Fleet Management</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                  Local Express
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Local dispatch operations & fleet tracking for Tikathali, Mahalaxmi, Imadol & Gwarko
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            title="Refresh Deliveries"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-700' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddRiderOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-700/10 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Delivery Partner</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Deliveries */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Deliveries</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.pendingDeliveries}</div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Awaiting dispatch / assignment</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deliveries</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{stats.activeDeliveries}</div>
            <p className="text-[11px] text-brand-600 font-semibold mt-1 flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-spin text-brand-600" />
              <span>Currently on the road</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Today</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.completedToday}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Fulfilled successfully</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Available Riders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Fleet</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.availableRiders}
              <span className="text-sm font-semibold text-slate-400 ml-1.5">/ {stats.totalRiders}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
              <Bike className="w-3 h-3 text-slate-400" />
              <span>{stats.totalZones} local zones active</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('dispatches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'dispatches'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Dispatches & Orders</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'dispatches' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {deliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('riders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'riders'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Delivery Fleet & Riders</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'riders' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {riders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'zones'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Zones & Fees</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'zones' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {zones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Trip & Delivery History</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {history.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ACTIVE DISPATCHES */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by order number (e.g. AK-9842), customer, address..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Delivery Statuses</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500">Zone:</span>
                <select
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Zones</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Deliveries Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order & Time</th>
                    <th className="py-3.5 px-4">Customer & Location</th>
                    <th className="py-3.5 px-4">Zone & Radius</th>
                    <th className="py-3.5 px-4">Assigned Partner</th>
                    <th className="py-3.5 px-4">Delivery Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">No active delivery orders match filters</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          New orders placed by customers will automatically appear here for dispatch.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition">
                        {/* Order & Time */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm">#{order.orderNumber}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                            {order.itemsCount} items
                          </div>
                          <div className="text-[11px] font-bold text-brand-700 mt-0.5">
                            Rs. {order.total}{' '}
                            <span className="text-[10px] font-normal text-slate-400">({order.paymentMethod})</span>
                          </div>
                        </td>

                        {/* Customer & Location */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span title={order.deliveryAddress}>{order.deliveryAddress}</span>
                          </div>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-[11px] text-brand-700 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </a>
                        </td>

                        {/* Zone */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700 block truncate max-w-[180px]" title={order.zone}>
                            {order.zone}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-200">
                            {order.deliveryFee === 0 ? 'FREE Delivery' : `Fee: Rs. ${order.deliveryFee}`}
                          </span>
                        </td>

                        {/* Assigned Partner */}
                        <td className="py-3.5 px-4">
                          {order.assignedRiderId ? (
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Bike className="w-3.5 h-3.5 text-brand-700" />
                                <span>{order.riderName}</span>
                              </div>
                              {order.riderPhone && (
                                <a
                                  href={`tel:${order.riderPhone}`}
                                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 mt-0.5"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{order.riderPhone}</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-block ${getStatusBadge(
                              order.deliveryStatus
                            )}`}
                          >
                            {order.deliveryStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If Waiting, show Dispatch button */}
                            {order.deliveryStatus === 'Waiting' && (
                              <button
                                onClick={() => setDispatchOrder(order)}
                                className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Assign Rider</span>
                              </button>
                            )}

                            {/* If Assigned, allow Picked Up */}
                            {order.deliveryStatus === 'Assigned' && (
                              <button
                                onClick={() => handleAdvanceStatus(order, 'Picked Up')}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                              >
                                <span>Picked Up</span>
                              </button>
                            )}

                            {/* If Picked Up, allow Out for Delivery */}
                            {order.deliveryStatus === 'Picked Up' && (
                              <button
                                onClick={() => handleAdvanceStatus(order, 'Out for Delivery')}
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Out for Delivery</span>
                              </button>
                            )}

                            {/* If Out for Delivery, allow Mark Delivered or Failed */}
                            {order.deliveryStatus === 'Out for Delivery' && (
                              <>
                                <button
                                  onClick={() => handleAdvanceStatus(order, 'Delivered')}
                                  title="Confirm delivery completion"
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Delivered</span>
                                </button>
                                <button
                                  onClick={() => setFailingOrderId(order.id)}
                                  title="Mark Delivery as Failed"
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                                >
                                  Failed
                                </button>
                              </>
                            )}

                            {/* If already Delivered or Failed, show status note */}
                            {(order.deliveryStatus === 'Delivered' || order.deliveryStatus === 'Failed') && (
                              <span className="text-[11px] text-slate-400 font-medium">Archived to trip history</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERY FLEET & RIDERS */}
      {activeTab === 'riders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Fleet & Dispatch Riders</h3>
              <p className="text-xs text-slate-400">
                Manage on-duty status, current assignments, and view lifetime performance
              </p>
            </div>
            <button
              onClick={() => setIsAddRiderOpen(true)}
              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riders.map(rider => (
              <div
                key={rider.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-brand-300 transition"
              >
                <div>
                  {/* Top Status & Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <select
                      value={rider.status}
                      onChange={e =>
                        handleRiderStatusToggle(rider, e.target.value as DeliveryPerson['status'])
                      }
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-hidden ${
                        rider.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : rider.status === 'On Delivery'
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : rider.status === 'Busy'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="On Delivery">On Delivery</option>
                      <option value="Busy">Busy</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>

                    <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rider.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Rider Profile Card */}
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-100 shadow-xs"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{rider.name}</h4>
                      <a
                        href={`tel:${rider.phone}`}
                        className="text-xs text-brand-700 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{rider.phone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">{rider.vehicle}</span>
                  </div>

                  {/* Performance stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Active Orders</div>
                      <div className="text-sm font-black text-brand-700">{rider.currentAssignedOrders.length}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Completed</div>
                      <div className="text-sm font-black text-emerald-700">{rider.completedDeliveries}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {rider.coordinates ? 'GPS Online' : 'Standard Cell'}
                  </span>
                  <a
                    href={`tel:${rider.phone}`}
                    className="font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                  >
                    <span>Direct Call</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY ZONES & FEES */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delivery Zones, Radius & Minimum Order Rules</h3>
              <p className="text-xs text-slate-400">
                Configure local service radius from Tikathali main store hub, standard delivery fee and free delivery thresholds
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map(zone => (
              <div
                key={zone.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-brand-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        zone.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {zone.isActive ? 'Active Delivery Zone' : 'Zone Inactive'}
                    </span>
                    <button
                      onClick={() => setEditingZone(zone)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-xl transition"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-700" />
                    <span>{zone.name}</span>
                  </h4>

                  {/* Zone metrics grid */}
                  <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Coverage</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">{zone.radiusKm} km radius</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Standard Fee</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {zone.baseFee === 0 ? 'FREE' : `Rs. ${zone.baseFee}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Free Above</div>
                      <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                        Rs. {zone.freeDeliveryThreshold}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Duration */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimated Delivery Window: <strong className="text-slate-800">{zone.estimatedTime}</strong></span>
                  </div>

                  {/* Covered areas pills */}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Covered Local Sectors
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.areas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-medium transition"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hub Coordinates: 27.6588° N, 85.3524° E</span>
                  <span className="font-semibold text-emerald-600">Local Dispatch Enabled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRIP & DELIVERY HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Completed & Fulfilled Delivery Runs</h3>
              <p className="text-xs text-slate-400">
                Log of past trips, customer handover status, duration, and collected fees
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer & Drop Address</th>
                    <th className="py-3.5 px-4">Zone</th>
                    <th className="py-3.5 px-4">Rider / Vehicle</th>
                    <th className="py-3.5 px-4">Trip Duration</th>
                    <th className="py-3.5 px-4">Delivery Status</th>
                    <th className="py-3.5 px-4 text-right">Fee / Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No delivery trip history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    history.map(trip => (
                      <tr key={trip.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          #{trip.orderNumber}
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                            {new Date(trip.deliveredAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-800">{trip.customerName}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{trip.deliveryAddress}</div>
                          <div className="text-[10px] text-slate-400">{trip.customerPhone}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">{trip.zone}</td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{trip.riderName}</div>
                          <div className="text-[10px] text-slate-400">{trip.vehicle}</div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{trip.durationMins} mins</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-block ${
                              trip.deliveryStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {trip.deliveryStatus}
                          </span>
                          {trip.failureReason && (
                            <div className="text-[10px] text-rose-600 font-medium mt-1">
                              Reason: {trip.failureReason}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-black text-slate-900">Rs. {trip.totalAmount}</div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            {trip.deliveryFee === 0 ? 'FREE' : `+Rs. ${trip.deliveryFee} Fee`}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Rider Modal */}
      <AddRiderModal
        isOpen={isAddRiderOpen}
        onClose={() => setIsAddRiderOpen(false)}
        onSuccess={newRider => {
          setRiders(prev => [newRider, ...prev]);
          fetchData();
        }}
      />

      {/* 2. Dispatch Order Modal */}
      <DispatchOrderModal
        isOpen={!!dispatchOrder}
        order={dispatchOrder}
        riders={riders}
        onClose={() => setDispatchOrder(null)}
        onConfirm={handleConfirmDispatch}
      />

      {/* 3. Zone Settings Modal */}
      <ZoneSettingsModal
        isOpen={!!editingZone}
        zone={editingZone}
        onClose={() => setEditingZone(null)}
        onSuccess={updated => {
          setZones(prev => prev.map(z => (z.id === updated.id ? updated : z)));
          fetchData();
        }}
      />

      {/* 4. Record Delivery Failure Modal */}
      {failingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Mark Delivery as Failed</h3>
                <p className="text-xs text-slate-400">Order handover could not be completed</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Failure Reason / Note
              </label>
              <textarea
                rows={3}
                value={failureReason}
                onChange={e => setFailureReason(e.target.value)}
                placeholder="e.g. Customer unreachable, wrong address, customer cancelled at door..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFailingOrderId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFailure}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Confirm Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
