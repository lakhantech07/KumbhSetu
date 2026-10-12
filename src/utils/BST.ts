import { IShop } from '../models/Shop';

export interface VisualBSTNode {
  key: string;
  shopCount: number;
  samplePrice: number;
  sampleShop: string;
  left: VisualBSTNode | null;
  right: VisualBSTNode | null;
}

export class BSTNode {
  key: string; // lowercased item name
  itemDisplay: string; // original capitalization for display
  shops: IShop[];
  left: BSTNode | null;
  right: BSTNode | null;

  constructor(shop: IShop) {
    this.key = shop.item.trim().toLowerCase();
    this.itemDisplay = shop.item;
    this.shops = [shop];
    this.left = null;
    this.right = null;
  }
}

export interface SearchResultMeta {
  query: string;
  visitedNodesCount: number;
  traversalPath: string[];
  exactMatchFound: boolean;
  totalResultsCount: number;
}

export class ItemBST {
  root: BSTNode | null;
  size: number; // total unique item keys

  constructor() {
    this.root = null;
    this.size = 0;
  }

  /**
   * Inserts a verified shop into the BST using shop.item as the key.
   */
  insert(shop: IShop): void {
    const key = shop.item.trim().toLowerCase();
    if (!this.root) {
      this.root = new BSTNode(shop);
      this.size = 1;
      return;
    }
    this._insertRecursive(this.root, shop, key);
  }

  private _insertRecursive(node: BSTNode, shop: IShop, key: string): void {
    if (key === node.key) {
      // Avoid duplicate shop entries
      const alreadyExists = node.shops.some(s => s._id === shop._id);
      if (!alreadyExists) {
        node.shops.push(shop);
      }
    } else if (key < node.key) {
      if (!node.left) {
        node.left = new BSTNode(shop);
        this.size++;
      } else {
        this._insertRecursive(node.left, shop, key);
      }
    } else {
      if (!node.right) {
        node.right = new BSTNode(shop);
        this.size++;
      } else {
        this._insertRecursive(node.right, shop, key);
      }
    }
  }

  /**
   * Performs an exact lookup in the BST using standard binary search traversal O(log n).
   */
  searchExact(query: string): { shops: IShop[]; visited: string[] } {
    const targetKey = query.trim().toLowerCase();
    const visited: string[] = [];
    let current = this.root;

    while (current) {
      visited.push(current.key);
      if (targetKey === current.key) {
        return { shops: [...current.shops], visited };
      }
      if (targetKey < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return { shops: [], visited };
  }

  /**
   * Searches the BST supporting both exact and partial matches (e.g., 'Vada Pav' matches 'Cheese Vada Pav').
   * Traverses the tree and collects matches, recording the traversal steps.
   */
  search(query: string): { results: IShop[]; meta: SearchResultMeta } {
    const q = query.trim().toLowerCase();
    if (!q) {
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

    const matchedShops: IShop[] = [];
    const traversalPath: string[] = [];
    let exactFound = false;

    // Helper traversal function
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traversalPath.push(node.key);

      const matchesItemExact = node.key === q;
      const matchesItemPartial = node.key.includes(q) || q.includes(node.key);
      const matchesCategory = node.shops.some(s => s.type && s.type.toLowerCase().includes(q));

      if (matchesItemExact) {
        exactFound = true;
        matchedShops.push(...node.shops);
      } else if (matchesItemPartial || matchesCategory) {
        matchedShops.push(...node.shops);
      }

      traverse(node.left);
      traverse(node.right);
    };

    traverse(this.root);

    // Sort returned stores: price ascending, then store name alphabetical
    matchedShops.sort((a, b) => {
      if (a.price !== b.price) {
        return a.price - b.price;
      }
      return a.shopName.localeCompare(b.shopName);
    });

    return {
      results: matchedShops,
      meta: {
        query,
        visitedNodesCount: traversalPath.length,
        traversalPath,
        exactMatchFound: exactFound,
        totalResultsCount: matchedShops.length,
      },
    };
  }

  /**
   * Converts the tree to a serializable object for visualization.
   */
  toVisual(): VisualBSTNode | null {
    const convert = (node: BSTNode | null): VisualBSTNode | null => {
      if (!node) return null;
      return {
        key: node.itemDisplay,
        shopCount: node.shops.length,
        samplePrice: node.shops[0]?.price ?? 0,
        sampleShop: node.shops[0]?.shopName ?? '',
        left: convert(node.left),
        right: convert(node.right),
      };
    };
    return convert(this.root);
  }

  /**
   * In-order traversal returning all shops in alphabetical item order.
   */
  getAllInOrder(): IShop[] {
    const list: IShop[] = [];
    const inOrder = (node: BSTNode | null) => {
      if (!node) return;
      inOrder(node.left);
      list.push(...node.shops);
      inOrder(node.right);
    };
    inOrder(this.root);
    return list;
  }
}
