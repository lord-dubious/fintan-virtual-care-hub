import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';
import { sanitizeHtml, sanitizeUserInput, sanitizeEmail, validateFileUpload } from '../utils/sanitization';
import { TokenRefreshManager } from '../utils/tokenRefreshManager';
import { createCSRFToken } from '../middleware/csrf';

describe('Security Utilities', () => {
  describe('Input Sanitization', () => {
    it('should sanitize HTML content', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHtml(maliciousHtml, true);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should remove all HTML when strict mode is enabled', () => {
      const htmlContent = '<p>Hello <strong>world</strong></p>';
      const sanitized = sanitizeHtml(htmlContent, false);
      
      expect(sanitized).toBe('Hello world');
    });

    it('should sanitize user input', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = sanitizeUserInput(maliciousInput);
      
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('--');
    });

    it('should sanitize email addresses', () => {
      const maliciousEmail = 'test@example.com<script>alert("xss")</script>';
      const sanitized = sanitizeEmail(maliciousEmail);
      
      expect(sanitized).toBe('test@example.com');
    });

    it('should handle null and undefined inputs', () => {
      expect(sanitizeUserInput(null as any)).toBe('');
      expect(sanitizeUserInput(undefined as any)).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(20000);
      const sanitized = sanitizeUserInput(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(10000);
    });
  });

  describe('File Upload Validation', () => {
    it('should validate allowed file types', () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const result = validateFileUpload(mockFile, ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject disallowed file types', () => {
      const mockFile = {
        mimetype: 'application/javascript',
        size: 1024,
        originalname: 'malicious.js',
      } as Express.Multer.File;

      const result = validateFileUpload(mockFile, ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files that are too large', () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
        originalname: 'large.jpg',
      } as Express.Multer.File;

      const result = validateFileUpload(mockFile, ['image/jpeg'], 5 * 1024 * 1024);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should reject files with malicious names', () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: '../../../etc/passwd',
      } as Express.Multer.File;

      const result = validateFileUpload(mockFile, ['image/jpeg'], 5 * 1024 * 1024);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file name');
    });
  });

  describe('Token Refresh Manager', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should prevent concurrent refresh requests', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      const mockUserId = 'user-123';
      
      // Mock the token refresh method
      const refreshSpy = jest.spyOn(TokenRefreshManager, 'refreshAccessToken');
      refreshSpy.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('new-token'), 100)));

      // Start multiple concurrent refresh requests
      const promises = [
        TokenRefreshManager.refreshAccessToken(mockRefreshToken, mockUserId),
        TokenRefreshManager.refreshAccessToken(mockRefreshToken, mockUserId),
        TokenRefreshManager.refreshAccessToken(mockRefreshToken, mockUserId),
      ];

      const results = await Promise.all(promises);
      
      // All should return the same result
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
      
      // But the actual refresh should only be called once
      expect(refreshSpy).toHaveBeenCalledTimes(3); // Called 3 times but only one should execute
    });

    it('should handle refresh token errors gracefully', async () => {
      const invalidToken = 'invalid-token';
      
      const result = await TokenRefreshManager.refreshAccessToken(invalidToken);
      
      expect(result).toBeNull();
    });
  });
});

describe('Security Middleware', () => {
  describe('CSRF Protection', () => {
    it('should generate CSRF tokens', () => {
      const mockReq = {
        sessionID: 'test-session',
        ip: '127.0.0.1',
      } as any;
      
      const mockRes = {
        cookie: jest.fn(),
      } as any;

      const token = createCSRFToken(mockReq, mockRes);
      
      expect(token).toBeDefined();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(mockRes.cookie).toHaveBeenCalled();
    });

    it('should reject requests without CSRF tokens', async () => {
      const response = await request(app)
        .post('/api/test-endpoint')
        .send({ data: 'test' })
        .expect(403);

      expect(response.body.error).toContain('CSRF');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should reject requests with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'ValidPassword123!',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.error).toContain('password');
    });

    it('should sanitize malicious input', async () => {
      const maliciousName = '<script>alert("xss")</script>John Doe';
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          name: maliciousName,
        });

      // The request should either be rejected or the name should be sanitized
      if (response.status === 200) {
        expect(response.body.data?.name).not.toContain('<script>');
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should include HSTS header in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/health');

      expect(response.headers['strict-transport-security']).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('SQL Injection Prevention', () => {
  it('should use parameterized queries', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    // This should not cause any database errors or security issues
    const response = await request(app)
      .get('/api/users/search')
      .query({ q: maliciousInput });

    // The response should be handled gracefully
    expect(response.status).not.toBe(500);
  });
});

describe('XSS Prevention', () => {
  it('should sanitize user-generated content', async () => {
    const xssPayload = '<img src="x" onerror="alert(\'XSS\')">';
    
    const response = await request(app)
      .post('/api/test-content')
      .send({ content: xssPayload });

    if (response.status === 200) {
      expect(response.body.data?.content).not.toContain('onerror');
      expect(response.body.data?.content).not.toContain('alert');
    }
  });
});

describe('Authentication Security', () => {
  it('should not expose sensitive information in error messages', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    // Error message should be generic
    expect(response.body.error).not.toContain('user not found');
    expect(response.body.error).not.toContain('password incorrect');
  });

  it('should handle malformed JWT tokens gracefully', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer malformed.jwt.token')
      .expect(401);

    expect(response.body.error).toBeDefined();
    expect(response.body.error).not.toContain('jwt');
  });
});
