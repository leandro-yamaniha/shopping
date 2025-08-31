export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  sortBy?: 'name' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export class ProductModel {
  private products: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 8999.99,
      description: 'O mais avançado iPhone com chip A17 Pro',
      imageUrl: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro',
      category: 'electronics',
      stock: 50,
      rating: 4.8,
      reviews: 1250
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 12999.99,
      description: 'Notebook ultrafino com chip M2',
      imageUrl: 'https://via.placeholder.com/300x300/34C759/FFFFFF?text=MacBook+Air',
      category: 'electronics',
      stock: 25,
      rating: 4.9,
      reviews: 890
    },
    {
      id: 3,
      name: 'Camiseta Nike Dri-FIT',
      price: 89.99,
      description: 'Camiseta esportiva com tecnologia Dri-FIT',
      imageUrl: 'https://via.placeholder.com/300x300/FF3B30/FFFFFF?text=Nike+Dri-FIT',
      category: 'clothing',
      stock: 100,
      rating: 4.5,
      reviews: 320
    },
    {
      id: 4,
      name: 'Tênis Adidas Ultraboost',
      price: 299.99,
      description: 'Tênis de corrida com tecnologia Boost',
      imageUrl: 'https://via.placeholder.com/300x300/FF9500/FFFFFF?text=Ultraboost',
      category: 'sports',
      stock: 75,
      rating: 4.7,
      reviews: 540
    },
    {
      id: 5,
      name: 'Sofá Moderno 3 Lugares',
      price: 1899.99,
      description: 'Sofá contemporâneo em couro sintético premium',
      imageUrl: 'https://via.placeholder.com/300x300/8E4EC6/FFFFFF?text=Sofa+Moderno',
      category: 'home',
      stock: 15,
      rating: 4.6,
      reviews: 180
    },
    {
      id: 6,
      name: 'AirPods Pro 2ª Geração',
      price: 1999.99,
      description: 'Fones sem fio com cancelamento ativo de ruído',
      imageUrl: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=AirPods+Pro',
      category: 'electronics',
      stock: 60,
      rating: 4.8,
      reviews: 720
    }
  ];

  getAllProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  searchProducts(filter: ProductFilter): Product[] {
    let filtered = [...this.products];

    if (filter.category) {
      filtered = filtered.filter(p => p.category === filter.category);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filter.maxPrice!);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }

    if (filter.sortBy) {
      const field = filter.sortBy;
      const order = filter.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const aValue = a[field as keyof Product];
        const bValue = b[field as keyof Product];
        
        if (aValue !== undefined && bValue !== undefined) {
          if (aValue < bValue) return -1 * order;
          if (aValue > bValue) return 1 * order;
        }
        return 0;
      });
    }

    return filtered;
  }

  updateStock(productId: number, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (product && product.stock >= quantity) {
      product.stock -= quantity;
      return true;
    }
    return false;
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }
}
