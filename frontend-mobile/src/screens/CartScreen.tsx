import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart, CartItem } from '../context/CartContext';

export default function CartScreen() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  const handleRemoveItem = (id: number, name: string) => {
    Alert.alert(
      'Remover Item',
      `Deseja remover "${name}" do carrinho?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeItem(id) },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Limpar Carrinho',
      'Deseja remover todos os itens do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    Alert.alert(
      'Finalizar Compra',
      `Total: R$ ${state.total.toFixed(2).replace('.', ',')}\n\nEsta funcionalidade será implementada em breve.`,
      [{ text: 'OK' }]
    );
  };

  const incrementQuantity = (id: number, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };

  const decrementQuantity = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          R$ {item.price.toFixed(2).replace('.', ',')}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decrementQuantity(item.id, item.quantity)}
            disabled={item.quantity <= 1}
          >
            <Ionicons 
              name="remove" 
              size={16} 
              color={item.quantity <= 1 ? '#C7C7CC' : '#007AFF'} 
            />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => incrementQuantity(item.id, item.quantity)}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
      <Text style={styles.emptySubtitle}>
        Adicione produtos para começar suas compras
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carrinho</Text>
        {state.items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {state.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={state.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                R$ {state.total.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete:</Text>
              <Text style={styles.summaryValue}>Grátis</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                R$ {state.total.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>
                Finalizar Compra ({state.items.reduce((sum, item) => sum + item.quantity, 0)} itens)
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  clearButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginHorizontal: 15,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#3C3C43',
  },
  summaryValue: {
    fontSize: 16,
    color: '#3C3C43',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 15,
    marginTop: 5,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 40,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
