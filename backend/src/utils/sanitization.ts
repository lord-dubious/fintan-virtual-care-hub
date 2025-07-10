import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import logger from '@/config/logger';

// HTML sanitization options
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'
  ],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

// Strict sanitization for user input (no HTML allowed)
const STRICT_SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string, allowBasicFormatting = false): string {
  if (typeof input !== 'string') {
    return '';
  }

  try {
    const options = allowBasicFormatting ? SANITIZE_OPTIONS : STRICT_SANITIZE_OPTIONS;
    return DOMPurify.sanitize(input, options);
  } catch (error) {
    logger.error('HTML sanitization error:', error);
    return '';
  }
}

/**
 * Sanitize user input by removing potentially dangerous characters
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove potential SQL injection patterns
    .replace(/['";\\]/g, '')
    // Limit length to prevent DoS
    .substring(0, 10000);
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '')
    .substring(0, 254); // RFC 5321 limit
}

/**
 * Sanitize phone numbers
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }

  return phone
    .replace(/[^\d+\-\s()]/g, '')
    .trim()
    .substring(0, 20);
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return '';
  }

  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Sanitize URL to prevent open redirects
 */
export function sanitizeUrl(url: string, allowedDomains: string[] = []): string {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    // Check against allowed domains if provided
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        return '';
      }
    }

    return urlObj.toString();
  } catch (error) {
    logger.warn('Invalid URL provided for sanitization:', url);
    return '';
  }
}

/**
 * Sanitize JSON data recursively
 */
export function sanitizeJsonData(data: unknown): unknown {
  if (typeof data === 'string') {
    return sanitizeUserInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeJsonData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeUserInput(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJsonData(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeRequestBody(allowHtml = false) {
  return (req: any, res: any, next: any) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObjectFields(req.body, allowHtml);
    }
    next();
  };
}

/**
 * Sanitize object fields based on field types
 */
function sanitizeObjectFields(obj: Record<string, any>, allowHtml = false): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Special handling for different field types
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        sanitized[key] = sanitizeUrl(value);
      } else if (allowHtml && (key.toLowerCase().includes('content') || key.toLowerCase().includes('description'))) {
        sanitized[key] = sanitizeHtml(value, true);
      } else {
        sanitized[key] = sanitizeUserInput(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeUserInput(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObjectFields(value, allowHtml);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validation schema for sanitized input
 */
export const sanitizedStringSchema = z.string().transform((val) => sanitizeUserInput(val));
export const sanitizedEmailSchema = z.string().email().transform((val) => sanitizeEmail(val));
export const sanitizedPhoneSchema = z.string().transform((val) => sanitizePhone(val));
export const sanitizedHtmlSchema = z.string().transform((val) => sanitizeHtml(val, true));

/**
 * Security headers for file uploads
 */
export const SECURE_FILE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'",
};

/**
 * Allowed file types for uploads
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain'],
  medical: ['application/pdf', 'image/jpeg', 'image/png'],
};

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  medical: 20 * 1024 * 1024, // 20MB
};

/**
 * Validate file upload security
 */
export function validateFileUpload(
  file: Express.Multer.File,
  allowedTypes: string[],
  maxSize: number
): { isValid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `File type ${file.mimetype} is not allowed`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
    };
  }

  // Check for malicious file names
  const sanitizedName = sanitizeFileName(file.originalname);
  if (!sanitizedName || sanitizedName !== file.originalname) {
    return {
      isValid: false,
      error: 'Invalid file name',
    };
  }

  return { isValid: true };
}

export default {
  sanitizeHtml,
  sanitizeUserInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFileName,
  sanitizeUrl,
  sanitizeJsonData,
  sanitizeRequestBody,
  sanitizedStringSchema,
  sanitizedEmailSchema,
  sanitizedPhoneSchema,
  sanitizedHtmlSchema,
  validateFileUpload,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
  SECURE_FILE_HEADERS,
};
