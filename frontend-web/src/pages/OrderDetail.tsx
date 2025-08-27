import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, OrderItem } from '../types';
import { ordersAPI } from '../services/api';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      const [orderResponse, itemsResponse] = await Promise.all([
        ordersAPI.getById(orderId),
        ordersAPI.getItems(orderId),
      ]);
      setOrder(orderResponse.data);
      setOrderItems(itemsResponse.data);
    } catch (error) {
      setError('Order not found');
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

  if (error || !order) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || 'Order not found'}</Alert>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Order #{order.orderNumber}</h1>
            <Button variant="outline-secondary" onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>Product ID: {item.productId}</td>
                      <td>${item.unitPrice}</td>
                      <td>{item.quantity}</td>
                      <td>${item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Shipping Address:</strong>
                <p className="mb-0 mt-1">{order.shippingAddress}</p>
              </div>
              {order.billingAddress && (
                <div>
                  <strong>Billing Address:</strong>
                  <p className="mb-0 mt-1">{order.billingAddress}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Order Status:</strong>
                <br />
                <Badge bg={getStatusBadgeVariant(order.status)} className="mt-1">
                  {order.status}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Payment Status:</strong>
                <br />
                <Badge bg={getPaymentStatusBadgeVariant(order.paymentStatus)} className="mt-1">
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="mb-3">
                  <strong>Payment Method:</strong>
                  <br />
                  {order.paymentMethod.replace('_', ' ').toUpperCase()}
                </div>
              )}
              <div className="mb-3">
                <strong>Order Date:</strong>
                <br />
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {order.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="mb-0 mt-1">{order.notes}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${(order.totalAmount / 1.1).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${(order.totalAmount * 0.1 / 1.1).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>${order.totalAmount}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetail;
