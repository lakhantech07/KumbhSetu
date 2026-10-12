import React, { useState } from 'react';
import { IShop, CreateShopInput } from '../models/Shop';
import {
  Store,
  Lock,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface OwnerPortalProps {
  onAddShop: (input: CreateShopInput) => IShop;
  allShops: IShop[];
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({ onAddShop, allShops }) => {
  const [serviceType, setServiceType] = useState<'Food' | 'Lodging' | 'Transport'>('Food');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [item, setItem] = useState('');
  const [area, setArea] = useState('Panchavati');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState<string>('20');
  const [unit, setUnit] = useState('per piece');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live max_price based on genuine price
  const numericPrice = parseFloat(price);
  const calculatedMaxPrice =
    !isNaN(numericPrice) && numericPrice > 0 ? Math.ceil(numericPrice * 1.5) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!shopName.trim()) {
      setErrorMessage('Please enter your shop, hotel, or service name.');
      return;
    }
    if (!item.trim()) {
      setErrorMessage('Please enter the service or item name.');
      return;
    }
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Please enter a valid genuine reference price greater than 0.');
      return;
    }

    try {
      const created = onAddShop({
        shopName: shopName.trim(),
        ownerName: ownerName.trim() || 'Service Provider',
        type: serviceType,
        item: item.trim(),
        area: area.trim(),
        address: address.trim() || `${area}, Nashik`,
        price: numericPrice,
        unit: unit.trim(),
      });

      setSuccessMessage(
        `Service "${created.item}" for "${created.shopName}" registered! Status is "Pending" with system-locked Max Price ₹${created.max_price}. Admin will verify shortly.`
      );

      // Reset form
      setShopName('');
      setOwnerName('');
      setItem('');
      setAddress('');
      setPrice('20');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to register service.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-amber-300">
          <Store className="w-3.5 h-3.5 text-amber-700" />
          KumbhSetu Vendor & Stall Portal
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Register Your Store Item & Genuine Price
        </h2>
        <p className="text-stone-600 text-sm max-w-3xl">
          Enter your reference genuine cost. Under Kumbh Mela fair-pricing regulations, the system automatically calculates and locks the ceiling price at <strong>50% above genuine price</strong>. Submitted items remain <strong>Pending</strong> until administrative verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-stone-200 space-y-6">
          <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-orange-600" />
            New Service Registration
          </h3>

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Shop / Stall Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumbh Snacks Corner"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Owner / Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rameshwar Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-orange-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Category Type Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Service Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Food', 'Lodging', 'Transport'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setServiceType(cat);
                      if (cat === 'Food') setUnit('per plate');
                      else if (cat === 'Lodging') setUnit('per room per night');
                      else setUnit('per ride');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      serviceType === cat
                        ? cat === 'Food'
                          ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                          : cat === 'Lodging'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-orange-300'
                    }`}
                  >
                    {cat === 'Food' ? '🍛 Food' : cat === 'Lodging' ? '🛏️ Lodging' : '🛺 Transport'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Item / Service *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    serviceType === 'Food'
                      ? 'e.g. Vada Pav or Misal Pav'
                      : serviceType === 'Lodging'
                      ? 'e.g. AC Double Room or Dharamshala Bed'
                      : 'e.g. Auto-rickshaw to Ramkund or Taxi'
                  }
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Unit of Measurement
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-orange-500 focus:bg-white outline-none"
                >
                  {serviceType === 'Food' && (
                    <>
                      <option value="per piece">per piece</option>
                      <option value="per plate">per plate</option>
                      <option value="per cup">per cup</option>
                      <option value="per glass">per glass</option>
                      <option value="per thali">per thali</option>
                      <option value="per 250 g">per 250 g</option>
                      <option value="per meal">per meal</option>
                    </>
                  )}
                  {serviceType === 'Lodging' && (
                    <>
                      <option value="per room per night">per room per night</option>
                      <option value="per person per night">per person per night</option>
                      <option value="per suite per night">per suite per night</option>
                      <option value="per apartment per night">per apartment per night</option>
                      <option value="per cottage per night">per cottage per night</option>
                      <option value="per room per week">per room per week</option>
                    </>
                  )}
                  {serviceType === 'Transport' && (
                    <>
                      <option value="per ride">per ride</option>
                      <option value="per trip">per trip</option>
                      <option value="per person">per person</option>
                      <option value="per km">per km</option>
                      <option value="per day">per day</option>
                      <option value="per hour">per hour</option>
                      <option value="per package">per package</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nashik Area / Hub
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-orange-500 focus:bg-white outline-none"
                >
                  <option value="Panchavati">Panchavati (Main Ghat & Temple Zone)</option>
                  <option value="Ramkund">Ramkund (Holy Sangam Ghat)</option>
                  <option value="Gangapur Road">Gangapur Road</option>
                  <option value="College Road">College Road</option>
                  <option value="Dwarka">Dwarka (Highway Junction)</option>
                  <option value="Tapovan">Tapovan (Ashram & Forest Belt)</option>
                  <option value="Nashik Road">Nashik Road (Railway Station Hub)</option>
                  <option value="CBS">CBS (Central Bus Station Hub)</option>
                  <option value="Old Nashik">Old Nashik (Heritage Markets)</option>
                  <option value="Mumbai Naka">Mumbai Naka</option>
                  <option value="Trimbak Road">Trimbak Road</option>
                  <option value="Satpur">Satpur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Physical Address / Stall #
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Gate, Stall 14"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-orange-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Pricing Input & Auto Guardrail Display */}
            <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border-2 border-dashed border-orange-300 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-extrabold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>Genuine Reference Price (₹) *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-white border-2 border-emerald-400 rounded-xl text-emerald-800 font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Your baseline fair cost for {unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-orange-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-orange-700" />
                    <span>Max Allowed Price (System Calculated)</span>
                  </label>
                  <div className="px-4 py-2.5 bg-orange-100/80 border-2 border-orange-400 rounded-xl flex items-center justify-between text-orange-950">
                    <div className="font-extrabold text-xl text-orange-700">
                      ₹{calculatedMaxPrice}
                    </div>
                    <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded uppercase">
                      Locked (+50%)
                    </span>
                  </div>
                  <span className="text-[11px] text-orange-700/80 mt-1 block">
                    Formula: ceil(₹{numericPrice || 0} * 1.5) = ₹{calculatedMaxPrice}
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-600 bg-white p-3 rounded-lg border border-stone-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Security Guardrail Active:</strong> Neither vendors nor administrators can specify an arbitrary maximum price. The server automatically calculates <code className="bg-stone-100 text-orange-800 px-1 py-0.5 rounded font-mono">max_price = Math.ceil(price * 1.5)</code> on save.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Submit Service for Admin Verification
            </button>
          </form>
        </div>

        {/* Live Status & Information Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              How the Owner Verification Process Works
            </h4>
            <ol className="text-xs text-stone-700 space-y-2.5 list-decimal pl-4">
              <li>
                <strong>Price Submission:</strong> You input your base cost (e.g. ₹20 for Vada Pav).
              </li>
              <li>
                <strong>Automated Cap:</strong> The system automatically caps your store price at 50% above genuine price (e.g. ₹30).
              </li>
              <li>
                <strong>Pending Status:</strong> Your service enters the Admin queue with <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-semibold">Pending</span> status.
              </li>
              <li>
                <strong>BST Inclusion:</strong> Once the Kumbh Mela Admin approves your stall, the service is indexed in the in-memory Binary Search Tree and becomes searchable by visitors.
              </li>
            </ol>
          </div>

          {/* Recent Submissions List */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <h4 className="font-bold text-stone-900 text-sm flex items-center justify-between">
              <span>All Registered Services</span>
              <span className="text-xs bg-stone-100 px-2 py-0.5 rounded-full text-stone-600">
                {allShops.length} total
              </span>
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allShops.slice(0, 6).map((shop) => (
                <div
                  key={shop._id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-800">{shop.shopName}</div>
                    <div className="text-stone-500">
                      {shop.item} • Genuine ₹{shop.price} / Max ₹{shop.max_price}
                    </div>
                  </div>
                  <div>
                    {shop.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Verified
                      </span>
                    )}
                    {shop.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending
                      </span>
                    )}
                    {shop.status === 'Rejected' && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        <XCircle className="w-3 h-3 text-red-600" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
