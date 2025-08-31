import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart, Product } from '../context/CartContext';

interface RouteParams {
  productId: number;
}

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { addItem } = useCart();
  const { productId } = route.params as RouteParams;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Mock data - substituir por chamada real da API
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 8999.99,
      description: 'O iPhone 15 Pro é o smartphone mais avançado da Apple, equipado com o revolucionário chip A17 Pro. Com uma tela Super Retina XDR de 6,1 polegadas, sistema de câmeras Pro com zoom óptico de 3x e construção em titânio de grau aeroespacial, oferece desempenho excepcional e durabilidade premium.',
      imageUrl: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro',
      category: 'electronics',
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 12999.99,
      description: 'O MacBook Air com chip M2 redefine a portabilidade sem comprometer o desempenho. Com até 18 horas de bateria, tela Liquid Retina de 13,6 polegadas e design ultrafino, é perfeito para trabalho e criatividade em qualquer lugar.',
      imageUrl: 'https://via.placeholder.com/300x300/34C759/FFFFFF?text=MacBook+Air',
      category: 'electronics',
    },
    {
      id: 3,
      name: 'Camiseta Nike Dri-FIT',
      price: 89.99,
      description: 'Camiseta esportiva Nike com tecnologia Dri-FIT que mantém você seco e confortável durante os treinos. Tecido respirável e ajuste atlético para máximo desempenho.',
      imageUrl: 'https://via.placeholder.com/300x300/FF3B30/FFFFFF?text=Nike+Dri-FIT',
      category: 'clothing',
    },
    {
      id: 4,
      name: 'Tênis Adidas Ultraboost',
      price: 299.99,
      description: 'Tênis de corrida com tecnologia Boost para retorno de energia a cada passada. Cabedal Primeknit adaptável e sola Continental para máxima aderência.',
      imageUrl: 'https://via.placeholder.com/300x300/FF9500/FFFFFF?text=Ultraboost',
      category: 'sports',
    },
    {
      id: 5,
      name: 'Sofá Moderno 3 Lugares',
      price: 1899.99,
      description: 'Sofá contemporâneo de 3 lugares em couro sintético premium. Design elegante com estrutura em madeira maciça e espuma de alta densidade para máximo conforto.',
      imageUrl: 'https://via.placeholder.com/300x300/8E4EC6/FFFFFF?text=Sofa+Moderno',
      category: 'home',
    },
    {
      id: 6,
      name: 'AirPods Pro 2ª Geração',
      price: 1999.99,
      description: 'Fones de ouvido sem fio com cancelamento ativo de ruído de nova geração. Áudio espacial personalizado e até 6 horas de reprodução com uma única carga.',
      imageUrl: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=AirPods+Pro',
      category: 'electronics',
    },
  ];

  useEffect(() => {
    // Simular carregamento da API
    setTimeout(() => {
      const foundProduct = mockProducts.find(p => p.id === productId);
      setProduct(foundProduct || null);
      setLoading(false);
    }, 800);
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      Alert.alert(
        'Adicionado ao Carrinho',
        `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
        [{ text: 'OK' }]
      );
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      </View>

      {/* Product Info */}
      <View style={styles.contentContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>
          R$ {product.price.toFixed(2).replace('.', ',')}
        </Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantidade</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons 
                name="remove" 
                size={20} 
                color={quantity <= 1 ? '#C7C7CC' : '#007AFF'} 
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Entrega rápida</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Garantia de 1 ano</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Troca grátis em 30 dias</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={24} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            Adicionar ao Carrinho - R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginTop: 15,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 5,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginHorizontal: 20,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#3C3C43',
    marginLeft: 10,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 40,
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
