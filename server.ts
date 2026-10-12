import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { IShop, calculateMaxPrice } from './src/models/Shop';
import { ItemBST } from './src/utils/BST';
import { initialRawDemoShops, normalizeShopRecord } from './src/data/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory backend database simulating MongoDB with schema hooks
let databaseShops: IShop[] = initialRawDemoShops.map(normalizeShopRecord);

// Helper to rebuild verified BST
function buildVerifiedBST(): ItemBST {
  const bst = new ItemBST();
  const verified = databaseShops.filter((s) => s.status === 'Verified');
  verified.forEach((s) => bst.insert(s));
  return bst;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Router
  const api = express.Router();

  // 1. Visitor BST Search: GET /api/shops/search?item=Vada+Pav
  api.get('/shops/search', (req: Request, res: Response) => {
    try {
      const query = (req.query.item || req.query.q || '') as string;
      const bst = buildVerifiedBST();
      const { results, meta } = bst.search(query);

      res.json({
        success: true,
        query,
        count: results.length,
        guardrailNote: 'Price guardrail: up to 50% above the genuine price.',
        meta,
        results,
      });
    } catch (err) {
      console.error('API Search Error:', err);
      res.status(500).json({ error: 'Internal Server Error while searching stores.' });
    }
  });

  // 2. Get all shops: GET /api/shops?status=Verified&type=Food
  api.get('/shops', (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const type = req.query.type as string;
      let filtered = databaseShops;
      if (status) {
        filtered = filtered.filter((s) => s.status === status);
      }
      if (type) {
        filtered = filtered.filter((s) => s.type?.toLowerCase() === type.toLowerCase());
      }
      res.json({ success: true, count: filtered.length, shops: filtered });
    } catch (err) {
      console.error('API Get Shops Error:', err);
      res.status(500).json({ error: 'Failed to retrieve shops.' });
    }
  });

  // 3. Owner Service Submission: POST /api/shops
  api.post('/shops', (req: Request, res: Response) => {
    try {
      const { shopName, ownerName, item, area, address, price, unit } = req.body;

      if (!shopName || !item || price === undefined) {
        return res.status(400).json({ error: 'Shop Name, Item, and Price are required.' });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Genuine price must be a positive number.' });
      }

      // Pre-save guardrail enforcement: max_price = Math.ceil(price * 1.5)
      const calculatedMax = calculateMaxPrice(numPrice);

      const newShop: IShop = {
        _id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        shopName: String(shopName).trim(),
        ownerName: ownerName ? String(ownerName).trim() : 'Store Owner',
        item: String(item).trim(),
        area: area ? String(area).trim() : 'Sector 4',
        address: address ? String(address).trim() : 'Main Gate',
        price: numPrice,
        unit: unit ? String(unit).trim() : 'per piece',
        max_price: calculatedMax, // Strictly system calculated
        status: 'Pending', // Strictly forced to Pending awaiting Admin verification
        createdAt: new Date().toISOString(),
      };

      databaseShops.unshift(newShop);
      res.status(201).json({ success: true, shop: newShop });
    } catch (err) {
      console.error('API Add Shop Error:', err);
      res.status(500).json({ error: 'Failed to submit service.' });
    }
  });

  // 4. Admin Status Verification: PATCH /api/shops/:id/status
  api.patch('/shops/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Verified', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Verified or Rejected.' });
      }

      const shop = databaseShops.find((s) => s._id === id);
      if (!shop) {
        return res.status(404).json({ error: `Shop with id ${id} not found.` });
      }

      // Admin can only change status; max_price is re-checked against formula
      shop.status = status;
      shop.max_price = calculateMaxPrice(shop.price);

      res.json({ success: true, shop });
    } catch (err) {
      console.error('API Update Status Error:', err);
      res.status(500).json({ error: 'Failed to update shop status.' });
    }
  });

  // 5. Seed Script Runner: POST /api/seed
  api.post('/seed', (_req: Request, res: Response) => {
    try {
      let updatedCount = 0;
      let insertedCount = 0;

      // Update old records to calculate max_price
      databaseShops = databaseShops.map((s) => {
        const correctMax = calculateMaxPrice(s.price);
        if (s.max_price !== correctMax) {
          updatedCount++;
        }
        return {
          ...s,
          max_price: correctMax,
        };
      });

      // Upsert verified demo records
      for (const demo of initialRawDemoShops) {
        const existing = databaseShops.find(
          (s) =>
            s.shopName.toLowerCase() === demo.shopName.toLowerCase() &&
            s.item.toLowerCase() === demo.item.toLowerCase()
        );
        if (existing) {
          existing.price = demo.price;
          existing.max_price = calculateMaxPrice(demo.price);
          existing.status = demo.status;
          existing.unit = demo.unit;
          existing.area = demo.area;
          existing.address = demo.address;
          updatedCount++;
        } else {
          databaseShops.push(normalizeShopRecord(demo));
          insertedCount++;
        }
      }

      const bst = buildVerifiedBST();

      res.json({
        success: true,
        message: 'Database seeded and verified successfully.',
        updatedCount,
        insertedCount,
        totalShops: databaseShops.length,
        treeSize: bst.size,
      });
    } catch (err) {
      console.error('API Seed Error:', err);
      res.status(500).json({ error: 'Failed to execute seed script.' });
    }
  });

  // 6. BST Visual Tree: GET /api/bst/tree
  api.get('/bst/tree', (_req: Request, res: Response) => {
    try {
      const bst = buildVerifiedBST();
      res.json({
        success: true,
        tree: bst.toVisual(),
        allInOrder: bst.getAllInOrder(),
      });
    } catch (err) {
      console.error('API BST Tree Error:', err);
      res.status(500).json({ error: 'Failed to fetch BST tree.' });
    }
  });

  app.use('/api', api);

  // Mount Vite middlewares in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KumbhSetuWeb server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
