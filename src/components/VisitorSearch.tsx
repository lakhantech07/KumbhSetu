import React, { useState, useMemo } from 'react';
import { IShop } from '../models/Shop';
import { SearchResultMeta } from '../utils/BST';
import {
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Store,
  ArrowUpDown,
  Cpu,
  Info,
  UtensilsCrossed,
  Hotel,
  Car,
  Star,
  Layers
} from 'lucide-react';
import { KumbhSetuLogo } from './KumbhSetuLogo';

interface VisitorSearchProps {
  onSearch: (query: string) => { results: IShop[]; meta: SearchResultMeta };
  allVerifiedShops: IShop[];
  onOpenBSTVisualizer: (term?: string) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export type ServiceCategory = 'Food' | 'Lodging' | 'Transport';

export const VisitorSearch: React.FC<VisitorSearchProps> = ({
  onSearch,
  allVerifiedShops,
  onOpenBSTVisualizer,
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>('Vada Pav');
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setInternalSearchTerm;

  const [selectedArea, setSelectedArea] = useState<string>('all');
  // Real-time chip toggling state: active categories
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(['Food', 'Lodging', 'Transport']);

  const isAllSelected = selectedCategories.length === 3 || selectedCategories.length === 0;

  // Toggle category chip handler
  const handleToggleCategory = (cat: 'All' | ServiceCategory) => {
    if (cat === 'All') {
      if (isAllSelected) {
        // Already showing all; keep all
        setSelectedCategories(['Food', 'Lodging', 'Transport']);
      } else {
        setSelectedCategories(['Food', 'Lodging', 'Transport']);
      }
      return;
    }

    if (isAllSelected) {
      // If previously All was selected, clicking a chip isolates that category
      setSelectedCategories([cat]);
    } else if (selectedCategories.includes(cat)) {
      // Deselect chip
      const remaining = selectedCategories.filter((c) => c !== cat);
      if (remaining.length === 0) {
        // If all turned off, reset to all
        setSelectedCategories(['Food', 'Lodging', 'Transport']);
      } else {
        setSelectedCategories(remaining);
      }
    } else {
      // Add chip
      const next = [...selectedCategories, cat];
      setSelectedCategories(next);
    }
  };

  // Category counts
  const foodCount = useMemo(() => allVerifiedShops.filter(s => s.type === 'Food').length, [allVerifiedShops]);
  const lodgingCount = useMemo(() => allVerifiedShops.filter(s => s.type === 'Lodging').length, [allVerifiedShops]);
  const transportCount = useMemo(() => allVerifiedShops.filter(s => s.type === 'Transport').length, [allVerifiedShops]);

  // Perform BST search or fallback to full category browse when searchTerm is empty
  const { results: rawResults, meta } = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      const allSorted = [...allVerifiedShops].sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price;
        return a.shopName.localeCompare(b.shopName);
      });
      return {
        results: allSorted,
        meta: {
          query: '',
          visitedNodesCount: 0,
          traversalPath: [],
          exactMatchFound: false,
          totalResultsCount: allSorted.length,
        },
      };
    }
    return onSearch(searchTerm);
  }, [searchTerm, onSearch, allVerifiedShops]);

  // Combined Category Chips + Area filtering
  const filteredResults = useMemo(() => {
    return rawResults.filter((s) => {
      const matchArea = selectedArea === 'all' || s.area.toLowerCase().includes(selectedArea.toLowerCase());
      const shopCategory = s.type as ServiceCategory;
      const matchCategory = isAllSelected || selectedCategories.includes(shopCategory);
      return matchArea && matchCategory;
    });
  }, [rawResults, selectedArea, isAllSelected, selectedCategories]);

  // Distinct areas for filter dropdown
  const uniqueAreas = useMemo(() => {
    const set = new Set(allVerifiedShops.map(s => s.area));
    return Array.from(set).sort();
  }, [allVerifiedShops]);

  // Dynamic quick picks per selected categories
  const quickPicks = useMemo(() => {
    if (selectedCategories.length === 1) {
      if (selectedCategories[0] === 'Food') {
        return ['Vada Pav', 'Misal Pav', 'Poha', 'Samosa', 'Maharashtrian Veg Thali', 'Cutting Tea', 'Dosa', 'Pav Bhaji'];
      }
      if (selectedCategories[0] === 'Lodging') {
        return ['Non-AC Double Room', 'AC Double Room', 'Dharamshala Bed', 'Dormitory Bed', 'Homestay', 'Resort Cottage'];
      }
      if (selectedCategories[0] === 'Transport') {
        return ['Auto-rickshaw', 'Taxi to Trimbakeshwar', 'City Bus', 'Airport Transfer', 'Scooter Rental', 'State Bus'];
      }
    }
    return ['Vada Pav', 'Misal Pav', 'AC Double Room', 'Dharamshala Bed', 'Auto-rickshaw', 'Taxi', 'Thali'];
  }, [selectedCategories]);

  // Label for active filter in headers
  const categoryLabel = useMemo(() => {
    if (isAllSelected) return 'Services';
    return selectedCategories.join(' & ');
  }, [isAllSelected, selectedCategories]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-3xl shadow-md border-2 border-orange-200/90 inline-flex items-center gap-3">
            <KumbhSetuLogo size="lg" variant="emblem" />
            <div className="text-left pr-2">
              <div className="font-black text-2xl tracking-tight leading-none">
                <span className="text-[#0a2e5c]">Kumbh</span>
                <span className="text-[#f37021]">Setu</span>
              </div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Fair Price & Service Portal &bull; Nashik & Panchavati
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Find Verified Food, Lodging & Transport
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Search 150 verified services across Panchavati and Nashik. Powered by in-memory <strong className="text-stone-800 font-semibold">Binary Search Tree (BST)</strong> with automated <strong className="text-orange-700 font-semibold">50% price ceiling guardrails</strong>.
          </p>
        </div>
      </div>

      {/* Category Toggle Chips: All, Food, Lodging, Transport */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-stone-200/90 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-stone-500 font-medium">
          <span className="flex items-center gap-1.5 font-semibold text-stone-700">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span>Real-time Category Filter:</span>
          </span>
          <span className="text-[11px] text-stone-400">
            Toggle chips to instantly filter BST results
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* "All" chip */}
          <button
            type="button"
            onClick={() => handleToggleCategory('All')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isAllSelected
                ? 'bg-stone-900 text-white ring-2 ring-stone-900 shadow-md'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Categories</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isAllSelected ? 'bg-stone-700 text-stone-100' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {allVerifiedShops.length}
            </span>
          </button>

          {/* "Food" chip */}
          <button
            type="button"
            onClick={() => handleToggleCategory('Food')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              selectedCategories.includes('Food')
                ? 'bg-amber-600 text-white ring-2 ring-amber-500 shadow-md'
                : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Food</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                selectedCategories.includes('Food')
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-200/80 text-amber-900'
              }`}
            >
              {foodCount}
            </span>
          </button>

          {/* "Lodging" chip */}
          <button
            type="button"
            onClick={() => handleToggleCategory('Lodging')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              selectedCategories.includes('Lodging')
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 shadow-md'
                : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}
          >
            <Hotel className="w-4 h-4" />
            <span>Lodging</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                selectedCategories.includes('Lodging')
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-200/80 text-indigo-900'
              }`}
            >
              {lodgingCount}
            </span>
          </button>

          {/* "Transport" chip */}
          <button
            type="button"
            onClick={() => handleToggleCategory('Transport')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              selectedCategories.includes('Transport')
                ? 'bg-teal-600 text-white ring-2 ring-teal-500 shadow-md'
                : 'bg-teal-50/80 hover:bg-teal-100 text-teal-900 border border-teal-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Transport</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                selectedCategories.includes('Transport')
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-200/80 text-teal-900'
              }`}
            >
              {transportCount}
            </span>
          </button>

          {/* Quick Clear Filter if filtered */}
          {!isAllSelected && (
            <button
              type="button"
              onClick={() => handleToggleCategory('All')}
              className="text-xs text-stone-500 hover:text-stone-800 underline px-2 py-1 ml-auto"
            >
              Reset to All
            </button>
          )}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-orange-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <Search className="w-5 h-5 text-orange-600" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search food, transport, lodging, e.g. Vada Pav, Room, Taxi"
              className="w-full pl-11 pr-14 py-3.5 bg-stone-50 border-2 border-orange-200 focus:border-orange-500 focus:bg-white rounded-xl text-stone-800 placeholder-stone-400 font-medium text-base outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-stone-400 hover:text-stone-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="py-3.5 px-3 bg-stone-50 border-2 border-stone-200 text-stone-700 rounded-xl font-medium text-sm outline-none focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="all">All Areas ({allVerifiedShops.length})</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <button
              onClick={() => onOpenBSTVisualizer(searchTerm)}
              title="Inspect BST Traversal"
              className="py-3.5 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all border border-stone-300"
            >
              <Cpu className="w-4 h-4 text-orange-600" />
              <span className="hidden md:inline">Inspect BST</span>
            </button>
          </div>
        </div>

        {/* Quick Picks for current category */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-stone-500 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
            Popular searches:
          </span>
          {quickPicks.map((pick) => (
            <button
              key={pick}
              onClick={() => setSearchTerm(pick)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                searchTerm.toLowerCase() === pick.toLowerCase()
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              {pick}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Price Guardrail Callout Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-600 p-4 sm:p-5 rounded-r-xl shadow-sm text-stone-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-orange-950 text-sm sm:text-base">
            Price guardrail: up to 50% above the genuine price.
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            Every listed food, lodging, and transport service is verified by the Kumbh Mela Fair-Price Board. The Maximum Permitted Price is mathematically computed as{' '}
            <code className="bg-orange-200/60 text-orange-900 px-1.5 py-0.5 rounded font-mono text-xs">
              max_price = Math.ceil(genuine_price * 1.5)
            </code>
            . Stalls and operators charging beyond this ceiling face instant permit revocation.
          </p>
        </div>
      </div>

      {/* BST Traversal Information Bar */}
      {searchTerm && (
        <div className="bg-stone-100/90 border border-stone-200 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-600" />
            <span>
              <strong>BST Traversal:</strong> Scanned {meta.visitedNodesCount} item keys across verified tree index.
            </span>
            {meta.exactMatchFound && (
              <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-300">
                Exact key match
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-stone-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span>Sorted by genuine price (ascending), then store name</span>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Store className="w-5 h-5 text-orange-600" />
          <span>
            {searchTerm
              ? `Verified ${categoryLabel} matching "${searchTerm}"`
              : `All Verified ${categoryLabel}`}
          </span>
          <span className="text-xs font-semibold bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-full">
            {filteredResults.length}
          </span>
        </h3>
        {filteredResults.length > 0 && (
          <span className="text-xs text-stone-500">
            Showing lowest fair prices first
          </span>
        )}
      </div>

      {/* Store Cards Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map((shop) => {
            const margin = shop.max_price - shop.price;
            const categoryType = shop.type || 'Food';

            return (
              <div
                key={shop._id}
                className="bg-white rounded-2xl border-2 border-stone-200/90 hover:border-orange-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-lg group-hover:text-orange-700 transition-colors">
                        {shop.shopName}
                      </h4>
                      <p className="text-xs text-stone-500">Owner: {shop.ownerName}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Verified
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          categoryType === 'Food'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : categoryType === 'Lodging'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-teal-100 text-teal-900 border border-teal-300'
                        }`}
                      >
                        {categoryType}
                      </span>
                    </div>
                  </div>

                  {/* Item tag */}
                  <div className="inline-block bg-orange-50 border border-orange-200 text-orange-900 px-2.5 py-1 rounded-lg text-xs font-bold">
                    Item: <span className="text-orange-700">{shop.item}</span>
                  </div>

                  {/* Rating & Review count */}
                  {shop.rating && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-600">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{shop.rating}</span>
                      </div>
                      <span className="text-stone-400">
                        ({shop.reviewsCount || 100} Google reviews)
                      </span>
                    </div>
                  )}

                  {/* Area and Address */}
                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5 font-medium text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                      <span>{shop.area}</span>
                    </div>
                    <p className="pl-5 text-stone-500 leading-tight">
                      {shop.address}
                    </p>
                  </div>
                </div>

                {/* Pricing Guardrail Box */}
                <div className="mt-5 pt-4 border-t border-stone-100 space-y-3">
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                    <div>
                      <span className="block text-[11px] font-medium text-stone-500 uppercase tracking-wide">
                        Genuine Price
                      </span>
                      <div className="text-emerald-700 font-extrabold text-base sm:text-lg flex items-baseline gap-1">
                        ₹{shop.price}
                        <span className="text-[10px] font-normal text-stone-500 truncate">
                          /{shop.unit}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-orange-800 uppercase tracking-wide">
                        Max Allowed
                      </span>
                      <div className="text-orange-600 font-extrabold text-base sm:text-lg flex items-baseline gap-1">
                        ₹{shop.max_price}
                        <span className="text-[10px] font-normal text-stone-500 truncate">
                          /{shop.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Margin pill & mandatory note */}
                  <div className="space-y-1 text-center">
                    <div className="text-[11px] font-medium text-stone-600 flex items-center justify-center gap-1">
                      <span>Allowed variance:</span>
                      <strong className="text-stone-800">+₹{margin} (+50%)</strong>
                    </div>
                    <p className="text-[11px] text-amber-800 italic font-serif">
                      * Price guardrail: up to 50% above the genuine price.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-10 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-stone-900">
              No verified {categoryLabel.toLowerCase()} found for &quot;{searchTerm}&quot;
            </h4>
            <p className="text-xs text-stone-500">
              The BST tree scanned verified records across {categoryLabel} but found no exact or partial matches.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
              }}
              className="bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Clear Search & Show All {categoryLabel}
            </button>
            <button
              onClick={() => {
                setSearchTerm('Vada Pav');
                setSelectedCategories(['Food', 'Lodging', 'Transport']);
                setSelectedArea('all');
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Reset to &quot;Vada Pav&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
