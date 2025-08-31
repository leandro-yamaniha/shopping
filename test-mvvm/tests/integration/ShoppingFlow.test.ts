import { ProductModel } from '../../models/Product';
import { CartModel } from '../../models/Cart';
import { ProductViewModel } from '../../viewmodels/ProductViewModel';
import { OrderViewModel, OrderStatus } from '../../viewmodels/OrderViewModel';

describe('Shopping Flow Integration Tests', () => {
  let productModel: ProductModel;
  let cartModel: CartModel;
  let productViewModel: ProductViewModel;
  let orderViewModel: OrderViewModel;

  beforeEach(() => {
    productModel = new ProductModel();
    cartModel = new CartModel();
    productViewModel = new ProductViewModel(productModel, cartModel);
    orderViewModel = new OrderViewModel(cartModel);
  });

  describe('Complete Shopping Journey', () => {
    test('should complete full shopping flow from browse to order', async () => {
      // 1. Browse products
      const products = await productViewModel.loadProducts();
      expect(products.length).toBeGreaterThan(0);

      // 2. Search for specific product
      const searchResults = await productViewModel.searchProducts({ 
        searchTerm: 'iPhone' 
      });
      expect(searchResults.length).toBe(1);
      const iphone = searchResults[0];

      // 3. Add product to cart
      const addSuccess = productViewModel.addToCart(iphone, 2);
      expect(addSuccess).toBe(true);

      // 4. Verify cart contents
      const cartSummary = productViewModel.getCartSummary();
      expect(cartSummary.items.length).toBe(1);
      expect(cartSummary.totalItems).toBe(2);
      expect(cartSummary.total).toBeGreaterThan(0);

      // 5. Add another product
      const macbook = await productViewModel.getProductById(2);
      expect(macbook).toBeTruthy();
      productViewModel.addToCart(macbook!, 1);

      // 6. Verify updated cart
      const updatedCart = productViewModel.getCartSummary();
      expect(updatedCart.items.length).toBe(2);
      expect(updatedCart.totalItems).toBe(3);

      // 7. Create order
      const order = await orderViewModel.createOrder(
        'user123',
        {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        },
        {
          type: 'credit_card',
          details: '**** 1234'
        }
      );

      expect(order).toBeTruthy();
      expect(order!.status).toBe(OrderStatus.PENDING);
      expect(order!.items.length).toBe(2);

      // 8. Verify cart is cleared after order
      const emptyCart = productViewModel.getCartSummary();
      expect(emptyCart.items.length).toBe(0);
    });

    test('should handle stock validation during checkout', async () => {
      const product = await productViewModel.getProductById(1);
      expect(product).toBeTruthy();

      // Try to add more than available stock
      const initialStock = product!.stock;
      const addSuccess = productViewModel.addToCart(product!, initialStock + 10);
      expect(addSuccess).toBe(false);
      expect(productViewModel.getError()).toContain('Estoque insuficiente');

      // Add valid quantity
      const validAdd = productViewModel.addToCart(product!, 5);
      expect(validAdd).toBe(true);

      // Verify stock was updated
      const updatedProduct = await productViewModel.getProductById(1);
      expect(updatedProduct!.stock).toBe(initialStock - 5);
    });

    test('should handle cart operations correctly', async () => {
      const product1 = await productViewModel.getProductById(1);
      const product2 = await productViewModel.getProductById(2);

      // Add products to cart
      productViewModel.addToCart(product1!, 2);
      productViewModel.addToCart(product2!, 1);

      // Update quantity
      const updateSuccess = productViewModel.updateCartQuantity(1, 5);
      expect(updateSuccess).toBe(true);

      // Verify quantity updated
      expect(productViewModel.getProductCartQuantity(1)).toBe(5);

      // Remove product from cart
      const removeSuccess = productViewModel.removeFromCart(2);
      expect(removeSuccess).toBe(true);

      // Verify product removed
      expect(productViewModel.isProductInCart(2)).toBe(false);

      // Clear entire cart
      productViewModel.clearCart();
      expect(productViewModel.getCartItemCount()).toBe(0);
    });
  });

  describe('Order Management Flow', () => {
    beforeEach(async () => {
      // Set up cart with products
      const product = await productViewModel.getProductById(1);
      productViewModel.addToCart(product!, 1);
    });

    test('should create and manage orders', async () => {
      // Create order
      const order = await orderViewModel.createOrder(
        'user123',
        {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Brasil'
        },
        {
          type: 'pix',
          details: 'PIX'
        }
      );

      expect(order).toBeTruthy();
      const orderId = order!.id;

      // Update order status
      const updateSuccess = await orderViewModel.updateOrderStatus(orderId, OrderStatus.PROCESSING);
      expect(updateSuccess).toBe(true);

      // Retrieve updated order
      const updatedOrder = await orderViewModel.getOrderById(orderId);
      expect(updatedOrder!.status).toBe(OrderStatus.PROCESSING);

      // Get customer orders
      const customerOrders = await orderViewModel.getOrders('user123');
      expect(customerOrders.length).toBeGreaterThan(0);
      expect(customerOrders.some(o => o.id === orderId)).toBe(true);
    });

    test('should handle order cancellation', async () => {
      const order = await orderViewModel.createOrder(
        'user123',
        {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Brasil'
        },
        {
          type: 'credit_card',
          details: '**** 5678'
        }
      );

      const orderId = order!.id;

      // Cancel order
      const cancelSuccess = await orderViewModel.cancelOrder(orderId);
      expect(cancelSuccess).toBe(true);

      // Verify order is cancelled
      const cancelledOrder = await orderViewModel.getOrderById(orderId);
      expect(cancelledOrder!.status).toBe(OrderStatus.CANCELLED);
    });

    test('should prevent cancellation of shipped orders', async () => {
      const order = await orderViewModel.createOrder(
        'user123',
        {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Brasil'
        },
        {
          type: 'credit_card',
          details: '**** 9999'
        }
      );

      const orderId = order!.id;

      // Update to shipped status
      await orderViewModel.updateOrderStatus(orderId, OrderStatus.SHIPPED);

      // Try to cancel shipped order
      const cancelSuccess = await orderViewModel.cancelOrder(orderId);
      expect(cancelSuccess).toBe(false);
      expect(orderViewModel.getError()).toContain('já enviado');
    });
  });

  describe('Error Handling', () => {
    test('should handle empty cart checkout', async () => {
      const order = await orderViewModel.createOrder(
        'user123',
        {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Brasil'
        },
        {
          type: 'credit_card',
          details: '**** 1111'
        }
      );

      expect(order).toBeNull();
      expect(orderViewModel.getError()).toBe('Carrinho vazio');
    });

    test('should validate product availability', async () => {
      const product = await productViewModel.getProductById(1);
      
      // Test validation
      const validation = productViewModel.validateAddToCart(product!, 0);
      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain('maior que zero');

      const stockValidation = productViewModel.validateAddToCart(product!, product!.stock + 1);
      expect(stockValidation.isValid).toBe(false);
      expect(stockValidation.message).toContain('Estoque insuficiente');

      const validValidation = productViewModel.validateAddToCart(product!, 1);
      expect(validValidation.isValid).toBe(true);
    });
  });

  describe('Analytics and Reporting', () => {
    test('should provide product analytics', async () => {
      const popularProducts = productViewModel.getPopularProducts();
      expect(popularProducts.length).toBeLessThanOrEqual(5);
      
      const highRatedProducts = productViewModel.getHighRatedProducts();
      highRatedProducts.forEach(product => {
        expect(product.rating).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('should provide order analytics', async () => {
      // Create test order
      const product = await productViewModel.getProductById(1);
      productViewModel.addToCart(product!, 1);
      
      await orderViewModel.createOrder(
        'user123',
        {
          street: 'Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Brasil'
        },
        {
          type: 'credit_card',
          details: '**** 2222'
        }
      );

      const orderCount = orderViewModel.getOrderCount('user123');
      expect(orderCount).toBeGreaterThan(0);

      const totalSpent = orderViewModel.getTotalSpent('user123');
      expect(totalSpent).toBeGreaterThan(0);

      const recentOrders = orderViewModel.getRecentOrders('user123', 3);
      expect(recentOrders.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Performance Tests', () => {
    test('should load products quickly', async () => {
      const startTime = performance.now();
      await productViewModel.loadProducts();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should load in under 1 second
    });

    test('should search products efficiently', async () => {
      const startTime = performance.now();
      await productViewModel.searchProducts({ category: 'electronics' });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should search in under 500ms
    });

    test('should handle multiple cart operations efficiently', async () => {
      const startTime = performance.now();
      
      const products = await productViewModel.loadProducts();
      products.forEach((product, index) => {
        productViewModel.addToCart(product, index + 1);
      });
      
      productViewModel.getCartSummary();
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(600); // Should complete in under 600ms
    });
  });
});
