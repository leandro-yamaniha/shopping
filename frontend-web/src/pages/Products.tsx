import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Products: React.FC = () => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    setIsLoading(true);
    try {
      const response = await productsAPI.search(searchTerm);
      setProducts(response.data);
    } catch (error) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceFilter = async () => {
    if (!minPrice || !maxPrice) {
      fetchProducts();
      return;
    }

    setIsLoading(true);
    try {
      const response = await productsAPI.getByPriceRange(
        parseFloat(minPrice),
        parseFloat(maxPrice)
      );
      setProducts(response.data);
    } catch (error) {
      setError('Price filter failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await addItem(productId, 1);
      alert('Item added to cart!');
    } catch (error) {
      alert('Failed to add item to cart');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    fetchProducts();
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">Products</h1>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-primary" onClick={handleSearch}>
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Form.Control
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Button variant="outline-primary" onClick={handlePriceFilter}>
              Filter
            </Button>
          </InputGroup>
        </Col>
        <Col md={2}>
          <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
            Clear
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product.id} lg={3} md={4} sm={6} className="mb-4">
              <Card className="product-card h-100">
                <Card.Img
                  variant="top"
                  src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Product'}
                  className="product-image"
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6">{product.name}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {product.description?.substring(0, 100)}...
                  </Card.Text>
                  <div className="mb-2">
                    <span className="product-price">${product.price}</span>
                    <small className="text-muted ms-2">
                      Stock: {product.stockQuantity}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/products/${product.id}`}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stockQuantity === 0}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {!isLoading && products.length === 0 && (
        <div className="empty-state">
          <i className="bi bi-search"></i>
          <h4>No products found</h4>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </Container>
  );
};

export default Products;
