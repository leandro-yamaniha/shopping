import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart, Product } from '../context/CartContext';

export default function ProductsScreen() {
  const navigation = useNavigation();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'electronics', name: 'Eletrônicos' },
    { id: 'clothing', name: 'Roupas' },
    { id: 'home', name: 'Casa' },
    { id: 'sports', name: 'Esportes' },
  ];

  // Mock data - substituir por chamada real da API
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 8999.99,
      description: 'O mais avançado iPhone com chip A17 Pro',
      imageUrl: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone',
      category: 'electronics',
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 12999.99,
      description: 'Notebook ultrafino com chip M2',
      imageUrl: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook',
      category: 'electronics',
    },
    {
      id: 3,
      name: 'Camiseta Nike',
      price: 89.99,
      description: 'Camiseta esportiva de alta qualidade',
      imageUrl: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=Nike',
      category: 'clothing',
    },
    {
      id: 4,
      name: 'Tênis Adidas',
      price: 299.99,
      description: 'Tênis confortável para corrida',
      imageUrl: 'https://via.placeholder.com/200x200/FF9500/FFFFFF?text=Adidas',
      category: 'sports',
    },
    {
      id: 5,
      name: 'Sofá Moderno',
      price: 1899.99,
      description: 'Sofá de 3 lugares em couro sintético',
      imageUrl: 'https://via.placeholder.com/200x200/8E4EC6/FFFFFF?text=Sofa',
      category: 'home',
    },
    {
      id: 6,
      name: 'AirPods Pro',
      price: 1999.99,
      description: 'Fones sem fio com cancelamento de ruído',
      imageUrl: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=AirPods',
      category: 'electronics',
    },
  ];

  useEffect(() => {
    // Simular carregamento da API
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail' as never, { productId: item.id } as never)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            R$ {item.price.toFixed(2).replace('.', ',')}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item.id && styles.categoryButtonTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produtos</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
      />

      {/* Products */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1C1C1E',
  },
  categoriesList: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  productsContent: {
    padding: 15,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 10,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
