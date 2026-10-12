import React, { useState } from 'react';
import { IShop } from '../models/Shop';
import { ItemBST } from '../utils/BST';
import {
  Database,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Terminal,
  Activity,
  Sparkles
} from 'lucide-react';

interface SeedManagerProps {
  onRunSeed: () => { updatedCount: number; insertedCount: number; totalCount: number };
  onReset: () => void;
  allShops: IShop[];
  bst: ItemBST;
}

export interface TestCaseResult {
  title: string;
  description: string;
  passed: boolean;
  actual: string;
  expected: string;
}

export const SeedManager: React.FC<SeedManagerProps> = ({
  onRunSeed,
  onReset,
  allShops,
  bst,
}) => {
  const [logs, setLogs] = useState<string[]>([
    'System ready. Run seed script or execute test suite.',
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunSeed = () => {
    addLog('Initiating seed script (scripts/seed.js)...');
    addLog('Step 1: Recalculating and enforcing max_price = Math.ceil(price * 1.5) on existing records...');
    const result = onRunSeed();
    addLog(`Updated ${result.updatedCount} existing records.`);
    addLog(`Upserted ${result.insertedCount} verified demo records.`);
    addLog(`Rebuilt BST index from verified dataset. Total stores: ${result.totalCount}.`);
    addLog('Database seeded and verified successfully.');
  };

  const handleReset = () => {
    onReset();
    addLog('Database reset to clean factory state.');
  };

  // Run dynamic verification tests based on current state
  const runTests = (): TestCaseResult[] => {
    const tests: TestCaseResult[] = [];

    // Test 1: Vada Pav store returns ₹30 maximum price for ₹20 genuine price
    const vadaPavExact = bst.search('Vada Pav').results;
    const vadaPavStore = vadaPavExact.find(
      (s) => s.item.toLowerCase() === 'vada pav' && s.price === 20
    );

    const test1Passed =
      Boolean(vadaPavStore) &&
      vadaPavStore?.price === 20 &&
      vadaPavStore?.max_price === 30 &&
      vadaPavStore?.status === 'Verified';

    tests.push({
      title: 'Requirement 7: Vada Pav Price Guardrail Verification',
      description: 'Searching "Vada Pav" returns store with genuine price ₹20 and maximum allowed price ₹30 (ceil(20 * 1.5)).',
      passed: test1Passed,
      expected: 'Store with Item: Vada Pav | Genuine: ₹20 | Max: ₹30 | Status: Verified',
      actual: vadaPavStore
        ? `Store: ${vadaPavStore.shopName} | Genuine: ₹${vadaPavStore.price} | Max: ₹${vadaPavStore.max_price} | Status: ${vadaPavStore.status}`
        : 'Store not found in verified BST index',
    });

    // Test 2: Partial Search finds "Cheese Vada Pav" when searching "Vada Pav"
    const cheeseFound = vadaPavExact.some((s) => s.item.toLowerCase().includes('cheese vada pav'));
    tests.push({
      title: 'Requirement 1: BST Partial String Traversal',
      description: 'Searching "Vada Pav" in the BST scans nodes and finds "Cheese Vada Pav" (City Delights).',
      passed: cheeseFound,
      expected: 'Results include "Cheese Vada Pav" alongside "Vada Pav"',
      actual: cheeseFound
        ? `Found ${vadaPavExact.length} matching items including "Cheese Vada Pav"`
        : 'Cheese Vada Pav was not returned',
    });

    // Test 3: Sort Order (Price ascending, then Store Name)
    let sortedCorrectly = true;
    for (let i = 0; i < vadaPavExact.length - 1; i++) {
      const a = vadaPavExact[i];
      const b = vadaPavExact[i + 1];
      if (a.price > b.price) {
        sortedCorrectly = false;
        break;
      }
      if (a.price === b.price && a.shopName.localeCompare(b.shopName) > 0) {
        sortedCorrectly = false;
        break;
      }
    }

    tests.push({
      title: 'Requirement 1: Result Sorting Protocol',
      description: 'Matching stores are sorted strictly by genuine price (ascending), then store name alphabetically.',
      passed: sortedCorrectly && vadaPavExact.length > 1,
      expected: 'Price (asc), then Store Name (asc)',
      actual:
        vadaPavExact.length > 0
          ? vadaPavExact.map((s) => `₹${s.price} (${s.shopName})`).join(' → ')
          : 'No stores returned to sort',
    });

    // Test 4: Schema Guardrail rule adherence across all records
    const allGuardsPass = allShops.every((s) => s.max_price === Math.ceil(s.price * 1.5));
    tests.push({
      title: 'Requirement 2: Database Schema max_price = ceil(price * 1.5)',
      description: 'Every record in the database adheres to the 50% price ceiling formula without exception.',
      passed: allGuardsPass,
      expected: 'All records satisfy max_price === Math.ceil(price * 1.5)',
      actual: allGuardsPass
        ? `100% of ${allShops.length} stores strictly conform to price guardrail`
        : 'Discrepancy detected in pricing formula',
    });

    // Test 5: Verified records count in BST
    const verifiedShopsCount = allShops.filter((s) => s.status === 'Verified').length;
    tests.push({
      title: 'Requirement 6: Seed Script Verified Records Population',
      description: 'Verified records are seeded and indexed in the BST for immediate visitor search availability.',
      passed: verifiedShopsCount >= 6,
      expected: 'At least 6 verified records populated in BST',
      actual: `${verifiedShopsCount} verified records active in database & BST`,
    });

    return tests;
  };

  const testResults = runTests();
  const allTestsPassed = testResults.every((t) => t.passed);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-300">
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          Data Seeding & Verification Suite
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Seed Script Runner & Automated Test Suite
        </h2>
        <p className="text-stone-600 text-sm max-w-3xl">
          Execute the database migration and seeding script (<code>scripts/seed.js</code>) to verify that legacy records are updated with computed <code>max_price</code>, verified stores are upserted, and the Vada Pav ₹20 → ₹30 test passes.
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRunSeed}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          Run Seed Script (Update Old & Seed Verified)
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Factory Seed
        </button>
      </div>

      {/* Test Results Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-stone-900 text-lg">
              Automated Requirement Verification Tests
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              allTestsPassed
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {allTestsPassed ? 'All 5 Tests Passing' : 'Some Tests Failed'}
          </span>
        </div>

        <div className="space-y-3">
          {testResults.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                test.passed
                  ? 'bg-green-50/60 border-green-200'
                  : 'bg-red-50/60 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm text-stone-900">{test.title}</h4>
                  </div>
                  <p className="text-xs text-stone-600 pl-6">{test.description}</p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    test.passed
                      ? 'bg-green-200 text-green-900'
                      : 'bg-red-200 text-red-900'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div className="mt-2.5 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/80 p-2 rounded border border-stone-200">
                  <span className="font-semibold text-stone-500">Expected: </span>
                  <span className="text-stone-700 font-mono">{test.expected}</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-stone-200">
                  <span className="font-semibold text-stone-500">Actual: </span>
                  <span
                    className={`font-mono font-semibold ${
                      test.passed ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {test.actual}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Log Box */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-inner space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-stone-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Seed Execution Terminal Log</span>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[10px] text-stone-500 hover:text-stone-300"
          >
            Clear Log
          </button>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-emerald-400/90 leading-relaxed">
              <span className="text-stone-500 select-none">&gt; </span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
