import React, { useState, useMemo, useEffect } from 'react';
import { ItemBST, BSTNode } from '../utils/BST';
import {
  GitFork,
  Search,
  RefreshCw,
  Info,
  ListTree,
  Network,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Hash
} from 'lucide-react';

interface BSTVisualizerProps {
  bst: ItemBST;
  onRebuild: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
}

interface NodePosition {
  depth: number;
  horizontalIndex: number;
  x: number;
  y: number;
}

interface PathEdge {
  from: string;
  to: string;
  isLeft: boolean;
  decisionText: string;
  step: number;
}

interface RecursiveTreeNodeProps {
  node: BSTNode | null;
  depth: number;
  parentPos?: { x: number; y: number } | null;
  isLeftChild?: boolean | null;
  positionMap: Map<string, NodePosition>;
  selectedKey: string | null;
  pathNodeKeys: Set<string>;
  pathEdgeMap: Map<string, PathEdge>;
  pathStepMap: Map<string, number>;
  query: string;
  allMatchedKeys: Set<string>;
  onSelectNode: (key: string) => void;
  showCoordinates: boolean;
}

const COL_WIDTH = 138;
const ROW_HEIGHT = 115;
const PADDING_X = 80;
const PADDING_Y = 65;
const NODE_WIDTH = 126;
const NODE_HEIGHT = 56;
const RX = 12;

/**
 * Recursive SVG component rendering the binary search tree:
 * - Highlights the currently selected node
 * - Highlights the traversal path taken from root to target
 * - Color-codes parent-child connecting lines (Blue for Left branch, Purple for Right branch)
 */
