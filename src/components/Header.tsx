import React from 'react';
import { Search, Store, ShieldCheck, GitFork, Database, Code2 } from 'lucide-react';
import { KumbhSetuLogo } from './KumbhSetuLogo';

export type TabType = 'visitor' | 'owner' | 'admin' | 'bst' | 'seed' | 'code';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  verifiedCount: number;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  verifiedCount,
  pendingCount,
}) => {
  return (
    <header className="bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 gap-3">
          {/* Logo & Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('visitor')}
          >
            <div className="p-1 bg-white/95 rounded-2xl shadow-md border-2 border-amber-300 group-hover:scale-105 transition-transform flex items-center justify-center">
              <KumbhSetuLogo size="md" variant="emblem" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl sm:text-2xl tracking-tight leading-none text-white drop-shadow-sm flex items-baseline">
                  <span>Kumbh</span>
                  <span className="text-amber-300">Setu</span>
                </h1>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-300/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Fair Price
                </span>
              </div>
              <p className="text-xs text-orange-200/95 font-medium mt-0.5">
                Verified Services & 50% Price Guardrail Directory
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('visitor')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'visitor'
                  ? 'bg-amber-400 text-orange-950 font-bold shadow-sm'
                  : 'text-amber-100 hover:bg-orange-800/60 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Visitor Search</span>
              <span className="ml-1 bg-amber-900/30 text-amber-950 font-semibold text-[10px] px-1.5 py-0.2 rounded-full">
                {verifiedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('owner')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'owner'
                  ? 'bg-amber-400 text-orange-950 font-bold shadow-sm'
                  : 'text-amber-100 hover:bg-orange-800/60 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Owner Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-orange-950 font-bold shadow-sm'
                  : 'text-amber-100 hover:bg-orange-800/60 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Queue</span>
              {pendingCount > 0 && (
                <span className="ml-1 bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('bst')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'bst'
                  ? 'bg-amber-400 text-orange-950 font-bold shadow-sm'
                  : 'text-amber-100 hover:bg-orange-800/60 hover:text-white'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>BST Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('seed')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'seed'
                  ? 'bg-amber-400 text-orange-950 font-bold shadow-sm'
                  : 'text-amber-100 hover:bg-orange-800/60 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Seed & Tests</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-amber-400 text-orange-950 font-bold shadow-sm'
                  : 'text-amber-100 hover:bg-orange-800/60 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Backend Files</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
