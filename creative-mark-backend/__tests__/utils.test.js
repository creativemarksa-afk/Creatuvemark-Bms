import jwt from 'jsonwebtoken';

/**
 * Unit tests for utility functions
 */

describe('JWT Token Generation', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

  // Helper function to test (you can extract this from authController)
  const generateToken = (userId, role) => {
    return jwt.sign(
      { id: userId, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  };

  it('should generate a valid JWT token', () => {
    const userId = '123456';
    const role = 'client';

    const token = generateToken(userId, role);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should include userId and role in token payload', () => {
    const userId = '123456';
    const role = 'admin';

    const token = generateToken(userId, role);
    const decoded = jwt.verify(token, JWT_SECRET);

    expect(decoded.id).toBe(userId);
    expect(decoded.role).toBe(role);
    expect(decoded.exp).toBeDefined();
  });

  it('should create tokens that expire in 7 days', () => {
    const token = generateToken('123', 'client');
    const decoded = jwt.verify(token, JWT_SECRET);

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    // Check if expiration is approximately 7 days from now (within 1 minute)
    expect(expirationTime - now).toBeGreaterThan(sevenDaysInMs - 60000);
    expect(expirationTime - now).toBeLessThan(sevenDaysInMs + 60000);
  });
});

describe('Email Validation', () => {
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('should validate correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

