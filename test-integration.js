#!/usr/bin/env node

/**
 * Integration Test: Frontend Mobile <-> Backend API
 * Tests the communication between React Native frontend and Spring WebFlux backend
 */

const axios = require('axios');

// Test configuration
const BACKEND_URL = 'http://localhost:8080/api/mobile';
const FRONTEND_URL = 'http://localhost:8090';

async function testBackendHealth() {
    console.log('🔍 Testing Backend Health...');
    try {
        const response = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Backend Health:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Backend Health Failed:', error.message);
        return false;
    }
}

async function testFrontendHealth() {
    console.log('🔍 Testing Frontend Health...');
    try {
        const response = await axios.get(FRONTEND_URL);
        console.log('✅ Frontend Health: Expo server running');
        return true;
    } catch (error) {
        console.error('❌ Frontend Health Failed:', error.message);
        return false;
    }
}

async function testProductsAPI() {
    console.log('🔍 Testing Products API...');
    try {
        const response = await axios.get(`${BACKEND_URL}/products`);
        const products = response.data;
        
        console.log(`✅ Products API: Retrieved ${products.length} products`);
        console.log('📦 Sample Product:', {
            id: products[0].id,
            name: products[0].name,
            price: products[0].price,
            stock: products[0].stock
        });
        
        return products.length > 0;
    } catch (error) {
        console.error('❌ Products API Failed:', error.message);
        return false;
    }
}

async function testCategoriesAPI() {
    console.log('🔍 Testing Categories API...');
    try {
        const response = await axios.get(`${BACKEND_URL}/categories`);
        const categories = response.data;
        
        console.log(`✅ Categories API: Retrieved ${categories.length} categories`);
        console.log('🏷️  Categories:', categories.slice(0, 3));
        
        return categories.length > 0;
    } catch (error) {
        console.error('❌ Categories API Failed:', error.message);
        return false;
    }
}

async function testCORSHeaders() {
    console.log('🔍 Testing CORS Configuration...');
    try {
        const response = await axios.get(`${BACKEND_URL}/products`, {
            headers: {
                'Origin': 'http://127.0.0.1:8090'
            }
        });
        
        console.log('✅ CORS: Request successful from Expo origin');
        return true;
    } catch (error) {
        console.error('❌ CORS Failed:', error.message);
        return false;
    }
}

async function testFrontendAPIIntegration() {
    console.log('🔍 Testing Frontend API Service...');
    try {
        // Simulate the frontend API call
        const response = await axios.get(`${BACKEND_URL}/products`, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://127.0.0.1:8090'
            },
            timeout: 10000
        });
        
        const products = response.data;
        console.log('✅ Frontend API Integration: Successfully retrieved products');
        console.log(`📱 Mobile-optimized response: ${JSON.stringify(products[0]).length} bytes per product`);
        
        return true;
    } catch (error) {
        console.error('❌ Frontend API Integration Failed:', error.message);
        return false;
    }
}

async function runIntegrationTests() {
    console.log('🚀 Starting Integration Tests...\n');
    
    const tests = [
        { name: 'Backend Health', fn: testBackendHealth },
        { name: 'Frontend Health', fn: testFrontendHealth },
        { name: 'Products API', fn: testProductsAPI },
        { name: 'Categories API', fn: testCategoriesAPI },
        { name: 'CORS Configuration', fn: testCORSHeaders },
        { name: 'Frontend API Integration', fn: testFrontendAPIIntegration }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await test.fn();
        if (result) {
            passed++;
        } else {
            failed++;
        }
        console.log(''); // Empty line for readability
    }
    
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All integration tests passed! Frontend and Backend are properly connected.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
    
    return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Test runner crashed:', error);
            process.exit(1);
        });
}

module.exports = { runIntegrationTests };
