# 🛒 Pikvita Shopping Personality Quiz

A mobile-friendly, embeddable quiz that helps users discover their shopping personality and connect with Pikvita's mission to support local businesses.

## ✨ Features

- **Mobile-First Design**: Optimized for touch interactions, no clunky drag-and-drop
- **Warm & Caring Brand**: Reflects Pikvita's love for small business owners
- **Easy to Embed**: Works on any website with just a few lines of code
- **User Data Collection**: Captures user details at the end for personalized follow-up
- **Personalized Results**: AI-powered persona matching with tailored messaging
- **Analytics Ready**: Built-in tracking for quiz completion and engagement
- **Scoring System**: Calculates affinity scores for better targeting

## 📱 What's Different (Mobile-Friendly Version)

### Before (v1 - pikvita-quiz-v2.jsx)
- ❌ 2D position picker with drag-and-drop (hard to use on mobile)
- ❌ Gravity wells requiring precise dragging (frustrating on touch)
- ❌ No user data collection
- ❌ Generic results screen
- ❌ Not embeddable

### After (v2 - pikvita-quiz-mobile.jsx)
- ✅ Tap-to-select quadrant buttons (easy on mobile)
- ✅ Slider-based importance ranking (touch-optimized)
- ✅ User details form with validation
- ✅ Personalized results based on answers
- ✅ Fully embeddable with iframe support
- ✅ Scoring and analytics built-in
- ✅ Warm, caring copy that reflects brand values

## 🚀 Quick Start

### Option 1: Standalone React Component

```jsx
import PikvitaQuiz from './pikvita-quiz-mobile.jsx';

function App() {
  return <PikvitaQuiz />;
}
```

### Option 2: Embed via Script (Easiest!)

```html
<!-- Add the container -->
<div id="pikvita-quiz"></div>

<!-- Load the embed script -->
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>

<!-- Initialize -->
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    onComplete: function(data) {
      console.log('Quiz completed!', data);
      // Add user to your CRM, trigger email, etc.
    }
  });
</script>
```

### Option 3: Auto-Initialize with Data Attributes

```html
<div
  id="pikvita-quiz"
  data-pikvita-quiz
  data-api-endpoint="https://api.pikvita.com/api/quiz-responses"
  data-source="blog-embed"
  data-width="100%"
  data-height="800px"
></div>

<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
```

### Option 4: Direct iFrame Embed

```html
<iframe
  src="https://quiz.pikvita.com/embed/pikvita-quiz-embed.html?api=YOUR_API_ENDPOINT&source=iframe"
  width="100%"
  height="800px"
  frameborder="0"
  style="border-radius: 24px; box-shadow: 0 10px 40px rgba(139, 90, 43, 0.15);"
></iframe>
```

## 🎨 Configuration Options

```javascript
PikvitaQuiz.init({
  // Required
  containerId: 'pikvita-quiz',           // ID of container element

  // API Configuration
  apiEndpoint: 'https://your-api.com/quiz-responses',  // Where to save responses

  // Embed Settings
  source: 'website-homepage',             // Track where quiz is embedded
  width: '100%',                          // Quiz width
  height: '800px',                        // Quiz height
  theme: 'default',                       // Theme (future: 'dark', 'minimal')

  // Behavior
  redirectUrl: 'https://pikvita.com/thank-you',  // Redirect after completion

  // Callbacks
  onComplete: function(data) {
    // Called when user completes quiz
    // data = { persona, email, scores }
  },

  onStepChange: function(data) {
    // Called when user moves to next question
    // data = { step, questionId }
  },

  onAnalyticsEvent: function(eventName, data) {
    // Custom analytics tracking
  },

  // Analytics
  trackAnalytics: true                    // Auto-track with GA/FB Pixel
});
```

## 📊 API Endpoint

The quiz sends data to your API endpoint when users complete it:

### Request Format

