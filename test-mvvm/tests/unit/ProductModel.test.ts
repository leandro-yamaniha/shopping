import { ProductModel, ProductFilter } from '../../models/Product';

describe('ProductModel', () => {
  let productModel: ProductModel;

  beforeEach(() => {
    productModel = new ProductModel();
  });

  describe('getAllProducts', () => {
    test('should return all products', () => {
      const products = productModel.getAllProducts();
      expect(products).toHaveLength(6);
      expect(products[0]).toHaveProperty('id');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('price');
    });

    test('should return a copy of products array', () => {
      const products1 = productModel.getAllProducts();
      const products2 = productModel.getAllProducts();
      expect(products1).not.toBe(products2);
      expect(products1).toEqual(products2);
    });
  });

  describe('getProductById', () => {
    test('should return correct product for valid id', () => {
      const product = productModel.getProductById(1);
      expect(product).toBeDefined();
      expect(product?.name).toBe('iPhone 15 Pro');
      expect(product?.id).toBe(1);
    });

    test('should return undefined for invalid id', () => {
      const product = productModel.getProductById(999);
      expect(product).toBeUndefined();
    });

    test('should return undefined for negative id', () => {
      const product = productModel.getProductById(-1);
      expect(product).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    test('should return electronics products', () => {
      const electronics = productModel.getProductsByCategory('electronics');
      expect(electronics).toHaveLength(3);
      electronics.forEach(product => {
        expect(product.category).toBe('electronics');
      });
    });

    test('should return clothing products', () => {
      const clothing = productModel.getProductsByCategory('clothing');
      expect(clothing).toHaveLength(1);
      expect(clothing[0].name).toBe('Camiseta Nike Dri-FIT');
    });

    test('should return empty array for non-existent category', () => {
      const products = productModel.getProductsByCategory('nonexistent');
      expect(products).toHaveLength(0);
    });
  });

  describe('searchProducts', () => {
    test('should filter by category', () => {
      const filter: ProductFilter = { category: 'electronics' };
      const results = productModel.searchProducts(filter);
      expect(results).toHaveLength(3);
      results.forEach(product => {
        expect(product.category).toBe('electronics');
      });
    });

    test('should filter by price range', () => {
      const filter: ProductFilter = { minPrice: 1000, maxPrice: 10000 };
      const results = productModel.searchProducts(filter);
      results.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(1000);
        expect(product.price).toBeLessThanOrEqual(10000);
      });
    });

    test('should filter by search term', () => {
      const filter: ProductFilter = { searchTerm: 'iPhone' };
      const results = productModel.searchProducts(filter);
      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('iPhone');
    });

    test('should sort by name ascending', () => {
      const filter: ProductFilter = { sortBy: 'name', sortOrder: 'asc' };
      const results = productModel.searchProducts(filter);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].name >= results[i-1].name).toBe(true);
      }
    });

    test('should sort by price descending', () => {
      const filter: ProductFilter = { sortBy: 'price', sortOrder: 'desc' };
      const results = productModel.searchProducts(filter);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].price <= results[i-1].price).toBe(true);
      }
    });

    test('should combine multiple filters', () => {
      const filter: ProductFilter = {
        category: 'electronics',
        minPrice: 1000,
        sortBy: 'price',
        sortOrder: 'asc'
      };
      const results = productModel.searchProducts(filter);
      
      // Check category filter
      results.forEach(product => {
        expect(product.category).toBe('electronics');
      });
      
      // Check price filter
      results.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(1000);
      });
      
      // Check sorting
      for (let i = 1; i < results.length; i++) {
        expect(results[i].price >= results[i-1].price).toBe(true);
      }
    });
  });

  describe('updateStock', () => {
    test('should update stock when sufficient quantity available', () => {
      const product = productModel.getProductById(1);
      const initialStock = product?.stock || 0;
      
      const success = productModel.updateStock(1, 5);
      expect(success).toBe(true);
      
      const updatedProduct = productModel.getProductById(1);
      expect(updatedProduct?.stock).toBe(initialStock - 5);
    });

    test('should not update stock when insufficient quantity', () => {
      const product = productModel.getProductById(1);
      const initialStock = product?.stock || 0;
      
      const success = productModel.updateStock(1, initialStock + 10);
      expect(success).toBe(false);
      
      const unchangedProduct = productModel.getProductById(1);
      expect(unchangedProduct?.stock).toBe(initialStock);
    });

    test('should return false for non-existent product', () => {
      const success = productModel.updateStock(999, 1);
      expect(success).toBe(false);
    });

    test('should handle zero quantity update', () => {
      const product = productModel.getProductById(1);
      const initialStock = product?.stock || 0;
      
      const success = productModel.updateStock(1, 0);
      expect(success).toBe(true);
      
      const unchangedProduct = productModel.getProductById(1);
      expect(unchangedProduct?.stock).toBe(initialStock);
    });
  });

  describe('getCategories', () => {
    test('should return unique categories', () => {
      const categories = productModel.getCategories();
      const uniqueCategories = [...new Set(categories)];
      expect(categories).toEqual(uniqueCategories);
    });

    test('should include all expected categories', () => {
      const categories = productModel.getCategories();
      expect(categories).toContain('electronics');
      expect(categories).toContain('clothing');
      expect(categories).toContain('sports');
      expect(categories).toContain('home');
    });

    test('should return array of strings', () => {
      const categories = productModel.getCategories();
      categories.forEach(category => {
        expect(typeof category).toBe('string');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty search term', () => {
      const filter: ProductFilter = { searchTerm: '' };
      const results = productModel.searchProducts(filter);
      expect(results).toHaveLength(6); // Should return all products
    });

    test('should handle case-insensitive search', () => {
      const filter: ProductFilter = { searchTerm: 'iphone' };
      const results = productModel.searchProducts(filter);
      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('iPhone');
    });

    test('should handle negative price filters gracefully', () => {
      const filter: ProductFilter = { minPrice: -100, maxPrice: -50 };
      const results = productModel.searchProducts(filter);
      expect(results).toHaveLength(0);
    });
  });
});
