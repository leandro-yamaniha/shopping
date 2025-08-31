import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { getItemCount } = useCart();

  const categories = [
    { id: 1, name: 'Eletrônicos', icon: 'phone-portrait-outline', color: '#007AFF' },
    { id: 2, name: 'Roupas', icon: 'shirt-outline', color: '#FF3B30' },
    { id: 3, name: 'Casa', icon: 'home-outline', color: '#34C759' },
    { id: 4, name: 'Esportes', icon: 'football-outline', color: '#FF9500' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 8999.99,
      image: 'https://via.placeholder.com/150x150/007AFF/FFFFFF?text=iPhone',
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 12999.99,
      image: 'https://via.placeholder.com/150x150/34C759/FFFFFF?text=MacBook',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>O que você está procurando hoje?</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Ionicons name="cart-outline" size={24} color="#007AFF" />
          {getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Products' as never)}
      >
        <Ionicons name="search-outline" size={20} color="#8E8E93" />
        <Text style={styles.searchText}>Buscar produtos...</Text>
      </TouchableOpacity>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.color + '15' }]}
              onPress={() => navigation.navigate('Products' as never)}
            >
              <Ionicons name={category.icon as any} size={32} color={category.color} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produtos em Destaque</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('Products' as never, { 
                screen: 'ProductDetail', 
                params: { productId: product.id } 
              } as never)}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Orders' as never)}
          >
            <Ionicons name="receipt-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Meus Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Cart' as never)}
          >
            <Ionicons name="cart-outline" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginLeft: 20,
    padding: 15,
    borderRadius: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 130,
    height: 130,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});