```json
POST /api/quiz-responses

{
  "userDetails": {
    "name": "Sarah Kumar",
    "email": "sarah@example.com",
    "phone": "+91 98765 43210",
    "location": "Koramangala, Bangalore"
  },
  "answers": {
    "shopping_soul": { "id": "explorer", "label": "The Joyful Explorer" },
    "time_value": 65,
    "local_connection": 75,
    "category_preferences": { "art": 4, "books": 5, "gifts": 3 },
    "frustration_heat": { "discovery": 5, "timing": 3 },
    "delivery_comfort": 2,
    "value_blend": [
      { "id": "local", "emoji": "❤️", "label": "Supporting Local" },
      { "id": "speed", "emoji": "⚡", "label": "Fast Delivery" }
    ]
  },
  "persona": {
    "title": "The Community Champion",
    "emoji": "🏪",
    "color": "#10b981",
    "primaryTrait": "local"
  },
  "score": {
    "localAffinity": 75,
    "speedPreference": 65,
    "categoryEngagement": 83,
    "frustrationIntensity": 53,
    "overall": 76
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response Format

```json
{
  "success": true,
  "message": "Quiz response saved successfully",
  "id": "quiz_response_12345"
}
```

## 🗄️ Backend Setup

### Using the Provided API (Node.js + MongoDB)

1. **Install dependencies**:
```bash
cd api
npm install mongoose
```

2. **Set environment variables**:
```bash
export MONGODB_URI="mongodb://localhost:27017/pikvita-quiz"
export API_KEY="your-secret-api-key"
export SENDGRID_API_KEY="your-sendgrid-key"  # Optional
```

3. **Deploy to serverless** (Vercel, Netlify, AWS Lambda):
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod
```

4. **Access analytics**:
```bash
GET /api/quiz-responses
Headers: { "X-API-Key": "your-secret-api-key" }

Response:
{
  "totalResponses": 1247,
  "personaDistribution": [
    { "_id": "local", "count": 487 },
    { "_id": "speed", "count": 321 }
  ],
  "averageScores": {
    "avgLocalAffinity": 68,
    "avgSpeedPreference": 54
  },
  "topFrustrations": [
    { "_id": "discovery", "avgIntensity": 4.2, "count": 892 }
  ]
}
```

## 💌 Email Integration

The API automatically sends personalized emails to users based on their persona:

### Sample Email

```
Subject: Sarah, you're a Community Champion! 🏪

Body:
Hey Sarah! 👋

Thank you for taking the time to share your shopping soul with us.

As a Community Champion, you value authentic connections and purposeful
shopping. Pikvita is being built specifically for people like you who want
to support local while enjoying modern convenience.

Your Shopping DNA:
❤️ Local Love: 75%
⚡ Speed Priority: 65%

What's Next?
You're on our priority waitlist! We'll notify you as soon as Pikvita
launches in Koramangala.

[Get Early Access →]

With gratitude,
The Pikvita Team 🧡
```

## 🎯 Personas & Personalization

The quiz assigns users to one of 5 personas:

1. **⚡ The Time Warrior** - Values speed above all
2. **🏪 The Community Champion** - Loves supporting local
3. **✨ The Discovery Artist** - Seeks unique finds
4. **🎨 The Collector** - Wants maximum variety
5. **🎯 The Smart Shopper** - Optimizes for best deals

Each persona receives:
- Custom results page messaging
- Personalized email content
- Tailored product recommendations
- Priority ranking in waitlist

## 📈 Analytics & Tracking

The quiz automatically tracks:

- Quiz loads
- Step changes (progression)
- Answer selections
- Form submissions
- Completions
- Persona distribution

### Google Analytics Integration

```javascript
// Automatic if gtag is present
gtag('event', 'Quiz Completed', {
  event_category: 'Pikvita Quiz',
  persona: 'Community Champion',
  email: 'sarah@example.com'
});
```

### Facebook Pixel Integration

```javascript
// Automatic if fbq is present
fbq('trackCustom', 'QuizCompleted', {
  persona: 'Community Champion'
});
```

## 🎨 Customization

### Brand Colors

The quiz uses Pikvita's brand palette:

- **Coral**: `#e8795b` - Primary CTAs
- **Terracotta**: `#c45d3a` - Accents
- **Sage Green**: `#4a7c59` - Success states
- **Cream**: `#fef7ed` - Backgrounds
- **Amber**: `#f59e0b` - Highlights

