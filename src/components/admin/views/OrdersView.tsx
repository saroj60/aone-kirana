import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Truck,
  Ban,
  Printer,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
  Clock,
  AlertTriangle,
  ChevronRight,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import {
  adminOrderService,
  OrderStats
} from '../../../services/adminOrderService';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  DeliveryPerson
} from '../../../data/mockData';
import { OrderDetailsModal } from '../orders/OrderDetailsModal';
import { AssignRiderModal } from '../orders/AssignRiderModal';
import { CancelOrderModal } from '../orders/CancelOrderModal';
import { PrintInvoiceModal } from '../orders/PrintInvoiceModal';
import { realtimeService } from '../../../services/realtimeService';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    newOrders: 0,
    confirmedOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    outForDeliveryOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [orderForRider, setOrderForRider] = useState<Order | null>(null);
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);

  const [orderForCancel, setOrderForCancel] = useState<Order | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [orderForPrint, setOrderForPrint] = useState<Order | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await adminOrderService.getOrders({
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        paymentStatus: paymentStatusFilter,
        dateRange: dateRangeFilter,
        search: searchTerm
      });
      setOrders(res.orders);
      setStats(res.stats);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentMethodFilter, paymentStatusFilter, dateRangeFilter, searchTerm]);

  // Realtime synchronization: auto-reload when orders or deliveries are updated
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((msg) => {
      if (['ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'DELIVERY_STATUS_CHANGED', 'RIDER_ASSIGNED'].includes(msg.type)) {
        loadOrders();
      }
    });
    return () => unsubscribe();
  }, []);

  // Order status flow map for quick next actions
  const STATUS_FLOW: OrderStatus[] = [
    'New',
    'Confirmed',
    'Preparing',
    'Ready for Delivery',
    'Out for Delivery',
    'Delivered'
  ];

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
      return STATUS_FLOW[idx + 1];
    }
    return null;
  };

  const handleAdvanceStatus = async (order: Order, targetStatus?: OrderStatus) => {
    const next = targetStatus || getNextStatus(order.status);
    if (!next) return;

    try {
      const updated = await adminOrderService.updateOrderStatus(order.id, next);
      showToast(
        `Order #${order.orderNumber} moved to ${next}${
          next === 'Confirmed' ? ' (Warehouse stock allocated)' : ''
        }`
      );
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(updated);
      }
      loadOrders();
    } catch (e: any) {
      alert(e?.message || 'Failed to update order status');
    }
  };

  const handleAssignRider = async (orderId: string, rider: DeliveryPerson) => {
    try {
      const updated = await adminOrderService.assignDeliveryPerson(orderId, rider);
      showToast(`Assigned rider ${rider.name} to order #${updated.orderNumber}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      loadOrders();
    } catch (e) {
      alert('Failed to assign delivery rider');
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      const updated = await adminOrderService.updateOrderStatus(
        orderId,
        'Cancelled',
        undefined,
        reason
      );
      showToast(`Order #${updated.orderNumber} cancelled. Inventory stock restored to warehouse.`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      loadOrders();
    } catch (e: any) {
      alert(e?.message || 'Failed to cancel order');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const updated = await adminOrderService.updatePaymentStatus(orderId, paymentStatus);
      showToast(`Payment marked as ${paymentStatus} for order #${updated.orderNumber}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      loadOrders();
    } catch (e) {
      alert('Failed to update payment status');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ready for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getNextActionLabel = (next: OrderStatus) => {
    switch (next) {
      case 'Confirmed': return 'Confirm';
      case 'Preparing': return 'Pick Items';
      case 'Ready for Delivery': return 'Pack & Ready';
      case 'Out for Delivery': return 'Dispatch to Rider';
      case 'Delivered': return 'Mark Delivered';
      default: return 'Next Stage';
    }
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
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span>Order Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete lifecycle fulfillment: New → Confirmed → Preparing → Ready → Dispatch → Delivered
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadOrders();
              showToast('Orders refreshed from server');
            }}
            title="Refresh orders from database"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-700" />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-lg font-bold text-slate-900">{stats.totalOrders}</span>
          </div>
        </div>

        {/* New & Confirmed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Processing
            </span>
            <span className="text-lg font-bold text-indigo-600">
              {stats.newOrders + stats.confirmedOrders} Orders
            </span>
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Out for Delivery
            </span>
            <span className="text-lg font-bold text-orange-600">
              {stats.outForDeliveryOrders} Active
            </span>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Delivered
            </span>
            <span className="text-lg font-bold text-emerald-600">
              {stats.deliveredOrders} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'all', label: `All (${stats.totalOrders})` },
            { key: 'New', label: `New (${stats.newOrders})` },
            { key: 'Confirmed', label: `Confirmed (${stats.confirmedOrders})` },
            { key: 'Preparing', label: `Preparing (${stats.preparingOrders})` },
            { key: 'Ready for Delivery', label: `Ready (${stats.readyOrders})` },
            { key: 'Out for Delivery', label: `Dispatched (${stats.outForDeliveryOrders})` },
            { key: 'Delivered', label: `Delivered (${stats.deliveredOrders})` },
            { key: 'Cancelled', label: `Cancelled (${stats.cancelledOrders})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter.toLowerCase() === tab.key.toLowerCase()
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order # (e.g. AK-9842), customer name, phone, address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Method */}
            <select
              value={paymentMethodFilter}
              onChange={e => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Payment: All</option>
              <option value="COD">Cash on Delivery</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Fonepay">Fonepay</option>
            </select>

            {/* Payment Status */}
            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Payment Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRangeFilter}
              onChange={e => setDateRangeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Date: All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-center">Delivery Status</th>
                <th className="py-3.5 px-4">Delivery Partner</th>
                <th className="py-3.5 px-4">Date/Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading customer orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-bold text-slate-700 text-sm">
                      {searchTerm || statusFilter !== 'all' || paymentMethodFilter !== 'all' || paymentStatusFilter !== 'all' || dateRangeFilter !== 'all'
                        ? 'No orders matching your active filters'
                        : 'No customer orders placed yet'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchTerm || statusFilter !== 'all' || paymentMethodFilter !== 'all' || paymentStatusFilter !== 'all' || dateRangeFilter !== 'all'
                        ? 'Try resetting your filter options or search term above.'
                        : 'When real customers place orders from the store checkout, they will appear here dynamically in real-time.'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  const nextStatus = getNextStatus(order.status);
                  const isCancelled = order.status === 'Cancelled';
                  const isDelivered = order.status === 'Delivered';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order ID */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsOpen(true);
                          }}
                          className="font-black text-slate-900 hover:text-brand-700 transition"
                        >
                          #{order.orderNumber}
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{order.customerPhone}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[160px]">
                          {order.deliveryAddress}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                        <div className="flex items-center -space-x-1.5 mt-1">
                          {order.items.slice(0, 3).map((it: any, idx: number) => {
                            const img = it.product?.image || it.image || '/logo.png';
                            const title = it.product?.name || it.name || 'Product';
                            return (
                              <img
                                key={idx}
                                src={img}
                                alt={title}
                                className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs"
                                title={title}
                              />
                            );
                          })}
                          {order.items.length > 3 && (
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center border border-white">
                              +{order.items.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-slate-900 text-sm">
                          Rs. {order.total}
                        </div>
                        {order.deliveryFee === 0 ? (
                          <span className="text-[10px] text-emerald-600 font-bold">Free Delivery</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">+ Rs. {order.deliveryFee} ship</span>
                        )}
                      </td>

                      {/* Payment Method & Status */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block text-xs">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold mt-0.5 ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'Failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Assigned Rider */}
                      <td className="py-3.5 px-4">
                        {order.deliveryPerson || order.riderName ? (
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">
                              {order.deliveryPerson?.name || order.riderName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {order.deliveryPerson?.phone || order.riderPhone}
                            </span>
                          </div>
                        ) : !isCancelled && !isDelivered ? (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderForRider(order);
                              setIsRiderModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
                          >
                            + Assign
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Unassigned</span>
                        )}
                      </td>

                      {/* Date / Time */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Advance Status Button */}
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(order, nextStatus)}
                              className="px-2.5 py-1 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 active:scale-95"
                              title={`Advance to ${nextStatus}`}
                            >
                              <span>{getNextActionLabel(nextStatus)}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* View Order Modal */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                            title="View Order Details"
                            className="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Invoice */}
                          <button
                            type="button"
                            onClick={() => {
                              setOrderForPrint(order);
                              setIsPrintModalOpen(true);
                            }}
                            title="Print Tax Invoice"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Assign Rider */}
                          {!isCancelled && !isDelivered && (
                            <button
                              type="button"
                              onClick={() => {
                                setOrderForRider(order);
                                setIsRiderModalOpen(true);
                              }}
                              title="Assign Delivery Partner"
                              className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Cancel Order */}
                          {!isCancelled && !isDelivered && (
                            <button
                              type="button"
                              onClick={() => {
                                setOrderForCancel(order);
                                setIsCancelModalOpen(true);
                              }}
                              title="Cancel Order"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailsOpen}
        order={selectedOrder}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        onAdvanceStatus={handleAdvanceStatus}
        onOpenCancel={ord => {
          setIsDetailsOpen(false);
          setOrderForCancel(ord);
          setIsCancelModalOpen(true);
        }}
        onOpenAssignRider={ord => {
          setIsDetailsOpen(false);
          setOrderForRider(ord);
          setIsRiderModalOpen(true);
        }}
        onOpenPrintInvoice={ord => {
          setOrderForPrint(ord);
          setIsPrintModalOpen(true);
        }}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />

      {/* Assign Rider Modal */}
      <AssignRiderModal
        isOpen={isRiderModalOpen}
        order={orderForRider}
        onClose={() => {
          setIsRiderModalOpen(false);
          setOrderForRider(null);
        }}
        onAssign={handleAssignRider}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={orderForCancel}
        onClose={() => {
          setIsCancelModalOpen(false);
          setOrderForCancel(null);
        }}
        onConfirmCancel={handleCancelOrder}
      />

      {/* Print Invoice Modal */}
      <PrintInvoiceModal
        isOpen={isPrintModalOpen}
        order={orderForPrint}
        onClose={() => {
          setIsPrintModalOpen(false);
          setOrderForPrint(null);
        }}
      />
    </div>
  );
};
