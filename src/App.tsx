/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, TabType } from './components/Header';
import { VisitorSearch } from './components/VisitorSearch';
import { OwnerPortal } from './components/OwnerPortal';
import { AdminPortal } from './components/AdminPortal';
import { BSTVisualizer } from './components/BSTVisualizer';
import { SeedManager } from './components/SeedManager';
import { CodeViewer } from './components/CodeViewer';
import { shopService } from './services/shopService';
import { IShop, CreateShopInput } from './models/Shop';
import { ItemBST, SearchResultMeta } from './utils/BST';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('visitor');
  const [shops, setShops] = useState<IShop[]>([]);
  const [bst, setBst] = useState<ItemBST>(shopService.getBST());

  // Refresh shops from service
  const refreshState = useCallback(() => {
    const all = shopService.getAllShops();
    setShops(all);
    setBst(shopService.rebuildBST());
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Search handler using BST
  const handleSearch = useCallback(
    (query: string): { results: IShop[]; meta: SearchResultMeta } => {
      return shopService.searchVerifiedShops(query);
    },
    []
  );

  // Owner add service
  const handleAddShop = useCallback(
    (input: CreateShopInput): IShop => {
      const created = shopService.addShopByOwner(input);
      refreshState();
      return created;
    },
    [refreshState]
  );

  // Admin status update (Verify / Reject)
  const handleUpdateStatus = useCallback(
    (id: string, status: 'Verified' | 'Rejected') => {
      shopService.updateStatusByAdmin(id, status);
      refreshState();
    },
    [refreshState]
  );

  // Seed script execution
  const handleRunSeed = useCallback(() => {
    const res = shopService.runSeedScript();
    refreshState();
    return res;
  }, [refreshState]);

  // Reset to default seed
  const handleReset = useCallback(() => {
    shopService.resetToDefaultSeed();
    refreshState();
  }, [refreshState]);

  const verifiedShops = shops.filter((s) => s.status === 'Verified');
  const pendingShops = shops.filter((s) => s.status === 'Pending');

  const [searchQuery, setSearchQuery] = useState('Vada Pav');

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-orange-200 selection:text-orange-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        verifiedCount={verifiedShops.length}
        pendingCount={pendingShops.length}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'visitor' && (
          <VisitorSearch
            onSearch={handleSearch}
            allVerifiedShops={verifiedShops}
            onOpenBSTVisualizer={(term) => {
              if (term) setSearchQuery(term);
              setActiveTab('bst');
            }}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
          />
        )}

        {activeTab === 'owner' && (
          <OwnerPortal onAddShop={handleAddShop} allShops={shops} />
        )}

        {activeTab === 'admin' && (
          <AdminPortal shops={shops} onUpdateStatus={handleUpdateStatus} />
        )}

        {activeTab === 'bst' && (
          <BSTVisualizer
            bst={bst}
            onRebuild={refreshState}
            initialQuery={searchQuery}
            onQueryChange={setSearchQuery}
          />
        )}

        {activeTab === 'seed' && (
          <SeedManager
            onRunSeed={handleRunSeed}
            onReset={handleReset}
            allShops={shops}
            bst={bst}
          />
        )}

        {activeTab === 'code' && <CodeViewer />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src="/kumbhsetu-logo.svg" alt="KumbhSetu Logo" className="w-9 h-9 flex-shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-stone-900 text-sm">
                <span className="text-[#0a2e5c]">Kumbh</span><span className="text-[#f37021]">Setu</span>
              </span> &bull; Fair-Price & Service Verification Framework
              <p className="text-[11px] text-stone-400">
                Binary Search Tree (BST) Indexed &bull; Deterministic 50% Ceiling Guardrails: <code>max_price = Math.ceil(price * 1.5)</code>
              </p>
            </div>
          </div>
          <div className="text-stone-400 text-[11px]">
            Kumbh Mela Administration &bull; Sangam Sector Oversight
          </div>
        </div>
      </footer>
    </div>
  );
}