### Fonts

- **Headings**: Fraunces (serif)
- **Body**: DM Sans (sans-serif)

### Custom Themes (Coming Soon)

```javascript
PikvitaQuiz.init({
  theme: 'dark',  // 'default', 'dark', 'minimal'
  customColors: {
    primary: '#e8795b',
    background: '#fef7ed'
  }
});
```

## 📱 Mobile Optimization

- Touch-optimized sliders with 48px tap targets
- No drag-and-drop interactions
- Safe area padding for notched devices
- Responsive typography (16px minimum)
- Haptic feedback support (iOS)
- Smooth transitions (300ms)

## 🔒 Security & Privacy

- CORS-enabled API
- Email validation
- Rate limiting (optional)
- GDPR-compliant data storage
- Unsubscribe links in emails
- No cookies (privacy-first)

## 🧪 Testing

### Local Development

```bash
# Serve the embed HTML
npx serve embed/

# Or use Python
cd embed
python -m http.server 8000
```

### Test Embeds

Create `test.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Quiz Test</title>
</head>
<body>
  <h1>Pikvita Quiz Test</h1>

  <div id="quiz-container" style="max-width: 600px; margin: 0 auto;"></div>

  <script src="pikvita-quiz.js"></script>
  <script>
    PikvitaQuiz.init({
      containerId: 'quiz-container',
      apiEndpoint: 'http://localhost:3000/api/quiz-responses',
      onComplete: function(data) {
        alert('Quiz completed! Persona: ' + data.persona);
      }
    });
  </script>
</body>
</html>
```

## 📦 File Structure

```
pikvita-quiz/
├── pikvita-quiz-v2.jsx          # Original version (desktop-focused)
├── pikvita-quiz-mobile.jsx      # New mobile-friendly React component
├── embed/
│   ├── pikvita-quiz-embed.html  # Standalone embeddable version
│   └── pikvita-quiz.js          # Embed script for easy integration
├── api/
│   └── quiz-responses.js        # Backend API endpoint
├── README.md                     # This file
└── package.json                 # Dependencies
```

## 🚢 Deployment Checklist

- [ ] Update `apiEndpoint` in embed script
- [ ] Configure MongoDB connection string
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Add domain to CORS whitelist
- [ ] Set up waitlist integration
- [ ] Configure analytics tracking
- [ ] Test on multiple devices
- [ ] Set up CDN for embed files
- [ ] Monitor API rate limits
- [ ] Create backup strategy

## 🤝 Integration Examples

### WordPress

```php
// Add to your WordPress post/page
[pikvita_quiz]

// Or in theme files:
<?php echo do_shortcode('[pikvita_quiz]'); ?>
```

### Webflow

1. Add Embed element
2. Paste the script code
3. Publish

### Shopify

```liquid
<!-- Add to your theme -->
<div id="pikvita-quiz"></div>
{{ 'pikvita-quiz.js' | asset_url | script_tag }}
<script>
  PikvitaQuiz.init({ containerId: 'pikvita-quiz' });
</script>
```

## 💡 Tips for Best Results

1. **Placement**: Embed above the fold on high-traffic pages
2. **Context**: Add intro text explaining why users should take it
3. **Incentive**: Offer early access or discount for completion
4. **Follow-up**: Send persona-specific emails within 24 hours
5. **A/B Test**: Try different placements and CTAs
6. **Mobile First**: 70%+ of users will be on mobile
7. **Loading**: Show a loading state while quiz initializes
8. **Sharing**: Encourage users to share their results

## 🎁 What Makes This Special

This isn't just another quiz—it's a conversation starter. Every question is designed to:

- **Show you care** about local businesses
- **Respect user time** with quick, engaging interactions
- **Build connection** through warm, human copy
- **Provide value** with personalized insights
- **Drive action** toward supporting local shops

## 📧 Support

Questions? Email us at [hello@pikvita.com](mailto:hello@pikvita.com)

---

Made with 🧡 by people who care about local communities
