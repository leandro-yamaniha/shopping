import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await ordersAPI.getByUser(user.userId);
      setOrders(response.data);
    } catch (error) {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'PROCESSING': return 'primary';
      case 'SHIPPED': return 'secondary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'RETURNED': return 'dark';
      default: return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PAID': return 'success';
      case 'FAILED': return 'danger';
      case 'REFUNDED': return 'info';
      case 'PARTIALLY_REFUNDED': return 'secondary';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">My Orders</h1>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bag-x"></i>
          <h4>No orders found</h4>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products">
            <Button variant="primary">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <Row>
          {orders.map((order) => (
            <Col key={order.id} lg={6} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="mb-1">Order #{order.orderNumber}</h6>
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge bg={getStatusBadgeVariant(order.status)} className="mb-1">
                        {order.status}
                      </Badge>
                      <br />
                      <Badge bg={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Total: ${order.totalAmount}</strong>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Shipping:</strong><br />
                      {order.shippingAddress.substring(0, 50)}...
                    </small>
                  </div>

                  {order.paymentMethod && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Payment:</strong> {order.paymentMethod.replace('_', ' ').toUpperCase()}
                      </small>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <Link to={`/orders/${order.id}`}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Link>
                    {order.status === 'PENDING' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement cancel order
                          alert('Cancel order functionality to be implemented');
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Orders;
