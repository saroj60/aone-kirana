import React from 'react';
import { X, Printer, ShoppingBag, CheckCircle } from 'lucide-react';
import { Order } from '../../../data/mockData';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  order,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[95vh] flex flex-col">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-700" />
            <span className="font-bold text-slate-800 text-xs">Customer Tax Invoice Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 overflow-y-auto flex-1 font-sans text-slate-800">
          {/* Store Brand Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex items-center justify-center font-black text-sm">
                  A1
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  AONE KIRANA STORE
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Fresh Groceries, Staples & Daily Essentials Delivery
              </p>
              <p className="text-xs text-slate-500">
                Ward 5, Tikathali Chowk, Mahalaxmi, Lalitpur, Nepal
              </p>
              <p className="text-xs text-slate-500">
                PAN No: <strong>609823412</strong> • Tel: <strong>01-5912345 / 9841234567</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider mb-1">
                TAX INVOICE
              </span>
              <p className="font-mono text-sm font-bold text-slate-900">{invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-0.5">Order: #{order.orderNumber}</p>
              <p className="text-xs text-slate-500">Date: {orderDate} • {orderTime}</p>
            </div>
          </div>

          {/* Customer & Billing Details */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                DELIVER TO:
              </span>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">{order.deliveryAddress}</p>
              <p className="text-slate-600 font-semibold mt-0.5">Phone: {order.customerPhone}</p>
              {order.customerEmail && <p className="text-slate-500">{order.customerEmail}</p>}
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                PAYMENT & DISPATCH:
              </span>
              <p className="font-semibold text-slate-800">
                Method: <strong>{order.paymentMethod}</strong>
              </p>
              <p className="text-slate-600 mt-0.5">
                Status:{' '}
                <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>
                  {order.paymentStatus || 'Pending'}
                </strong>
              </p>
              <p className="text-slate-600 mt-0.5">
                Delivery: <strong>Express (Within 45 mins)</strong>
              </p>
              {order.riderName && (
                <p className="text-slate-500 mt-0.5">
                  Partner: {order.riderName} ({order.riderPhone})
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-2 w-8">#</th>
                  <th className="pb-2">Item Description</th>
                  <th className="pb-2 text-center w-24">Unit</th>
                  <th className="pb-2 text-right w-24">Price (Rs.)</th>
                  <th className="pb-2 text-center w-20">Qty</th>
                  <th className="pb-2 text-right w-28">Total (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item: any, idx: number) => {
                  const prod = item.product || {};
                  const name = prod.name || item.name || 'Product';
                  const unit = prod.unit || item.unit || '1 pc';
                  const price = prod.price !== undefined ? prod.price : item.price || 0;
                  const qty = item.quantity || 1;

                  return (
                    <tr key={idx} className="py-2.5">
                      <td className="py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 font-bold text-slate-900">{name}</td>
                      <td className="py-2.5 text-center text-slate-500">{unit}</td>
                      <td className="py-2.5 text-right text-slate-600">{price}</td>
                      <td className="py-2.5 text-center font-bold text-slate-800">{qty}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {price * qty}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="pt-4 border-t-2 border-slate-200 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Rs. {order.subtotal}</span>
              </div>

              {order.discount ? (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>- Rs. {order.discount}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="text-brand-800">Rs. {order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer Receipt Note */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center text-[11px] text-slate-400">
            <p className="font-semibold text-slate-700">
              Thank you for shopping with Aone Kirana!
            </p>
            <p className="mt-0.5">
              Goods once received can be replaced within 24 hours in case of quality issues.
            </p>
            <p className="mt-0.5 font-mono text-[10px]">
              aonekirana.com • Customer Support: +977 9841234567
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