const RecursiveTreeNode: React.FC<RecursiveTreeNodeProps> = ({
  node,
  depth,
  parentPos = null,
  isLeftChild = null,
  positionMap,
  selectedKey,
  pathNodeKeys,
  pathEdgeMap,
  pathStepMap,
  query,
  allMatchedKeys,
  onSelectNode,
  showCoordinates,
}) => {
  if (!node) return null;

  const pos = positionMap.get(node.key);
  if (!pos) return null;

  const { x, y, horizontalIndex } = pos;
  const nodeKeyLower = node.key.toLowerCase();
  const isSelected = selectedKey === nodeKeyLower;
  const isTargetMatch = allMatchedKeys.has(nodeKeyLower);
  const isOnPath = pathNodeKeys.has(nodeKeyLower);
  const pathStep = pathStepMap.get(nodeKeyLower);
  const isRoot = depth === 0;

  // Determine edge from parent to this node
  const parentKey = parentPos ? Array.from(positionMap.entries()).find(
    ([, p]) => p.x === parentPos.x && p.y === parentPos.y
  )?.[0] : null;

  const edgeKey = parentKey ? `${parentKey}->${nodeKeyLower}` : null;
  const activeEdge = edgeKey ? pathEdgeMap.get(edgeKey) : null;
  const isEdgeOnPath = Boolean(activeEdge);

  const sampleShop = node.shops[0];
  const samplePrice = sampleShop?.price ?? 0;
  const sampleMaxPrice = sampleShop?.max_price ?? Math.ceil(samplePrice * 1.5);

  // Connection line styling
  let lineStroke = '#cbd5e1';
  let lineWidth = '1.8';
  let lineDash = '4 3';
  let lineFilter = undefined;
  let badgeBg = '#f8fafc';
  let badgeStroke = '#cbd5e1';
  let badgeTextColor = '#94a3b8';

  if (isEdgeOnPath) {
    lineDash = 'none';
    lineWidth = '4';
    lineFilter = 'url(#pathGlow)';

    if (isLeftChild) {
      lineStroke = '#0284c7'; // Vibrant Sky Blue for Left Branch taken
      badgeBg = '#e0f2fe';
      badgeStroke = '#0284c7';
      badgeTextColor = '#0369a1';
    } else {
      lineStroke = '#9333ea'; // Vibrant Violet Purple for Right Branch taken
      badgeBg = '#f3e8ff';
      badgeStroke = '#9333ea';
      badgeTextColor = '#7e22ce';
    }
  }

  // Node capsule styling
  let fill = '#ffffff';
  let stroke = '#94a3b8';
  let strokeWidth = '1.5';
  let textColor = '#0f172a';

  if (isSelected) {
    fill = '#ecfdf5'; // Emerald background
    stroke = '#059669'; // Bold Emerald border
    strokeWidth = '3.5';
    textColor = '#064e3b';
  } else if (isTargetMatch) {
    fill = '#fffbeb'; // Amber background for other matches
    stroke = '#d97706';
    strokeWidth = '2.5';
    textColor = '#78350f';
  } else if (isOnPath) {
    fill = '#f8fafc'; // Path ancestor
    stroke = '#0284c7'; // Sky Blue path border
    strokeWidth = '2.5';
    textColor = '#0f172a';
  } else if (isRoot) {
    fill = '#fafaf9';
    stroke = '#ea580c';
    strokeWidth = '2';
  }

  return (
    <g className="recursive-tree-node-group">
      {/* 1. Color-coded connection line from parent to this node */}
      {parentPos && (
        <g className={`parent-child-branch ${isEdgeOnPath ? 'active-path-branch' : 'inactive-branch'}`}>
          <line
            x1={parentPos.x}
            y1={parentPos.y + NODE_HEIGHT / 2}
            x2={x}
            y2={y - NODE_HEIGHT / 2}
            stroke={lineStroke}
            strokeWidth={lineWidth}
            strokeDasharray={lineDash}
            strokeLinecap="round"
            filter={lineFilter}
          />

          {/* Branch badge: L (<) or R (>) */}
          <rect
            x={(parentPos.x + x) / 2 - (isEdgeOnPath ? 24 : 20)}
            y={(parentPos.y + NODE_HEIGHT / 2 + y - NODE_HEIGHT / 2) / 2 - 9}
            width={isEdgeOnPath ? 48 : 40}
            height="18"
            rx="5"
            fill={badgeBg}
            stroke={badgeStroke}
            strokeWidth={isEdgeOnPath ? '2' : '1'}
          />
          <text
            x={(parentPos.x + x) / 2}
            y={(parentPos.y + NODE_HEIGHT / 2 + y - NODE_HEIGHT / 2) / 2 + 4}
            textAnchor="middle"
            fontSize={isEdgeOnPath ? '10' : '9'}
            fontWeight="bold"
            fill={badgeTextColor}
            fontFamily="monospace"
          >
            {isLeftChild ? 'L (<)' : 'R (>)'}
          </text>
        </g>
      )}

      {/* 2. Recursively render Left Child Subtree */}
      {node.left && (
        <RecursiveTreeNode
          node={node.left}
          depth={depth + 1}
          parentPos={{ x, y }}
          isLeftChild={true}
          positionMap={positionMap}
          selectedKey={selectedKey}
          pathNodeKeys={pathNodeKeys}
          pathEdgeMap={pathEdgeMap}
          pathStepMap={pathStepMap}
          query={query}
          allMatchedKeys={allMatchedKeys}
          onSelectNode={onSelectNode}
          showCoordinates={showCoordinates}
        />
      )}

      {/* 3. Recursively render Right Child Subtree */}
      {node.right && (
        <RecursiveTreeNode
          node={node.right}
          depth={depth + 1}
          parentPos={{ x, y }}
          isLeftChild={false}
          positionMap={positionMap}
          selectedKey={selectedKey}
          pathNodeKeys={pathNodeKeys}
          pathEdgeMap={pathEdgeMap}
          pathStepMap={pathStepMap}
          query={query}
          allMatchedKeys={allMatchedKeys}
          onSelectNode={onSelectNode}
          showCoordinates={showCoordinates}
        />
      )}

      {/* 4. Render Current Node at calculated (x, y) */}
      <g
        transform={`translate(${x}, ${y})`}
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(node.itemDisplay || node.key)}
      >
        {/* Glow halo for selected target node */}
        {isSelected && (
          <rect
            x={-NODE_WIDTH / 2 - 6}
            y={-NODE_HEIGHT / 2 - 6}
            width={NODE_WIDTH + 12}
            height={NODE_HEIGHT + 12}
            rx={RX + 4}
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            opacity="0.85"
            filter="url(#selectedGlow)"
          />
        )}

        {/* Node Capsule */}
        <rect
          x={-NODE_WIDTH / 2}
          y={-NODE_HEIGHT / 2}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          rx={RX}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          filter="url(#treeShadow)"
        />

        {/* Top Badges */}
        {isSelected ? (
          <g transform="translate(0, -29)">
            <rect
              x="-48"
              y="-8"
              width="96"
              height="16"
              rx="4"
              fill="#059669"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#ffffff"
            >
              🎯 SELECTED TARGET
            </text>
          </g>
        ) : isOnPath && pathStep !== undefined ? (
          <g transform="translate(0, -28)">
            <rect
              x="-36"
              y="-7"
              width="72"
              height="14"
              rx="4"
              fill="#0284c7"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#ffffff"
            >
              {isRoot ? 'STEP 1 (ROOT)' : `STEP ${pathStep}`}
            </text>
          </g>
        ) : isRoot ? (
          <g transform="translate(0, -28)">
            <rect
              x="-18"
              y="-7"
              width="36"
              height="14"
              rx="4"
              fill="#ea580c"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#ffffff"
            >
              ROOT
            </text>
          </g>
        ) : null}

        {/* Coordinate indicator: [depth, hIndex] */}
        {showCoordinates && (
          <g transform="translate(-40, -18)">
            <rect
              x="-16"
              y="-6"
              width="32"
              height="12"
              rx="3"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="bold"
              fill="#475569"
              fontFamily="monospace"
            >
              d{depth}:h{horizontalIndex}
            </text>
          </g>
        )}

        {/* Item Display Key */}
        <text
          x="0"
          y="-3"
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="bold"
          fill={textColor}
        >
          {node.itemDisplay && node.itemDisplay.length > 14
            ? `${node.itemDisplay.substring(0, 13)}…`
            : node.itemDisplay || node.key}
        </text>

        {/* Price & Max Guardrail */}
        <text
          x="0"
          y="11"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="600"
          fill="#059669"
        >
          ₹{samplePrice}
          <tspan fill="#c2410c" fontWeight="bold"> (Max ₹{sampleMaxPrice})</tspan>
        </text>

        {/* Store Count */}
        <text
          x="0"
          y="21"
          textAnchor="middle"
          fontSize="8"
          fill="#64748b"
        >
          {node.shops.length} verified {node.shops.length === 1 ? 'store' : 'stores'}
        </text>
      </g>
    </g>
  );
};

