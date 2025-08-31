import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data);
    } catch (error) {
      setError('Product not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      await addItem(product.id, quantity);
      alert('Item added to cart!');
    } catch (error) {
      alert('Failed to add item to cart');
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

  if (error || !product) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button variant="primary" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={6}>
          <Card>
            <Card.Img
              variant="top"
              src={product.imageUrl || 'https://via.placeholder.com/500x400?text=Product'}
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        <Col md={6}>
          <div className="ps-md-4">
            <h1 className="mb-3">{product.name}</h1>
            
            <div className="mb-3">
              <span className="product-price me-3">${product.price}</span>
              {product.active ? (
                <Badge bg="success">Available</Badge>
              ) : (
                <Badge bg="danger">Unavailable</Badge>
              )}
            </div>

            <div className="mb-3">
              <strong>Stock: </strong>
              <span className={product.stockQuantity > 0 ? 'text-success' : 'text-danger'}>
                {product.stockQuantity} units
              </span>
            </div>

            {product.sku && (
              <div className="mb-3">
                <strong>SKU: </strong>{product.sku}
              </div>
            )}


            <div className="mb-4">
              <h5>Description</h5>
              <p className="text-muted">
                {product.description || 'No description available.'}
              </p>
            </div>

            <div className="mb-4">
              <label className="form-label">Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={product.stockQuantity}
                />
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>

            <div className="d-flex gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || quantity > product.stockQuantity}
                className="flex-grow-1"
              >
                Add to Cart
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={() => navigate('/products')}
              >
                Back
              </Button>
            </div>

            {!isAuthenticated && (
              <Alert variant="info" className="mt-3">
                Please <Alert.Link href="/login">login</Alert.Link> to add items to your cart.
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
