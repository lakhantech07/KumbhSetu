/**
 * Binary Search Tree (BST) Node representing an item group.
 * Multiple shops selling the same item are aggregated in `shops`.
 */
class BSTNode {
  constructor(shop) {
    this.key = shop.item.trim().toLowerCase();
    this.itemDisplay = shop.item;
    this.shops = [shop];
    this.left = null;
    this.right = null;
  }
}

/**
 * ItemBST implements item searching using a Binary Search Tree.
 * - Key is the lowercased item name.
 * - Exact item searches use BST traversal.
 * - Partial searches traverse the BST so terms such as "Vada Pav" also find "Cheese Vada Pav".
 * - Results are sorted by price (ascending), then store name.
 */
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
      if (!node.left) {
        node.left = new BSTNode(shop);
      } else {
        this._insertRecursive(node.left, shop, key);
      }
    } else {
      if (!node.right) {
        node.right = new BSTNode(shop);
      } else {
        this._insertRecursive(node.right, shop, key);
      }
    }
  }

  /**
   * Exact search using standard BST binary search traversal: O(log n) average.
   */
  searchExact(query) {
    const key = query.trim().toLowerCase();
    let current = this.root;
    while (current) {
      if (key === current.key) {
        return [...current.shops];
      }
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return [];
  }

  /**
   * Search handling both exact and partial matches by traversing the BST.
   * e.g., "Vada Pav" finds "Vada Pav" and "Cheese Vada Pav".
   * Sorts returned stores by price (asc), then store name.
   */
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

    // Partial search logic: check if query is contained in item key or vice versa, or matches category (Food, Lodging, Transport)
    const matchesItem = node.key.includes(q) || q.includes(node.key);
    const matchesCategory = node.shops.some(s => s.type && s.type.toLowerCase().includes(q));
    if (matchesItem || matchesCategory) {
      results.push(...node.shops);
    }

    this._traverseAndFilter(node.left, q, results);
    this._traverseAndFilter(node.right, q, results);
  }
}

module.exports = ItemBST;
