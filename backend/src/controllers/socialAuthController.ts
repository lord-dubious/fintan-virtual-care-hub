import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { generateAccessToken, generateRefreshToken, generateRefreshTokenExpiration } from '@/utils/tokens';
import { loggers } from '@/config/logger';
import { emailService } from '@/services/emailService';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Google OAuth client
const googleClient = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);

// Social provider configurations
const SOCIAL_PROVIDERS = {
  google: {
    name: 'Google',
    verifyToken: verifyGoogleToken,
  },
  apple: {
    name: 'Apple',
    verifyToken: verifyAppleToken,
  },
  microsoft: {
    name: 'Microsoft',
    verifyToken: verifyMicrosoftToken,
  },
};

/**
 * Authenticate with social provider
 * POST /api/auth/social
 */
export const authenticateWithSocial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, accessToken, idToken } = req.body;

    if (!provider || !accessToken) {
      res.status(400).json({
        success: false,
        error: 'Provider and access token are required',
      });
      return;
    }

    const providerConfig = SOCIAL_PROVIDERS[provider as keyof typeof SOCIAL_PROVIDERS];
    if (!providerConfig) {
      res.status(400).json({
        success: false,
        error: 'Unsupported social provider',
      });
      return;
    }

    // Verify token with the social provider
    const socialUserData = await providerConfig.verifyToken(accessToken, idToken);
    
    if (!socialUserData || !socialUserData.email) {
      res.status(400).json({
        success: false,
        error: 'Failed to verify social authentication',
      });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: socialUserData.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    let isNewUser = false;

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: socialUserData.email,
          name: socialUserData.name || socialUserData.email.split('@')[0],
          role: 'PATIENT', // Default role for social auth users
          emailVerified: new Date(), // Social auth emails are pre-verified
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      isNewUser = true;

      // Send welcome email for new users
      await emailService.sendWelcomeEmail(user.email!, user.name!);
      
      // Log new user registration
      loggers.auth.register(user.id, user.email!, user.role);
    }

    // Generate tokens
    const accessTokenJWT = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenValue = generateRefreshToken();
    const refreshTokenExpiresAt = generateRefreshTokenExpiration();

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Log successful authentication
    loggers.auth.login(user.id, user.email!, true, req.ip);

    res.status(200).json({
      success: true,
      data: {
        user,
        token: accessTokenJWT,
        refreshToken: refreshTokenValue,
        isNewUser,
      },
      message: isNewUser ? 'Account created successfully' : 'Signed in successfully',
    });
  } catch (error) {
    console.error('Social authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Social authentication failed',
    });
  }
};

/**
 * Get social provider configuration
 * GET /api/auth/social/config/:provider
 */
export const getSocialProviderConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;

    const configs = {
      google: {
        clientId: process.env['GOOGLE_CLIENT_ID'],
        enabled: !!process.env['GOOGLE_CLIENT_ID'],
      },
      apple: {
        clientId: process.env['APPLE_CLIENT_ID'],
        enabled: !!process.env['APPLE_CLIENT_ID'],
      },
      microsoft: {
        clientId: process.env['MICROSOFT_CLIENT_ID'],
        enabled: !!process.env['MICROSOFT_CLIENT_ID'],
      },
    };

    const config = configs[provider as keyof typeof configs];
    
    if (!config) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get social config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get provider configuration',
    });
  }
};

// Token verification functions
async function verifyGoogleToken(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    
    return {
      email: response.data.email,
      name: response.data.name,
      picture: response.data.picture,
      verified_email: response.data.verified_email,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
}

async function verifyAppleToken(accessToken: string, idToken?: string): Promise<any> {
  try {
    if (!idToken) {
      throw new Error('Apple ID token is required');
    }

    // Decode the ID token (Apple uses JWT)
    const decoded = jwt.decode(idToken, { complete: true });
    
    if (!decoded || !decoded.payload) {
      throw new Error('Invalid Apple ID token');
    }

    const payload = decoded.payload as any;
    
    return {
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0],
      email_verified: payload.email_verified,
    };
  } catch (error) {
    console.error('Apple token verification error:', error);
    throw new Error('Invalid Apple token');
  }
}

async function verifyMicrosoftToken(accessToken: string): Promise<any> {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return {
      email: response.data.mail || response.data.userPrincipalName,
      name: response.data.displayName,
      id: response.data.id,
    };
  } catch (error) {
    console.error('Microsoft token verification error:', error);
    throw new Error('Invalid Microsoft token');
  }
}
