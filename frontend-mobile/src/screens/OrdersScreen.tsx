import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - substituir por chamada real da API
  const mockOrders: Order[] = [
    {
      id: 1001,
      date: '2024-01-15',
      status: 'delivered',
      total: 8999.99,
      items: [
        { id: 1, productName: 'iPhone 15 Pro', quantity: 1, price: 8999.99 },
      ],
    },
    {
      id: 1002,
      date: '2024-01-20',
      status: 'shipped',
      total: 2089.98,
      items: [
        { id: 2, productName: 'AirPods Pro 2ª Geração', quantity: 1, price: 1999.99 },
        { id: 3, productName: 'Camiseta Nike Dri-FIT', quantity: 1, price: 89.99 },
      ],
    },
    {
      id: 1003,
      date: '2024-01-25',
      status: 'processing',
      total: 12999.99,
      items: [
        { id: 4, productName: 'MacBook Air M2', quantity: 1, price: 12999.99 },
      ],
    },
    {
      id: 1004,
      date: '2024-01-28',
      status: 'pending',
      total: 599.98,
      items: [
        { id: 5, productName: 'Tênis Adidas Ultraboost', quantity: 2, price: 299.99 },
      ],
    },
  ];

  useEffect(() => {
    // Simular carregamento da API
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: '#FF9500', icon: 'time-outline' };
      case 'processing':
        return { label: 'Processando', color: '#007AFF', icon: 'refresh-outline' };
      case 'shipped':
        return { label: 'Enviado', color: '#34C759', icon: 'airplane-outline' };
      case 'delivered':
        return { label: 'Entregue', color: '#30D158', icon: 'checkmark-circle-outline' };
      case 'cancelled':
        return { label: 'Cancelado', color: '#FF3B30', icon: 'close-circle-outline' };
      default:
        return { label: 'Desconhecido', color: '#8E8E93', icon: 'help-circle-outline' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Pedido #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items.map((orderItem, index) => (
            <View key={orderItem.id} style={styles.orderItemRow}>
              <Text style={styles.itemName}>
                {orderItem.quantity}x {orderItem.productName}
              </Text>
              <Text style={styles.itemPrice}>
                R$ {(orderItem.price * orderItem.quantity).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>
            Total: R$ {item.total.toFixed(2).replace('.', ',')}
          </Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Seus pedidos aparecerão aqui após a primeira compra
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>

      {orders.length === 0 ? (
        renderEmptyOrders()
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  ordersList: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#3C3C43',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#3C3C43',
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 15,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
