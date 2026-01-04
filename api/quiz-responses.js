// API endpoint for saving quiz responses
// This can be deployed to Vercel, Netlify, or any serverless platform

const mongoose = require('mongoose');

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

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pikvita-quiz';

  const db = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = db;
  return db;
}

// Serverless function handler
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

      // Send personalized email (integrate with your email service)
      await sendPersonalizedEmail(quizResponse);

      // Add to waitlist (integrate with your waitlist service)
      await addToWaitlist(quizResponse);

      return res.status(201).json({
        success: true,
        message: 'Quiz response saved successfully',
        id: quizResponse._id
      });

    } else if (req.method === 'GET') {
      // Analytics endpoint (protected - add authentication)
      const apiKey = req.headers['x-api-key'];

      if (!apiKey || apiKey !== process.env.API_KEY) {
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
    // Integrate with your email service (SendGrid, Mailgun, etc.)
    const emailService = getEmailService();

    const emailTemplate = getPersonalizedEmailTemplate(quizResponse);

    await emailService.send({
      to: quizResponse.email,
      from: 'hello@pikvita.com',
      subject: `${quizResponse.name}, you're a ${quizResponse.persona.title}! ${quizResponse.persona.emoji}`,
      html: emailTemplate
    });

    // Mark email as sent
    quizResponse.emailSent = true;
    await quizResponse.save();

    console.log(`Personalized email sent to ${quizResponse.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Waitlist integration
async function addToWaitlist(quizResponse) {
  try {
    // Integrate with your waitlist service
    const waitlistService = getWaitlistService();

    await waitlistService.add({
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

    quizResponse.waitlistAdded = true;
    await quizResponse.save();

    console.log(`Added ${quizResponse.email} to waitlist`);
  } catch (error) {
    console.error('Error adding to waitlist:', error);
  }
}

// Generate personalized email template
function getPersonalizedEmailTemplate(quizResponse) {
  const { persona, name, scores } = quizResponse;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Pikvita Quiz Results</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #78350f; background: linear-gradient(135deg, #fef7ed 0%, #fde8d7 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(139, 90, 43, 0.15);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e8795b 0%, #c45d3a 100%); padding: 40px 20px; text-align: center;">
          <div style="font-size: 72px; margin-bottom: 16px;">${persona.emoji}</div>
          <h1 style="color: white; margin: 0; font-size: 28px;">You're a ${persona.title}!</h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 24px;">
          <p style="font-size: 18px; color: #92400e;">Hey ${name}! 👋</p>

          <p style="font-size: 16px; line-height: 1.8; color: #78350f;">
            Thank you for taking the time to share your shopping soul with us. We loved getting to know you!
          </p>

          <div style="background: linear-gradient(135deg, ${persona.color}15 0%, ${persona.color}25 100%); border-left: 4px solid ${persona.color}; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #78350f;">What This Means:</h3>
            <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.7;">
              As a ${persona.title}, you value authentic connections and purposeful shopping. Pikvita is being built specifically for people like you who want to support local while enjoying modern convenience.
            </p>
          </div>

          <h3 style="color: #78350f; margin-top: 32px;">Your Shopping DNA:</h3>
          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
              <span style="font-size: 14px; color: #92400e;">❤️ Local Love</span>
              <span style="font-weight: bold; color: #10b981;">${scores.localAffinity}%</span>
            </div>
            <div style="background: #fed7aa; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #10b981; height: 100%; width: ${scores.localAffinity}%; border-radius: 4px;"></div>
            </div>
          </div>

          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
              <span style="font-size: 14px; color: #92400e;">⚡ Speed Priority</span>
              <span style="font-weight: bold; color: #f59e0b;">${scores.speedPreference}%</span>
            </div>
            <div style="background: #fed7aa; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #f59e0b; height: 100%; width: ${scores.speedPreference}%; border-radius: 4px;"></div>
            </div>
          </div>

          <div style="background: #fef3e2; padding: 24px; border-radius: 16px; margin: 32px 0; text-align: center;">
            <h3 style="margin: 0 0 12px 0; color: #78350f;">What's Next?</h3>
            <p style="margin: 0 0 20px 0; color: #92400e;">
              You're on our priority waitlist! We'll notify you as soon as Pikvita launches in your area.
            </p>
            <a href="https://pikvita.com/waitlist" style="display: inline-block; background: linear-gradient(135deg, #e8795b 0%, #c45d3a 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(232, 121, 91, 0.3);">
              View Your Waitlist Status →
            </a>
          </div>

          <p style="font-size: 14px; color: #a16207; line-height: 1.7;">
            In the meantime, we'd love to hear more about your local shopping experiences.
            Hit reply and tell us about your favorite neighborhood shop!
          </p>

          <p style="font-size: 14px; color: #78350f; margin-top: 32px;">
            With gratitude,<br>
            <strong>The Pikvita Team</strong><br>
            <span style="font-size: 12px; color: #a16207;">Supporting local, one delivery at a time 🧡</span>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #fef3e2; padding: 24px; text-align: center; border-top: 1px solid #fde8d7;">
          <div style="font-size: 24px; margin-bottom: 12px;">🛒</div>
          <p style="margin: 0; font-size: 12px; color: #92400e;">
            Pikvita - Bringing your neighborhood to your doorstep
          </p>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #a16207;">
            You're receiving this because you completed our quiz.
            <a href="#" style="color: #e8795b;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Placeholder functions for service integrations
function getEmailService() {
  // Integrate with SendGrid, Mailgun, etc.
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // return sgMail;

  return {
    send: async (email) => {
      console.log('Email would be sent:', email);
      // Implement actual email sending
    }
  };
}

function getWaitlistService() {
  // Integrate with your waitlist management system
  return {
    add: async (user) => {
      console.log('User would be added to waitlist:', user);
      // Implement actual waitlist addition
    }
  };
}
