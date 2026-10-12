import React, { useState } from 'react';
import { IShop } from '../models/Shop';
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface AdminPortalProps {
  shops: IShop[];
  onUpdateStatus: (id: string, status: 'Verified' | 'Rejected') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ shops, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredShops = shops.filter((s) => {
    if (filter === 'All') return true;
    return s.status === filter;
  });

  const handleStatusChange = (shop: IShop, newStatus: 'Verified' | 'Rejected') => {
    onUpdateStatus(shop._id, newStatus);
    setActionNotice(
      `Shop "${shop.shopName}" (${shop.item}) was marked as ${newStatus}. ${
        newStatus === 'Verified'
          ? 'It is now immediately indexed in the Visitor BST search.'
          : 'It will not appear in the Visitor search.'
      }`
    );
    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  const pendingCount = shops.filter((s) => s.status === 'Pending').length;
  const verifiedCount = shops.filter((s) => s.status === 'Verified').length;
  const rejectedCount = shops.filter((s) => s.status === 'Rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            KumbhSetu Administration & Fair-Price Oversight
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            Service Verification Queue
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Review submitted stall services. Maximum prices are hardcoded by guardrail algorithm (
            <code className="bg-stone-100 text-orange-800 px-1 py-0.5 rounded font-mono text-xs">
              ceil(price * 1.5)
            </code>
            ) and cannot be tampered with.
          </p>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('Pending')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'Pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('Verified')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'Verified'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-green-50 text-green-900 border border-green-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setFilter('Rejected')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'Rejected'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'All'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            All ({shops.length})
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Security Banner */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>System Role Constraint (Requirement 4):</strong> Administrators can only
          <strong> Verify</strong> or <strong>Reject</strong> a service. The genuine price and
          system-calculated maximum permitted price are non-editable to preserve strict price integrity.
        </div>
      </div>

      {/* Table of Shops */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Shop & Owner</th>
                <th className="py-3.5 px-4">Item & Sector</th>
                <th className="py-3.5 px-4">Genuine Price</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1 text-orange-900">
                    <Lock className="w-3.5 h-3.5 text-orange-700" />
                    <span>Max Price (Locked)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <tr key={shop._id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Shop Name & Owner */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-900">{shop.shopName}</div>
                      <div className="text-stone-500 text-xs">{shop.ownerName}</div>
                      <div className="text-stone-400 text-[11px] truncate max-w-xs">{shop.address}</div>
                    </td>

                    {/* Item & Area */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-stone-800 bg-orange-50 text-orange-900 px-2 py-0.5 rounded border border-orange-200">
                          {shop.item}
                        </span>
                        {shop.type && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            shop.type === 'Food'
                              ? 'bg-amber-100 text-amber-800'
                              : shop.type === 'Lodging'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {shop.type}
                          </span>
                        )}
                      </div>
                      <div className="text-stone-500 text-xs mt-1">{shop.area}</div>
                    </td>

                    {/* Genuine Price */}
                    <td className="py-4 px-4 font-bold text-emerald-700">
                      ₹{shop.price}{' '}
                      <span className="text-[11px] font-normal text-stone-500">
                        /{shop.unit}
                      </span>
                    </td>

                    {/* Max Price (Locked) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-300">
                          ₹{shop.max_price}
                        </span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          (+50%)
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {shop.status === 'Verified' && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          Verified
                        </span>
                      )}
                      {shop.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending
                        </span>
                      )}
                      {shop.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-xs">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {shop.status !== 'Verified' && (
                          <button
                            onClick={() => handleStatusChange(shop, 'Verified')}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                            title="Approve and index in BST"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        )}
                        {shop.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(shop, 'Rejected')}
                            className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                            title="Reject service"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 text-sm">
                    No shops in this category ({filter}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
