/**
 * Pikvita Quiz Configuration
 *
 * This file centralizes all configuration for the quiz.
 * Update these values for your production deployment.
 */

const QuizConfig = {
  // Environment
  environment: process.env.NODE_ENV || 'development',

  // API Endpoints
  api: {
    // Production API endpoint - UPDATE THIS!
    production: process.env.QUIZ_API_ENDPOINT || 'https://api.pikvita.com/api/quiz-responses',

    // Staging API endpoint
    staging: process.env.QUIZ_API_STAGING || 'https://staging-api.pikvita.com/api/quiz-responses',

    // Development/local API endpoint
    development: 'http://localhost:3000/api/quiz-responses',

    // Get current endpoint based on environment
    get endpoint() {
      return this[QuizConfig.environment] || this.production;
    }
  },

  // Embed Configuration
  embed: {
    // Production embed URL - UPDATE THIS!
    baseUrl: process.env.QUIZ_EMBED_URL || 'https://quiz.pikvita.com/embed',

    // CDN URL for faster loading (optional)
    cdnUrl: process.env.QUIZ_CDN_URL || 'https://cdn.pikvita.com/quiz',

    // Default dimensions
    defaultWidth: '100%',
    defaultHeight: '800px',

    // Theme options
    themes: ['default', 'dark', 'minimal']
  },

  // Database Configuration
  database: {
    // MongoDB connection string - UPDATE THIS!
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pikvita-quiz',

    // Database name
    dbName: process.env.MONGODB_DB_NAME || 'pikvita-quiz',

    // Connection options
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Email Service Configuration
  email: {
    // Service provider: 'sendgrid', 'mailgun', 'ses'
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',

    // SendGrid
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.EMAIL_FROM || 'hello@pikvita.com',
      fromName: process.env.EMAIL_FROM_NAME || 'Pikvita Team',
      replyTo: process.env.EMAIL_REPLY_TO || 'hello@pikvita.com'
    },

    // Mailgun
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY || '',
      domain: process.env.MAILGUN_DOMAIN || 'pikvita.com',
      fromEmail: process.env.EMAIL_FROM || 'hello@pikvita.com'
    },

    // AWS SES
    ses: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      fromEmail: process.env.EMAIL_FROM || 'hello@pikvita.com'
    }
  },

  // Waitlist Integration
  waitlist: {
    // Service provider: 'custom', 'mailchimp', 'convertkit'
    provider: process.env.WAITLIST_PROVIDER || 'custom',

    // Custom API endpoint
    apiEndpoint: process.env.WAITLIST_API_ENDPOINT || 'https://api.pikvita.com/waitlist',

    // Mailchimp
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY || '',
      listId: process.env.MAILCHIMP_LIST_ID || '',
      server: process.env.MAILCHIMP_SERVER || 'us1'
    },

    // ConvertKit
    convertkit: {
      apiKey: process.env.CONVERTKIT_API_KEY || '',
      formId: process.env.CONVERTKIT_FORM_ID || ''
    }
  },

  // Analytics Configuration
  analytics: {
    // Google Analytics
    googleAnalytics: {
      enabled: process.env.GA_ENABLED !== 'false',
      measurementId: process.env.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
    },

    // Facebook Pixel
    facebookPixel: {
      enabled: process.env.FB_PIXEL_ENABLED !== 'false',
      pixelId: process.env.FB_PIXEL_ID || ''
    },

    // Custom analytics endpoint
    customEndpoint: process.env.ANALYTICS_ENDPOINT || ''
  },

  // Security
  security: {
    // API key for accessing analytics
    apiKey: process.env.API_KEY || 'change-me-in-production',

    // CORS allowed origins
    corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),

    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // max requests per window
    }
  },

  // Feature Flags
  features: {
    emailNotifications: process.env.FEATURE_EMAIL !== 'false',
    waitlistIntegration: process.env.FEATURE_WAITLIST !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
    socialSharing: process.env.FEATURE_SHARING !== 'false'
  },

  // URLs
  urls: {
    website: process.env.WEBSITE_URL || 'https://pikvita.com',
    waitlist: process.env.WAITLIST_URL || 'https://pikvita.com/waitlist',
    privacyPolicy: process.env.PRIVACY_URL || 'https://pikvita.com/privacy',
    termsOfService: process.env.TERMS_URL || 'https://pikvita.com/terms'
  }
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizConfig;
}

// Export for browser environments
if (typeof window !== 'undefined') {
  window.QuizConfig = QuizConfig;
}
