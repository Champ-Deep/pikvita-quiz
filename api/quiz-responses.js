// API endpoint for saving quiz responses
// This can be deployed to Vercel, Netlify, or any serverless platform

const mongoose = require('mongoose');
const QuizConfig = require('../config');
const EmailService = require('./email-service');
const WaitlistService = require('./waitlist-service');

// Initialize services
const emailService = new EmailService();
const waitlistService = new WaitlistService();

// MongoDB Schema for Quiz Responses
const QuizResponseSchema = new mongoose.Schema({
  // User details
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String },
  location: { type: String },

  // Quiz answers
  answers: {
    shopping_soul: mongoose.Schema.Types.Mixed,
    time_value: Number,
    local_connection: Number,
    category_preferences: mongoose.Schema.Types.Mixed,
    frustration_heat: mongoose.Schema.Types.Mixed,
    delivery_comfort: Number,
    value_blend: mongoose.Schema.Types.Mixed
  },

  // Calculated results
  persona: {
    title: String,
    emoji: String,
    color: String,
    primaryTrait: String
  },

  scores: {
    localAffinity: Number,
    speedPreference: Number,
    categoryEngagement: Number,
    frustrationIntensity: Number,
    overall: Number
  },

  // Metadata
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: 'web' }, // web, embedded, etc.
  referrer: String,
  ipAddress: String,
  userAgent: String,

  // Status flags
  emailSent: { type: Boolean, default: false },
  waitlistAdded: { type: Boolean, default: false },
  followUpSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for querying
QuizResponseSchema.index({ email: 1 });
QuizResponseSchema.index({ timestamp: -1 });
QuizResponseSchema.index({ 'persona.primaryTrait': 1 });
QuizResponseSchema.index({ 'scores.localAffinity': -1 });

let QuizResponse;
try {
  QuizResponse = mongoose.model('QuizResponse');
} catch {
  QuizResponse = mongoose.model('QuizResponse', QuizResponseSchema);
}

// Connect to MongoDB
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await mongoose.connect(QuizConfig.database.mongoUri, QuizConfig.database.options);

  cachedDb = db;
  return db;
}

// Serverless function handler
module.exports = async (req, res) => {
  // CORS headers with configuration
  const allowedOrigins = QuizConfig.security.corsOrigins;
  const origin = req.headers.origin;

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Quiz-Source');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      // Save quiz response
      const {
        userDetails,
        answers,
        persona,
        timestamp,
        score
      } = req.body;

      // Validate required fields
      if (!userDetails?.email || !userDetails?.name) {
        return res.status(400).json({
          error: 'Missing required fields: name and email'
        });
      }

      // Extract metadata
      const metadata = {
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        referrer: req.headers['referer'] || req.headers['referrer'],
        source: req.headers['x-quiz-source'] || 'web'
      };

      // Create new response
      const quizResponse = new QuizResponse({
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        location: userDetails.location,
        answers,
        persona: {
          title: persona.title,
          emoji: persona.emoji,
          color: persona.color,
          primaryTrait: getPrimaryTrait(answers)
        },
        scores: score,
        ...metadata
      });

      await quizResponse.save();

      // Send personalized email (async, don't wait)
      if (QuizConfig.features.emailNotifications) {
        sendPersonalizedEmail(quizResponse).catch(err =>
          console.error('Email sending failed:', err)
        );
      }

      // Add to waitlist (async, don't wait)
      if (QuizConfig.features.waitlistIntegration) {
        addToWaitlist(quizResponse).catch(err =>
          console.error('Waitlist addition failed:', err)
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Quiz response saved successfully',
        id: quizResponse._id
      });

    } else if (req.method === 'GET') {
      // Analytics endpoint (protected)
      const apiKey = req.headers['x-api-key'];

      if (!apiKey || apiKey !== QuizConfig.security.apiKey) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get analytics data
      const totalResponses = await QuizResponse.countDocuments();

      const personaDistribution = await QuizResponse.aggregate([
        {
          $group: {
            _id: '$persona.primaryTrait',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const avgScores = await QuizResponse.aggregate([
        {
          $group: {
            _id: null,
            avgLocalAffinity: { $avg: '$scores.localAffinity' },
            avgSpeedPreference: { $avg: '$scores.speedPreference' },
            avgEngagement: { $avg: '$scores.categoryEngagement' }
          }
        }
      ]);

      const topFrustrations = await QuizResponse.aggregate([
        {
          $project: {
            frustrations: { $objectToArray: '$answers.frustration_heat' }
          }
        },
        { $unwind: '$frustrations' },
        {
          $group: {
            _id: '$frustrations.k',
            avgIntensity: { $avg: '$frustrations.v' },
            count: { $sum: 1 }
          }
        },
        { $sort: { avgIntensity: -1 } }
      ]);

      return res.status(200).json({
        totalResponses,
        personaDistribution,
        averageScores: avgScores[0] || {},
        topFrustrations: topFrustrations.slice(0, 5)
      });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error handling quiz response:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Helper function to determine primary trait
function getPrimaryTrait(answers) {
  const ranking = answers.value_blend || [];
  if (ranking.length > 0) {
    return ranking[0].id;
  }

  const timeValue = answers.time_value || 50;
  const local = answers.local_connection || 50;

  if (timeValue > 70) return 'speed';
  if (local > 70) return 'local';
  if (timeValue < 30) return 'price';

  return 'local'; // default
}

// Email service integration
async function sendPersonalizedEmail(quizResponse) {
  try {
    const result = await emailService.sendQuizResultsEmail(quizResponse);

    if (result.success) {
      // Mark email as sent
      quizResponse.emailSent = true;
      await quizResponse.save();
      console.log(`Email sent to ${quizResponse.email} (${result.messageId})`);
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Waitlist integration
async function addToWaitlist(quizResponse) {
  try {
    const result = await waitlistService.add({
      email: quizResponse.email,
      name: quizResponse.name,
      phone: quizResponse.phone,
      location: quizResponse.location,
      persona: quizResponse.persona.title,
      priority: quizResponse.scores.overall, // Higher engagement = higher priority
      metadata: {
        quizCompletedAt: quizResponse.timestamp,
        localAffinity: quizResponse.scores.localAffinity,
        speedPreference: quizResponse.scores.speedPreference
      }
    });

    if (result.success) {
      quizResponse.waitlistAdded = true;
      await quizResponse.save();
      console.log(`Added ${quizResponse.email} to waitlist (${result.id})`);
    }

    return result;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
}

// No longer needed - using service classes above
