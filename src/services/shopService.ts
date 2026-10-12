import { IShop, CreateShopInput, calculateMaxPrice } from '../models/Shop';
import { ItemBST, SearchResultMeta } from '../utils/BST';
import { initialRawDemoShops, normalizeShopRecord } from '../data/seedData';

const STORAGE_KEY = 'kumbh_setu_shops_v3_150';

export class ShopService {
  private shops: IShop[] = [];
  private bst: ItemBST = new ItemBST();

  constructor() {
    this.loadFromStorage();
    this.rebuildBST();
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as IShop[];
          if (Array.isArray(parsed) && parsed.length >= 100) {
            // Apply normalization hook to ensure max_price = Math.ceil(price * 1.5)
            this.shops = parsed.map(s => ({
              ...s,
              max_price: calculateMaxPrice(s.price),
            }));
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to load shops from localStorage, using initial dataset', e);
      }
    }

    // Default: seed with initial normalized demo shops (all 150 items)
    this.shops = initialRawDemoShops.map(normalizeShopRecord);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.shops));
      } catch (e) {
        console.warn('Failed to persist shops to localStorage', e);
      }
    }
  }

  /**
   * Rebuilds the Binary Search Tree from verified shops.
   */
  public rebuildBST(): ItemBST {
    const verifiedShops = this.shops.filter(s => s.status === 'Verified');
    this.bst = new ItemBST();
    verifiedShops.forEach(shop => {
      this.bst.insert(shop);
    });
    return this.bst;
  }

  /**
   * Get current BST instance
   */
  public getBST(): ItemBST {
    return this.bst;
  }

  /**
   * Returns all shops, optionally filtered by status.
   */
  public getAllShops(filterStatus?: 'Pending' | 'Verified' | 'Rejected'): IShop[] {
    if (filterStatus) {
      return this.shops.filter(s => s.status === filterStatus);
    }
    return [...this.shops];
  }

  /**
   * Returns verified shops only.
   */
  public getVerifiedShops(): IShop[] {
    return this.shops.filter(s => s.status === 'Verified');
  }

  /**
   * Searches verified shops using the Binary Search Tree.
   * Requirement 1:
   * - Build BST from verified services using item name as key
   * - Exact item searches use BST traversal
   * - Partial searches scan BST so "Vada Pav" finds "Cheese Vada Pav"
   * - Sort returned stores by price (ascending), then store name
   */
  public searchVerifiedShops(query: string): { results: IShop[]; meta: SearchResultMeta } {
    if (!query || !query.trim()) {
      return {
        results: [],
        meta: {
          query: '',
          visitedNodesCount: 0,
          traversalPath: [],
          exactMatchFound: false,
          totalResultsCount: 0,
        },
      };
    }

    // Always ensure BST has latest verified shops
    this.rebuildBST();
    return this.bst.search(query);
  }

  /**
   * Owner Flow:
   * Owner submits shop and item with genuine price.
   * System calculates max_price = Math.ceil(price * 1.5).
   * Status is forced to 'Pending' awaiting Admin verification.
   */
  public addShopByOwner(input: CreateShopInput): IShop {
    const genuinePrice = Number(input.price);
    if (isNaN(genuinePrice) || genuinePrice <= 0) {
      throw new Error('Please enter a valid genuine reference price greater than 0.');
    }

    if (!input.shopName?.trim()) {
      throw new Error('Shop name is required.');
    }
    if (!input.item?.trim()) {
      throw new Error('Item name is required.');
    }

    const calculatedMax = calculateMaxPrice(genuinePrice);

    const newShop: IShop = {
      _id: 'svc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      shopName: input.shopName.trim(),
      ownerName: input.ownerName?.trim() || 'Store Owner',
      type: input.type || 'Food',
      item: input.item.trim(),
      area: input.area?.trim() || 'Panchavati',
      address: input.address?.trim() || 'Near Godavari Ghat',
      price: genuinePrice,
      unit: input.unit?.trim() || 'per piece',
      max_price: calculatedMax, // Strictly calculated by system
      status: 'Pending', // Strictly forced to Pending
      rating: '4.0/5',
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    this.shops.unshift(newShop);
    this.saveToStorage();
    // Do not insert into verified BST yet until approved
    return newShop;
  }

  /**
   * Admin Flow:
   * Admin can only verify or reject; they cannot change price or max_price.
   */
  public updateStatusByAdmin(id: string, newStatus: 'Verified' | 'Rejected'): IShop {
    const shopIndex = this.shops.findIndex(s => s._id === id);
    if (shopIndex === -1) {
      throw new Error(`Shop with id ${id} not found.`);
    }

    const target = this.shops[shopIndex];
    // Re-verify that max_price complies with guardrail
    target.max_price = calculateMaxPrice(target.price);
    target.status = newStatus;

    this.shops[shopIndex] = { ...target };
    this.saveToStorage();
    this.rebuildBST();
    return this.shops[shopIndex];
  }

  /**
   * Seed Script Flow (Requirement 6):
   * - Updates old demo records too, not only inserts new ones.
   * - Calculates max_price = Math.ceil(price * 1.5) for all existing records.
   * - Inserts missing demo records.
   * - Rebuilds BST.
   */
  public runSeedScript(): { updatedCount: number; insertedCount: number; totalCount: number } {
    let updatedCount = 0;
    let insertedCount = 0;

    // 1. Force recalculate max_price for existing records
    this.shops = this.shops.map(s => {
      const correctMax = calculateMaxPrice(s.price);
      if (s.max_price !== correctMax) {
        updatedCount++;
      }
      return {
        ...s,
        max_price: correctMax,
      };
    });

    // 2. Ensure all initial demo records are present (upsert by shopName + item)
    for (const rawDemo of initialRawDemoShops) {
      const existing = this.shops.find(
        s => s.shopName.toLowerCase() === rawDemo.shopName.toLowerCase() &&
             s.item.toLowerCase() === rawDemo.item.toLowerCase()
      );

      if (existing) {
        existing.price = rawDemo.price;
        existing.max_price = calculateMaxPrice(rawDemo.price);
        existing.status = rawDemo.status;
        existing.unit = rawDemo.unit;
        existing.area = rawDemo.area;
        existing.address = rawDemo.address;
        updatedCount++;
      } else {
        this.shops.push(normalizeShopRecord(rawDemo));
        insertedCount++;
      }
    }

    this.saveToStorage();
    this.rebuildBST();

    return {
      updatedCount,
      insertedCount,
      totalCount: this.shops.length,
    };
  }

  /**
   * Reset database back to clean verified seed state
   */
  public resetToDefaultSeed(): void {
    this.shops = initialRawDemoShops.map(normalizeShopRecord);
    this.saveToStorage();
    this.rebuildBST();
  }
}

export const shopService = new ShopService();
