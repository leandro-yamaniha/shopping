import { Product } from './Product';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export class CartModel {
  private items: CartItem[] = [];
  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly FREE_SHIPPING_THRESHOLD = 500;
  private readonly SHIPPING_COST = 25;

  addItem(product: Product, quantity: number = 1): boolean {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        product,
        quantity,
        addedAt: new Date()
      });
    }
    return true;
  }

  removeItem(productId: number): boolean {
    const index = this.items.findIndex(item => item.product.id === productId);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  updateQuantity(productId: number, quantity: number): boolean {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      return true;
    }
    return false;
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
  }

  getShipping(): number {
    const subtotal = this.getSubtotal();
    return subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
  }

  getTax(): number {
    return this.getSubtotal() * this.TAX_RATE;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  getSummary(): CartSummary {
    return {
      items: this.getItems(),
      totalItems: this.getItemCount(),
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      tax: this.getTax(),
      total: this.getTotal()
    };
  }

  clear(): void {
    this.items = [];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  hasItem(productId: number): boolean {
    return this.items.some(item => item.product.id === productId);
  }

  getItemQuantity(productId: number): number {
    const item = this.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}
