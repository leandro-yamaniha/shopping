import React from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { items, total, isLoading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateItem(productId, newQuantity);
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        alert('Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
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
          <h1 className="mb-4">Shopping Cart</h1>
        </Col>
      </Row>

      {items.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-cart-x"></i>
          <h4>Your cart is empty</h4>
          <p>Add some products to get started!</p>
          <Link to="/products">
            <Button variant="primary">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.product?.imageUrl || 'https://via.placeholder.com/60x60?text=Product'}
                              alt={item.product?.name}
                              className="me-3"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-0">{item.product?.name}</h6>
                              <small className="text-muted">
                                SKU: {item.product?.sku}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>${item.unitPrice}</td>
                        <td>
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="quantity-input"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                              min="1"
                            />
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <div className="mt-3">
              <Button variant="outline-secondary" onClick={handleClearCart}>
                Clear Cart
              </Button>
              <Link to="/products">
                <Button variant="outline-primary" className="ms-2">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>${(total * 0.1).toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong>${(total * 1.1).toFixed(2)}</strong>
                </div>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
