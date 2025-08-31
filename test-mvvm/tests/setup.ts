// Global test setup
beforeAll(() => {
  // Mock console.log to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Mock performance.now for consistent timing tests
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Global test utilities
(global as any).delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