export const BSTVisualizer: React.FC<BSTVisualizerProps> = ({
  bst,
  onRebuild,
  initialQuery = 'Vada Pav',
  onQueryChange,
}) => {
  const [testQuery, setTestQuery] = useState(initialQuery);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'partial' | 'exact'>('partial');
  const [viewStyle, setViewStyle] = useState<'diagram' | 'text'>('diagram');
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);

  // Sync with initialQuery when updated externally
  useEffect(() => {
    if (initialQuery && initialQuery !== testQuery) {
      setTestQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleQueryChange = (val: string) => {
    setTestQuery(val);
    if (onQueryChange) onQueryChange(val);
  };

  // Search results
  const searchResults = useMemo(() => {
    return bst.search(testQuery);
  }, [bst, testQuery]);

  // Set of all keys matching query
  const allMatchedKeys = useMemo(() => {
    const set = new Set<string>();
    searchResults.results.forEach((shop) => {
      set.add(shop.item.trim().toLowerCase());
    });
    return set;
  }, [searchResults]);

  // Determine active selected key based on query matches or user selection
  useEffect(() => {
    const q = testQuery.trim().toLowerCase();
    if (!q) {
      setSelectedKey(null);
      return;
    }

    // If an exact match exists, prefer it
    if (allMatchedKeys.has(q)) {
      setSelectedKey(q);
      return;
    }

    // Otherwise, default to first matching item
    const firstMatch = Array.from(allMatchedKeys)[0];
    if (firstMatch) {
      setSelectedKey(firstMatch);
    } else {
      setSelectedKey(null);
    }
  }, [testQuery, allMatchedKeys]);

  /**
   * Find the path taken from Root to the Selected Target Node:
   * Traverses according to binary search rules (comparing keys):
   * target < current.key => take Left Branch
   * target > current.key => take Right Branch
   */
  const { pathNodeKeys, pathEdgeMap, pathStepMap, pathWalkthrough } = useMemo(() => {
    const nodeKeys = new Set<string>();
    const edgeMap = new Map<string, PathEdge>();
    const stepMap = new Map<string, number>();
    const walkthrough: Array<{
      step: number;
      nodeKey: string;
      itemDisplay: string;
      decision: string;
      direction?: 'left' | 'right' | 'target';
    }> = [];

    if (!bst.root || !selectedKey) {
      return { pathNodeKeys: nodeKeys, pathEdgeMap: edgeMap, pathStepMap: stepMap, pathWalkthrough: walkthrough };
    }

    let curr: BSTNode | null = bst.root;
    let stepCount = 1;

    while (curr) {
      const currKey = curr.key.toLowerCase();
      nodeKeys.add(currKey);
      stepMap.set(currKey, stepCount);

      if (selectedKey === currKey) {
        walkthrough.push({
          step: stepCount,
          nodeKey: currKey,
          itemDisplay: curr.itemDisplay || currKey,
          decision: `Key matches target "${selectedKey}". Target node reached successfully!`,
          direction: 'target',
        });
        break;
      }

      if (selectedKey < currKey) {
        // Must take left branch
        const nextNode: BSTNode | null = curr.left;
        if (nextNode) {
          const edgeId = `${currKey}->${nextNode.key.toLowerCase()}`;
          const decisionText = `"${selectedKey}" < "${currKey}" → Branch LEFT (L <)`;
          edgeMap.set(edgeId, {
            from: currKey,
            to: nextNode.key.toLowerCase(),
            isLeft: true,
            decisionText,
            step: stepCount,
          });
          walkthrough.push({
            step: stepCount,
            nodeKey: currKey,
            itemDisplay: curr.itemDisplay || currKey,
            decision: decisionText,
            direction: 'left',
          });
        }
        curr = nextNode;
      } else {
        // Must take right branch
        const nextNode: BSTNode | null = curr.right;
        if (nextNode) {
          const edgeId = `${currKey}->${nextNode.key.toLowerCase()}`;
          const decisionText = `"${selectedKey}" > "${currKey}" → Branch RIGHT (R >)`;
          edgeMap.set(edgeId, {
            from: currKey,
            to: nextNode.key.toLowerCase(),
            isLeft: false,
            decisionText,
            step: stepCount,
          });
          walkthrough.push({
            step: stepCount,
            nodeKey: currKey,
            itemDisplay: curr.itemDisplay || currKey,
            decision: decisionText,
            direction: 'right',
          });
        }
        curr = nextNode;
      }

      stepCount++;
    }

    return {
      pathNodeKeys: nodeKeys,
      pathEdgeMap: edgeMap,
      pathStepMap: stepMap,
      pathWalkthrough: walkthrough,
    };
  }, [bst, selectedKey]);

  /**
   * Calculate node positions using in-order horizontal index (X-axis) and tree depth (Y-axis)
   */
  const { positionMap, totalWidth, totalHeight, maxDepth, totalNodes } = useMemo(() => {
    const map = new Map<string, NodePosition>();
    if (!bst.root) {
      return { positionMap: map, totalWidth: 700, totalHeight: 300, maxDepth: 0, totalNodes: 0 };
    }

    const depthMap = new Map<string, number>();
    let highestDepth = 0;

    const computeDepths = (curr: BSTNode | null, currentDepth: number) => {
      if (!curr) return;
      depthMap.set(curr.key, currentDepth);
      if (currentDepth > highestDepth) highestDepth = currentDepth;
      computeDepths(curr.left, currentDepth + 1);
      computeDepths(curr.right, currentDepth + 1);
    };
    computeDepths(bst.root, 0);

    let inOrderCounter = 0;
    const computeHorizontalIndices = (curr: BSTNode | null) => {
      if (!curr) return;
      computeHorizontalIndices(curr.left);

      const d = depthMap.get(curr.key) ?? 0;
      const hIndex = inOrderCounter++;
      const x = PADDING_X + hIndex * COL_WIDTH + COL_WIDTH / 2;
      const y = PADDING_Y + d * ROW_HEIGHT;

      map.set(curr.key, {
        depth: d,
        horizontalIndex: hIndex,
        x,
        y,
      });

      computeHorizontalIndices(curr.right);
    };
    computeHorizontalIndices(bst.root);

    const calculatedWidth = Math.max(880, PADDING_X * 2 + inOrderCounter * COL_WIDTH);
    const calculatedHeight = Math.max(380, PADDING_Y * 2 + (highestDepth + 1) * ROW_HEIGHT);

    return {
      positionMap: map,
      totalWidth: calculatedWidth,
      totalHeight: calculatedHeight,
      maxDepth: highestDepth,
      totalNodes: inOrderCounter,
    };
  }, [bst]);

  // Generate ASCII / Text representation for outline view
  const textTree = useMemo(() => {
    if (!bst.root) return 'Tree is currently empty.';

    const lines: string[] = [];
    const buildText = (node: BSTNode | null, prefix = '', isTail = true, label = 'ROOT') => {
      if (!node) return;
      const isSelected = selectedKey === node.key.toLowerCase();
      const mark = isSelected ? ' [🎯 SELECTED]' : '';
      lines.push(`${prefix}${isTail ? '└── ' : '├── '}[${label}] ${node.itemDisplay || node.key}${mark} (Genuine ₹${node.shops[0]?.price}, Max ₹${node.shops[0]?.max_price})`);

      const children: Array<{ node: BSTNode; label: string }> = [];
      if (node.left) children.push({ node: node.left, label: 'L (<)' });
      if (node.right) children.push({ node: node.right, label: 'R (>)' });

      for (let i = 0; i < children.length; i++) {
        const isChildTail = i === children.length - 1;
        buildText(children[i].node, prefix + (isTail ? '    ' : '│   '), isChildTail, children[i].label);
      }
    };

    buildText(bst.root, '', true, 'ROOT');
    return lines.join('\n');
  }, [bst, selectedKey]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-orange-200">
            <GitFork className="w-3.5 h-3.5 text-orange-700" />
            Tree Traversal & Path Visualizer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            Binary Search Tree Path & Selected Node
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-3xl">
            When a visitor searches an item, the tree traces the exact traversal path from the root. Connections are color-coded: <strong className="text-sky-700">Blue for Left branches</strong>, <strong className="text-purple-700">Purple for Right branches</strong>, and the selected node is highlighted with glowing focus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-200 p-1 rounded-xl flex text-xs font-medium">
            <button
              onClick={() => setViewStyle('diagram')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewStyle === 'diagram'
                  ? 'bg-white text-stone-900 font-bold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-orange-600" />
              SVG Tree
            </button>
            <button
              onClick={() => setViewStyle('text')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewStyle === 'text'
                  ? 'bg-white text-stone-900 font-bold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ListTree className="w-3.5 h-3.5 text-orange-600" />
              Outline
            </button>
          </div>

          <button
            onClick={onRebuild}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 flex items-center gap-1.5 transition-all"
            title="Rebuild BST from current verified shops"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Rebuild Tree</span>
          </button>
        </div>
      </div>

      {/* Traversal Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-orange-600 absolute left-3.5 top-3" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search item, e.g. Vada Pav, Samosa, Chai"
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border-2 border-orange-200 focus:border-orange-500 rounded-xl text-sm outline-none font-medium shadow-inner"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('partial')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                searchMode === 'partial'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Partial Scan (e.g. Vada Pav finds Cheese Vada Pav)
            </button>
            <button
              onClick={() => setSearchMode('exact')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                searchMode === 'exact'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Exact Traversal
            </button>
          </div>
        </div>

        {/* Matched Node Selector Chips */}
        {allMatchedKeys.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-stone-100">
            <span className="text-stone-500 font-semibold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Matching nodes ({allMatchedKeys.size}):
            </span>
            {Array.from(allMatchedKeys).map((key) => {
              const isCurrent = selectedKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`px-3 py-1 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white font-bold shadow-sm ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <span>{key}</span>
                  {isCurrent && <span className="text-[10px] bg-emerald-700 px-1.5 rounded-full">Target</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Step-by-Step Path Walkthrough */}
        {pathWalkthrough.length > 0 && (
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span className="flex items-center gap-1.5 text-stone-900">
                <Sparkles className="w-4 h-4 text-orange-600" />
                Path Taken from Root to Selected Node ({pathWalkthrough.length} comparisons):
              </span>
              <span className="text-emerald-700 font-semibold">
                O(log n) Tree Traversal
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {pathWalkthrough.map((stepItem, i) => (
                <React.Fragment key={stepItem.step}>
                  <div
                    onClick={() => setSelectedKey(stepItem.nodeKey)}
                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                      stepItem.direction === 'target'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300'
                        : 'bg-white border-stone-300 text-stone-800 hover:border-orange-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                      {stepItem.step}
                    </span>
                    <span className="font-semibold">{stepItem.itemDisplay}</span>
                    {stepItem.direction === 'left' && (
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        L &lt;
                      </span>
                    )}
                    {stepItem.direction === 'right' && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        R &gt;
                      </span>
                    )}
                    {stepItem.direction === 'target' && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.2 rounded">
                        MATCH 🎯
                      </span>
                    )}
                  </div>

                  {i < pathWalkthrough.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recursive SVG Tree Diagram Canvas */}
      {viewStyle === 'diagram' ? (
        <div className="bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200 shadow-sm p-6 overflow-hidden space-y-4">
          {/* Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3 text-xs">
            <div className="flex items-center gap-4 text-[11px] text-stone-600 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-stone-800">
                Color-Coded Path:
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-1 bg-sky-600 rounded"></span>
                <span>Left Branch (<strong className="text-sky-700">L &lt;</strong>)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-1 bg-purple-600 rounded"></span>
                <span>Right Branch (<strong className="text-purple-700">R &gt;</strong>)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700"></span>
                <span className="font-semibold text-emerald-800">Selected Node</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-1 border-t-2 border-dashed border-stone-400"></span>
                <span className="text-stone-400">Inactive Branch</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-stone-500">
              <button
                onClick={() => setShowCoordinates(!showCoordinates)}
                className="text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
              >
                <Hash className="w-3 h-3" />
                {showCoordinates ? 'Hide (d, h)' : 'Show coords (d, h)'}
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-fit flex justify-center">
              {bst.root ? (
                <svg width={totalWidth} height={totalHeight} className="select-none font-sans">
                  <defs>
                    <filter id="treeShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.08" />
                    </filter>
                    {/* Glowing filter for active connection lines */}
                    <filter id="pathGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#0284c7" floodOpacity="0.5" />
                    </filter>
                    {/* Halo for selected node */}
                    <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Root call of Recursive SVG Tree Renderer */}
                  <RecursiveTreeNode
                    node={bst.root}
                    depth={0}
                    parentPos={null}
                    isLeftChild={null}
                    positionMap={positionMap}
                    selectedKey={selectedKey}
                    pathNodeKeys={pathNodeKeys}
                    pathEdgeMap={pathEdgeMap}
                    pathStepMap={pathStepMap}
                    query={testQuery}
                    allMatchedKeys={allMatchedKeys}
                    onSelectNode={(key) => {
                      const lower = key.toLowerCase();
                      setSelectedKey(lower);
                      handleQueryChange(key);
                    }}
                    showCoordinates={showCoordinates}
                  />
                </svg>
              ) : (
                <div className="text-center py-16 text-stone-400 text-sm">
                  No verified services in tree. Visit the Seed tab or approve shops in the Admin Queue.
                </div>
              )}
            </div>
          </div>

          {/* Informational Footer */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong>Traversal Mechanics:</strong> Searching &quot;{testQuery}&quot; navigates from the <strong>ROOT</strong> node downwards. At each node, the search compares the target string lexicographically: if the target is smaller, the algorithm follows the <strong>Blue Left Branch</strong>; if greater, it follows the <strong>Purple Right Branch</strong> until the <strong>Selected Node (Green)</strong> is found.
            </div>
          </div>
        </div>
      ) : (
        /* Text Outline View */
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-inner space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-stone-400">
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4 text-orange-400" />
              <span>Hierarchical Tree Outline</span>
            </div>
            <span className="text-[11px] text-stone-500">
              Format: [Branch] Item (Genuine, Max Allowed)
            </span>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800/80 overflow-x-auto text-emerald-400 leading-loose">
            <pre className="font-mono text-xs">{textTree}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
