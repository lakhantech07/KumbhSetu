import React, { useState } from 'react';
import { Code2, Copy, Check, FileText } from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

const files: CodeFile[] = [
  {
    name: 'models/Shop.js',
    path: '/models/Shop.js',
    language: 'javascript',
    description: 'MongoDB Schema with pre-save hook calculating max_price = ceil(price * 1.5)',
    content: `const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, default: 'Shop Owner' },
  item: { type: String, required: true }, // e.g., "Vada Pav"
  area: { type: String, required: true }, // e.g., "Sector 4"
  address: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }, // Genuine / Reference Price
  unit: { type: String, default: 'per piece' },
  max_price: { type: Number }, // System-calculated guardrail
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

// Automatically calculate max_price before saving
// Neither owners nor admins can enter an arbitrary maximum price
shopSchema.pre('save', function (next) {
  if (this.isModified('price') || !this.max_price) {
    this.max_price = Math.ceil(this.price * 1.5);
  }
  next();
});

module.exports = mongoose.model('Shop', shopSchema);`,
  },
  {
    name: 'utils/BST.js',
    path: '/utils/BST.js',
    language: 'javascript',
    description: 'Binary Search Tree indexing items, exact traversal & partial scanning, sorting by price then name',
    content: `class BSTNode {
  constructor(shop) {
    this.key = shop.item.trim().toLowerCase();
    this.itemDisplay = shop.item;
    this.shops = [shop];
    this.left = null;
    this.right = null;
  }
}

class ItemBST {
  constructor() {
    this.root = null;
  }

  insert(shop) {
    const key = shop.item.trim().toLowerCase();
    if (!this.root) {
      this.root = new BSTNode(shop);
      return;
    }
    this._insertRecursive(this.root, shop, key);
  }

  _insertRecursive(node, shop, key) {
    if (key === node.key) {
      node.shops.push(shop);
    } else if (key < node.key) {
      if (!node.left) node.left = new BSTNode(shop);
      else this._insertRecursive(node.left, shop, key);
    } else {
      if (!node.right) node.right = new BSTNode(shop);
      else this._insertRecursive(node.right, shop, key);
    }
  }

  // Exact binary search lookup O(log n)
  searchExact(query) {
    const key = query.trim().toLowerCase();
    let current = this.root;
    while (current) {
      if (key === current.key) return [...current.shops];
      if (key < current.key) current = current.left;
      else current = current.right;
    }
    return [];
  }

  // Search handles exact and partial matches (e.g. "Vada Pav" finds "Cheese Vada Pav")
  // and sorts returned stores by price (asc), then store name
  search(query) {
    const results = [];
    const q = query.trim().toLowerCase();
    if (!q) return results;

    this._traverseAndFilter(this.root, q, results);

    // Sort by genuine price (ascending), then store name
    results.sort((a, b) => {
      if (a.price !== b.price) {
        return a.price - b.price;
      }
      return a.shopName.localeCompare(b.shopName);
    });

    return results;
  }

  _traverseAndFilter(node, q, results) {
    if (!node) return;
    if (node.key.includes(q) || q.includes(node.key)) {
      results.push(...node.shops);
    }
    this._traverseAndFilter(node.left, q, results);
    this._traverseAndFilter(node.right, q, results);
  }
}

module.exports = ItemBST;`,
  },
  {
    name: 'routes/visitor.js',
    path: '/routes/visitor.js',
    language: 'javascript',
    description: 'Visitor search controller building BST from verified stores & rendering view',
    content: `const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const ItemBST = require('../utils/BST');

router.get('/search', async (req, res) => {
  try {
    const query = req.query.item || req.query.q || '';

    // 1. Fetch verified shops
    const verifiedShops = await Shop.find({ status: 'Verified' });

    // 2. Build Binary Search Tree
    const bst = new ItemBST();
    verifiedShops.forEach(shop => bst.insert(shop));

    // 3. Search BST
    let results = [];
    if (query) {
      results = bst.search(query);
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ success: true, count: results.length, results });
    }

    res.render('visitor/search', { results, query });
  } catch (err) {
    console.error('Visitor Search Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;`,
  },
  {
    name: 'scripts/seed.js',
    path: '/scripts/seed.js',
    language: 'javascript',
    description: 'Database seeding script updating existing records and upserting verified demo data',
    content: `const mongoose = require('mongoose');
const Shop = require('../models/Shop');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/KumbhSetuWeb';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    // 1. Update old demo records to ensure max_price is calculated
    const existing = await Shop.find({});
    for (let shop of existing) {
      shop.max_price = Math.ceil(shop.price * 1.5);
      await shop.save();
    }

    // 2. Add verified demo records (including Vada Pav ₹20 -> ₹30 test case)
    const demoItems = [
      {
        shopName: "Kumbh Snacks Corner",
        ownerName: "Rameshwar Sharma",
        item: "Vada Pav",
        area: "Sector 4",
        address: "Main Gate, Kumbh Mela",
        price: 20,
        unit: "per piece",
        status: "Verified"
      },
      {
        shopName: "City Delights",
        ownerName: "Vikas Patel",
        item: "Cheese Vada Pav",
        area: "Sector 4",
        address: "Food Court Stall #12",
        price: 40,
        unit: "per piece",
        status: "Verified"
      },
      {
        shopName: "Kumbh Fast Food",
        ownerName: "Anil Gupta",
        item: "Vada Pav",
        area: "Sector 1",
        address: "Near Main Ghat, Exit 2",
        price: 25,
        unit: "per piece",
        status: "Verified"
      }
    ];

    for (let item of demoItems) {
      item.max_price = Math.ceil(item.price * 1.5);
      await Shop.findOneAndUpdate(
        { shopName: item.shopName, item: item.item },
        item,
        { upsert: true, new: true }
      );
    }

    console.log("Database Seeded & Updated Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seed();`,
  },
  {
    name: 'views/visitor/search.ejs',
    path: '/views/visitor/search.ejs',
    language: 'html',
    description: 'EJS template displaying search form, store details, and mandatory guardrail note',
    content: `<div class="search-container">
  <form action="/search" method="GET">
    <input type="text" name="item" placeholder="Search item, e.g. Vada Pav" value="<%= query %>">
    <button type="submit">Search</button>
  </form>
</div>

<div class="shop-list">
  <% if (results && results.length > 0) { %>
    <% results.forEach(function(shop) { %>
      <div class="shop-card">
        <h3><%= shop.shopName %></h3>
        <p><strong>Item:</strong> <%= shop.item %></p>
        <p><strong>Area:</strong> <%= shop.area %></p>
        <p><strong>Address:</strong> <%= shop.address %></p>
        <p><strong>Genuine Price:</strong> ₹<%= shop.price %> / <%= shop.unit %></p>
        <p style="color: #c2410c;"><strong>Max Permitted Price:</strong> ₹<%= shop.max_price %> / <%= shop.unit %></p>
        <p style="font-size: 0.85em; color: #7f8c8d;">
          <em>* Price guardrail: up to 50% above the genuine price.</em>
        </p>
      </div>
    <% }); %>
  <% } else if (query) { %>
    <p>No verified stores found for "<%= query %>".</p>
  <% } %>
</div>`,
  },
];

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState(files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-stone-200 text-stone-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Code2 className="w-3.5 h-3.5" />
          Project Source Architecture
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Node.js, Express & MongoDB Backend Codebase
        </h2>
        <p className="text-stone-600 text-sm max-w-3xl">
          Clean implementation of the Mongoose schema with automated price guardrails, BST search algorithm with price sorting, and Express controllers for KumbhSetuWeb.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Navigator */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-2 mb-2">
            Files in Project
          </h3>
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file)}
              className={`w-full text-left p-3 rounded-xl text-xs font-mono transition-all flex items-start gap-2.5 ${
                activeFile.name === file.name
                  ? 'bg-orange-50 border-2 border-orange-400 text-orange-950 font-bold'
                  : 'hover:bg-stone-50 text-stone-700 border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{file.name}</div>
                <div className="text-[11px] text-stone-400 font-sans mt-0.5 truncate max-w-[200px]">
                  {file.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Code View Canvas */}
        <div className="lg:col-span-8 bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
          <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-2 font-mono text-xs text-stone-300 font-bold">
                {activeFile.path}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-stone-900/90 text-stone-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[550px]">
            <pre>
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
