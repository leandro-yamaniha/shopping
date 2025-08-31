import { Product, ProductModel, ProductFilter } from '../models/Product';
import { CartModel } from '../models/Cart';

export class ProductViewModel {
  private productModel: ProductModel;
  private cartModel: CartModel;
  private _currentFilter: ProductFilter = {};

  get currentFilter(): ProductFilter {
    return this._currentFilter;
  }
  private isLoading: boolean = false;
  private error: string | null = null;

  constructor(productModel: ProductModel, cartModel: CartModel) {
    this.productModel = productModel;
    this.cartModel = cartModel;
  }

  // Product operations
  async loadProducts(): Promise<Product[]> {
    this.setLoading(true);
    this.setError(null);
    
    try {
      // Simulate API delay
      await this.delay(500);
      const products = this.productModel.getAllProducts();
      this.setLoading(false);
      return products;
    } catch (error) {
      this.setError('Erro ao carregar produtos');
      this.setLoading(false);
      return [];
    }
  }

  async searchProducts(filter: ProductFilter): Promise<Product[]> {
    this.setLoading(true);
    this.setError(null);
    this._currentFilter = filter;

    try {
      await this.delay(300);
      const products = this.productModel.searchProducts(filter);
      this.setLoading(false);
      return products;
    } catch (error) {
      this.setError('Erro na busca de produtos');
      this.setLoading(false);
      return [];
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    this.setLoading(true);
    this.setError(null);

    try {
      await this.delay(200);
      const product = this.productModel.getProductById(id);
      this.setLoading(false);
      return product || null;
    } catch (error) {
      this.setError('Erro ao carregar produto');
      this.setLoading(false);
      return null;
    }
  }

  getCategories(): string[] {
    return this.productModel.getCategories();
  }

  // Cart operations
  addToCart(product: Product, quantity: number = 1): boolean {
    try {
      // Check stock availability
      if (product.stock < quantity) {
        this.setError(`Estoque insuficiente. Disponível: ${product.stock}`);
        return false;
      }

      const success = this.cartModel.addItem(product, quantity);
      if (success) {
        this.productModel.updateStock(product.id, quantity);
      }
      return success;
    } catch (error) {
      this.setError('Erro ao adicionar produto ao carrinho');
      return false;
    }
  }

  removeFromCart(productId: number): boolean {
    try {
      return this.cartModel.removeItem(productId);
    } catch (error) {
      this.setError('Erro ao remover produto do carrinho');
      return false;
    }
  }

  updateCartQuantity(productId: number, quantity: number): boolean {
    try {
      const product = this.productModel.getProductById(productId);
      if (product && quantity > product.stock) {
        this.setError(`Estoque insuficiente. Disponível: ${product.stock}`);
        return false;
      }

      return this.cartModel.updateQuantity(productId, quantity);
    } catch (error) {
      this.setError('Erro ao atualizar quantidade');
      return false;
    }
  }

  getCartSummary() {
    return this.cartModel.getSummary();
  }

  getCartItemCount(): number {
    return this.cartModel.getItemCount();
  }

  clearCart(): void {
    this.cartModel.clear();
  }

  // UI state management
  isProductInCart(productId: number): boolean {
    return this.cartModel.hasItem(productId);
  }

  getProductCartQuantity(productId: number): number {
    return this.cartModel.getItemQuantity(productId);
  }

  // Loading and error state
  getIsLoading(): boolean {
    return this.isLoading;
  }

  getError(): string | null {
    return this.error;
  }

  clearError(): void {
    this.setError(null);
  }

  // Utility methods
  formatPrice(price: number): string {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }

  formatRating(rating: number): string {
    return `${rating.toFixed(1)} ⭐`;
  }

  isProductAvailable(product: Product): boolean {
    return product.stock > 0;
  }

  getStockStatus(product: Product): string {
    if (product.stock === 0) return 'Esgotado';
    if (product.stock < 10) return 'Últimas unidades';
    return 'Disponível';
  }

  // Private methods
  private setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  private setError(error: string | null): void {
    this.error = error;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validation methods
  validateAddToCart(product: Product, quantity: number): { isValid: boolean; message?: string } {
    if (quantity <= 0) {
      return { isValid: false, message: 'Quantidade deve ser maior que zero' };
    }

    if (quantity > product.stock) {
      return { isValid: false, message: `Estoque insuficiente. Disponível: ${product.stock}` };
    }

    if (!this.isProductAvailable(product)) {
      return { isValid: false, message: 'Produto indisponível' };
    }

    return { isValid: true };
  }

  // Analytics methods
  getPopularProducts(): Product[] {
    return this.productModel.getAllProducts()
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 5);
  }

  getHighRatedProducts(): Product[] {
    return this.productModel.getAllProducts()
      .filter(p => (p.rating || 0) >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  getLowStockProducts(): Product[] {
    return this.productModel.getAllProducts()
      .filter(p => p.stock < 10 && p.stock > 0)
      .sort((a, b) => a.stock - b.stock);
  }
}
