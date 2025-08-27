import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: 'credit_card',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await ordersAPI.createFromCart(
        user.userId,
        formData.shippingAddress,
        formData.billingAddress,
        formData.paymentMethod
      );
      
      await clearCart();
      navigate(`/orders/${response.data.id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Your cart is empty. <Alert.Link href="/products">Continue shopping</Alert.Link>
        </Alert>
      </Container>
    );
  }

  const tax = total * 0.1;
  const finalTotal = total + tax;

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">Checkout</h1>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Shipping Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                    placeholder="Enter your complete shipping address"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Billing Address (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="Leave blank to use shipping address"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Payment Method *</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-100"
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              {items.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-0">
                <strong>Total:</strong>
                <strong>${finalTotal.toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
