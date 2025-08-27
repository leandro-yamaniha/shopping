import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productsAPI } from '../services/api';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getLatest(8);
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <h1>Welcome to ShopApp</h1>
              <p className="lead">
                Discover amazing products with our reactive shopping experience. 
                Built with Spring Boot 4, Java 21, and React.
              </p>
              <Button as={Link} to="/products" size="lg" className="me-3">
                Shop Now
              </Button>
              <Button as={Link} to="/register" variant="outline-light" size="lg">
                Join Us
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Products */}
      <Container className="py-5">
        <Row>
          <Col>
            <h2 className="text-center mb-5">Featured Products</h2>
          </Col>
        </Row>

        {isLoading ? (
          <div className="loading-spinner">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Row>
            {featuredProducts.map((product) => (
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
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="product-price">${product.price}</span>
                      <Button
                        as={Link}
                        to={`/products/${product.id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {!isLoading && featuredProducts.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-box-seam"></i>
            <h4>No products available</h4>
            <p>Check back later for new products!</p>
          </div>
        )}
      </Container>

      {/* Features Section */}
      <section className="bg-light py-5">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center mb-5">Why Choose ShopApp?</h2>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="mb-3">
                <i className="bi bi-lightning-charge text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>Reactive Performance</h4>
              <p className="text-muted">
                Built with Spring WebFlux for lightning-fast, non-blocking operations.
              </p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="mb-3">
                <i className="bi bi-shield-check text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>Secure Shopping</h4>
              <p className="text-muted">
                JWT authentication and secure payment processing for peace of mind.
              </p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="mb-3">
                <i className="bi bi-phone text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>Multi-Platform</h4>
              <p className="text-muted">
                Shop on web or mobile with our React and React Native apps.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
