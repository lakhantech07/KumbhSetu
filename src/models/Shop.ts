export type ServiceType = 'Food' | 'Lodging' | 'Transport';

export interface IShop {
  _id: string;
  shopName: string;
  ownerName: string;
  type?: ServiceType; // Food | Lodging | Transport
  item: string;
  area: string;
  address: string;
  price: number; // Genuine / Reference Price
  unit: string;
  max_price: number; // System-calculated: Math.ceil(price * 1.5)
  status: 'Pending' | 'Verified' | 'Rejected';
  rating?: string;
  reviewsCount?: number;
  createdAt: string;
}

export type CreateShopInput = Omit<IShop, '_id' | 'max_price' | 'status' | 'createdAt'> & {
  // Even if user/owner passes max_price or status, it gets safely overridden
  max_price?: number;
  status?: string;
};

/**
 * Calculates the allowed maximum price based on genuine price.
 * Rule: max_price = Math.ceil(price * 1.5) (50% price guardrail)
 */
export function calculateMaxPrice(genuinePrice: number): number {
  if (typeof genuinePrice !== 'number' || isNaN(genuinePrice) || genuinePrice < 0) {
    throw new Error('Genuine price must be a valid non-negative number');
  }
  return Math.ceil(genuinePrice * 1.5);
}
