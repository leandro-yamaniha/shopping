import { CartModel } from '../../models/Cart';
import { Product } from '../../models/Product';

describe('CartModel', () => {
  let cartModel: CartModel;
  let mockProducts: Product[];

  beforeEach(() => {
    cartModel = new CartModel();
    mockProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        price: 8999.99,
        description: 'Test product',
        imageUrl: 'test.jpg',
        category: 'electronics',
        stock: 50
      },
      {
        id: 2,
        name: 'MacBook Air M2',
        price: 12999.99,
        description: 'Test product',
        imageUrl: 'test.jpg',
        category: 'electronics',
        stock: 25
      }
    ];
  });

  describe('addItem', () => {
    test('should add new item to cart', () => {
      const success = cartModel.addItem(mockProducts[0], 2);
      expect(success).toBe(true);
      
      const items = cartModel.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe(1);
      expect(items[0].quantity).toBe(2);
    });

    test('should increase quantity for existing item', () => {
      cartModel.addItem(mockProducts[0], 1);
      cartModel.addItem(mockProducts[0], 2);
      
      const items = cartModel.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    test('should add multiple different items', () => {
      cartModel.addItem(mockProducts[0], 1);
      cartModel.addItem(mockProducts[1], 2);
      
      const items = cartModel.getItems();
      expect(items).toHaveLength(2);
    });

    test('should set addedAt timestamp', () => {
      const beforeAdd = new Date();
      cartModel.addItem(mockProducts[0], 1);
      const afterAdd = new Date();
      
      const items = cartModel.getItems();
      expect(items[0].addedAt.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime());
      expect(items[0].addedAt.getTime()).toBeLessThanOrEqual(afterAdd.getTime());
    });
  });

  describe('removeItem', () => {
    test('should remove existing item', () => {
      cartModel.addItem(mockProducts[0], 1);
      cartModel.addItem(mockProducts[1], 1);
      
      const success = cartModel.removeItem(1);
      expect(success).toBe(true);
      
      const items = cartModel.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe(2);
    });

    test('should return false for non-existent item', () => {
      const success = cartModel.removeItem(999);
      expect(success).toBe(false);
    });

    test('should handle empty cart', () => {
      const success = cartModel.removeItem(1);
      expect(success).toBe(false);
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      cartModel.addItem(mockProducts[0], 2);
    });

    test('should update quantity for existing item', () => {
      const success = cartModel.updateQuantity(1, 5);
      expect(success).toBe(true);
      
      const items = cartModel.getItems();
      expect(items[0].quantity).toBe(5);
    });

    test('should remove item when quantity is zero', () => {
      const success = cartModel.updateQuantity(1, 0);
      expect(success).toBe(true);
      
      const items = cartModel.getItems();
      expect(items).toHaveLength(0);
    });

    test('should remove item when quantity is negative', () => {
      const success = cartModel.updateQuantity(1, -1);
      expect(success).toBe(true);
      
      const items = cartModel.getItems();
      expect(items).toHaveLength(0);
    });

    test('should return false for non-existent item', () => {
      const success = cartModel.updateQuantity(999, 5);
      expect(success).toBe(false);
    });
  });

  describe('getItemCount', () => {
    test('should return zero for empty cart', () => {
      expect(cartModel.getItemCount()).toBe(0);
    });

    test('should return correct count for single item', () => {
      cartModel.addItem(mockProducts[0], 3);
      expect(cartModel.getItemCount()).toBe(3);
    });

    test('should return correct count for multiple items', () => {
      cartModel.addItem(mockProducts[0], 2);
      cartModel.addItem(mockProducts[1], 3);
      expect(cartModel.getItemCount()).toBe(5);
    });
  });

  describe('getSubtotal', () => {
    test('should return zero for empty cart', () => {
      expect(cartModel.getSubtotal()).toBe(0);
    });

    test('should calculate correct subtotal for single item', () => {
      cartModel.addItem(mockProducts[0], 2);
      const expected = mockProducts[0].price * 2;
      expect(cartModel.getSubtotal()).toBe(expected);
    });

    test('should calculate correct subtotal for multiple items', () => {
      cartModel.addItem(mockProducts[0], 2);
      cartModel.addItem(mockProducts[1], 1);
      const expected = (mockProducts[0].price * 2) + (mockProducts[1].price * 1);
      expect(cartModel.getSubtotal()).toBe(expected);
    });
  });

  describe('getShipping', () => {
    test('should return shipping cost for low subtotal', () => {
      cartModel.addItem(mockProducts[0], 1); // Price: 8999.99, but let's test with lower value
      const lowValueProduct = { ...mockProducts[0], price: 100 };
      cartModel.clear();
      cartModel.addItem(lowValueProduct, 1);
      
      expect(cartModel.getShipping()).toBe(25);
    });

    test('should return free shipping for high subtotal', () => {
      cartModel.addItem(mockProducts[0], 1); // Price: 8999.99 > 500
      expect(cartModel.getShipping()).toBe(0);
    });

    test('should return shipping cost for exactly threshold amount', () => {
      const thresholdProduct = { ...mockProducts[0], price: 500 };
      cartModel.addItem(thresholdProduct, 1);
      expect(cartModel.getShipping()).toBe(0);
    });
  });

  describe('getTax', () => {
    test('should calculate 8% tax on subtotal', () => {
      cartModel.addItem(mockProducts[0], 1);
      const subtotal = cartModel.getSubtotal();
      const expectedTax = subtotal * 0.08;
      expect(cartModel.getTax()).toBeCloseTo(expectedTax, 2);
    });

    test('should return zero tax for empty cart', () => {
      expect(cartModel.getTax()).toBe(0);
    });
  });

  describe('getTotal', () => {
    test('should calculate correct total', () => {
      cartModel.addItem(mockProducts[0], 1);
      const subtotal = cartModel.getSubtotal();
      const shipping = cartModel.getShipping();
      const tax = cartModel.getTax();
      const expectedTotal = subtotal + shipping + tax;
      
      expect(cartModel.getTotal()).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe('getSummary', () => {
    test('should return complete cart summary', () => {
      cartModel.addItem(mockProducts[0], 2);
      cartModel.addItem(mockProducts[1], 1);
      
      const summary = cartModel.getSummary();
      
      expect(summary.items).toHaveLength(2);
      expect(summary.totalItems).toBe(3);
      expect(summary.subtotal).toBeGreaterThan(0);
      expect(summary.shipping).toBeGreaterThanOrEqual(0);
      expect(summary.tax).toBeGreaterThan(0);
      expect(summary.total).toBeGreaterThan(0);
    });
  });

  describe('clear', () => {
    test('should remove all items from cart', () => {
      cartModel.addItem(mockProducts[0], 2);
      cartModel.addItem(mockProducts[1], 1);
      
      cartModel.clear();
      
      expect(cartModel.getItems()).toHaveLength(0);
      expect(cartModel.getItemCount()).toBe(0);
      expect(cartModel.getSubtotal()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    test('should return true for empty cart', () => {
      expect(cartModel.isEmpty()).toBe(true);
    });

    test('should return false for cart with items', () => {
      cartModel.addItem(mockProducts[0], 1);
      expect(cartModel.isEmpty()).toBe(false);
    });
  });

  describe('hasItem', () => {
    test('should return true for existing item', () => {
      cartModel.addItem(mockProducts[0], 1);
      expect(cartModel.hasItem(1)).toBe(true);
    });

    test('should return false for non-existing item', () => {
      expect(cartModel.hasItem(999)).toBe(false);
    });
  });

  describe('getItemQuantity', () => {
    test('should return correct quantity for existing item', () => {
      cartModel.addItem(mockProducts[0], 3);
      expect(cartModel.getItemQuantity(1)).toBe(3);
    });

    test('should return zero for non-existing item', () => {
      expect(cartModel.getItemQuantity(999)).toBe(0);
    });
  });
});
