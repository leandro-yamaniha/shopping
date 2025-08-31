import { CartModel } from '../models/Cart';

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  details: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export class OrderViewModel {
  private orders: Order[] = [];
  private cartModel: CartModel;
  private isLoading: boolean = false;
  private error: string | null = null;

  constructor(cartModel: CartModel) {
    this.cartModel = cartModel;
    this.initializeMockOrders();
  }

  // Order creation
  async createOrder(
    customerId: string,
    shippingAddress: Address,
    paymentMethod: PaymentMethod
  ): Promise<Order | null> {
    this.setLoading(true);
    this.setError(null);

    try {
      const cartSummary = this.cartModel.getSummary();
      
      if (cartSummary.items.length === 0) {
        this.setError('Carrinho vazio');
        this.setLoading(false);
        return null;
      }

      const order: Order = {
        id: this.generateOrderId(),
        customerId,
        items: cartSummary.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity
        })),
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        subtotal: cartSummary.subtotal,
        shipping: cartSummary.shipping,
        tax: cartSummary.tax,
        total: cartSummary.total,
        shippingAddress,
        paymentMethod
      };

      // Simulate API call
      await this.delay(1000);
      
      this.orders.push(order);
      this.cartModel.clear();
      this.setLoading(false);
      
      return order;
    } catch (error) {
      this.setError('Erro ao criar pedido');
      this.setLoading(false);
      return null;
    }
  }

  // Order retrieval
  async getOrders(customerId: string): Promise<Order[]> {
    this.setLoading(true);
    this.setError(null);

    try {
      await this.delay(500);
      const customerOrders = this.orders
        .filter(order => order.customerId === customerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      this.setLoading(false);
      return customerOrders;
    } catch (error) {
      this.setError('Erro ao carregar pedidos');
      this.setLoading(false);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    this.setLoading(true);
    this.setError(null);

    try {
      await this.delay(300);
      const order = this.orders.find(o => o.id === orderId);
      this.setLoading(false);
      return order || null;
    } catch (error) {
      this.setError('Erro ao carregar pedido');
      this.setLoading(false);
      return null;
    }
  }

  // Order management
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    try {
      await this.delay(500);
      const order = this.orders.find(o => o.id === orderId);
      
      if (!order) {
        this.setError('Pedido não encontrado');
        this.setLoading(false);
        return false;
      }

      order.status = status;
      order.updatedAt = new Date();
      this.setLoading(false);
      return true;
    } catch (error) {
      this.setError('Erro ao atualizar status do pedido');
      this.setLoading(false);
      return false;
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const order = this.orders.find(o => o.id === orderId);
    
    if (!order) {
      this.setError('Pedido não encontrado');
      return false;
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      this.setError('Não é possível cancelar pedido já enviado');
      return false;
    }

    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }

  // Order analytics
  getOrdersByStatus(customerId: string, status: OrderStatus): Order[] {
    return this.orders.filter(o => o.customerId === customerId && o.status === status);
  }

  getTotalSpent(customerId: string): number {
    return this.orders
      .filter(o => o.customerId === customerId && o.status !== OrderStatus.CANCELLED)
      .reduce((total, order) => total + order.total, 0);
  }

  getOrderCount(customerId: string): number {
    return this.orders.filter(o => o.customerId === customerId).length;
  }

  getRecentOrders(customerId: string, limit: number = 5): Order[] {
    return this.orders
      .filter(o => o.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Utility methods
  formatOrderDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatOrderStatus(status: OrderStatus): string {
    const statusMap = {
      [OrderStatus.PENDING]: 'Pendente',
      [OrderStatus.PROCESSING]: 'Processando',
      [OrderStatus.SHIPPED]: 'Enviado',
      [OrderStatus.DELIVERED]: 'Entregue',
      [OrderStatus.CANCELLED]: 'Cancelado'
    };
    return statusMap[status];
  }

  getStatusColor(status: OrderStatus): string {
    const colorMap = {
      [OrderStatus.PENDING]: '#FF9500',
      [OrderStatus.PROCESSING]: '#007AFF',
      [OrderStatus.SHIPPED]: '#34C759',
      [OrderStatus.DELIVERED]: '#30D158',
      [OrderStatus.CANCELLED]: '#FF3B30'
    };
    return colorMap[status];
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
  }

  getEstimatedDelivery(order: Order): Date {
    const deliveryDays = order.shipping === 0 ? 3 : 7; // Free shipping is faster
    const estimatedDate = new Date(order.createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
    return estimatedDate;
  }

  // State management
  getIsLoading(): boolean {
    return this.isLoading;
  }

  getError(): string | null {
    return this.error;
  }

  clearError(): void {
    this.setError(null);
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

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMockOrders(): void {
    // Mock orders for testing
    this.orders = [
      {
        id: 'ORD-1001',
        customerId: 'user123',
        items: [
          {
            productId: 1,
            productName: 'iPhone 15 Pro',
            price: 8999.99,
            quantity: 1,
            total: 8999.99
          }
        ],
        status: OrderStatus.DELIVERED,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        subtotal: 8999.99,
        shipping: 0,
        tax: 719.99,
        total: 9719.98,
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        },
        paymentMethod: {
          type: 'credit_card',
          details: '**** 1234'
        }
      },
      {
        id: 'ORD-1002',
        customerId: 'user123',
        items: [
          {
            productId: 6,
            productName: 'AirPods Pro 2ª Geração',
            price: 1999.99,
            quantity: 1,
            total: 1999.99
          },
          {
            productId: 3,
            productName: 'Camiseta Nike Dri-FIT',
            price: 89.99,
            quantity: 1,
            total: 89.99
          }
        ],
        status: OrderStatus.SHIPPED,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
        subtotal: 2089.98,
        shipping: 0,
        tax: 167.20,
        total: 2257.18,
        shippingAddress: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        },
        paymentMethod: {
          type: 'pix',
          details: 'PIX'
        }
      }
    ];
  }
}
