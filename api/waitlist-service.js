/**
 * Waitlist Service Integration
 * Supports custom API, Mailchimp, and ConvertKit
 */

const QuizConfig = require('../config');

class WaitlistService {
  constructor(config = QuizConfig.waitlist) {
    this.config = config;
    this.provider = this.initializeProvider();
  }

  /**
   * Initialize the waitlist provider
   */
  initializeProvider() {
    const provider = this.config.provider;

    switch (provider) {
      case 'mailchimp':
        return this.initMailchimp();
      case 'convertkit':
        return this.initConvertKit();
      case 'custom':
      default:
        return null; // Custom API doesn't need initialization
    }
  }

  /**
   * Initialize Mailchimp
   */
  initMailchimp() {
    try {
      const mailchimp = require('@mailchimp/mailchimp_marketing');

      mailchimp.setConfig({
        apiKey: this.config.mailchimp.apiKey,
        server: this.config.mailchimp.server
      });

      return mailchimp;
    } catch (error) {
      console.error('Failed to initialize Mailchimp:', error);
      return null;
    }
  }

  /**
   * Initialize ConvertKit
   */
  initConvertKit() {
    // ConvertKit uses simple HTTP API, no special initialization needed
    return {
      apiKey: this.config.convertkit.apiKey,
      formId: this.config.convertkit.formId
    };
  }

  /**
   * Add user to waitlist
   */
  async add(userData) {
    try {
      switch (this.config.provider) {
        case 'mailchimp':
          return await this.addToMailchimp(userData);
        case 'convertkit':
          return await this.addToConvertKit(userData);
        case 'custom':
        default:
          return await this.addToCustomAPI(userData);
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add to Mailchimp
   */
  async addToMailchimp(userData) {
    const { email, name, phone, location, persona, priority, metadata } = userData;

    const response = await this.provider.lists.addListMember(
      this.config.mailchimp.listId,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name.split(' ')[0],
          LNAME: name.split(' ').slice(1).join(' '),
          PHONE: phone || '',
          LOCATION: location || ''
        },
        tags: [
          'quiz-completed',
          `persona-${persona.toLowerCase().replace(/\s+/g, '-')}`
        ],
        merge_fields: {
          ...this.getMergeFields(),
          PERSONA: persona,
          PRIORITY: priority,
          LOCAL_AFF: metadata?.localAffinity || 0,
          SPEED_PREF: metadata?.speedPreference || 0
        }
      }
    );

    return { success: true, id: response.id };
  }

  /**
   * Add to ConvertKit
   */
  async addToConvertKit(userData) {
    const { email, name, phone, location, persona, metadata } = userData;

    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${this.provider.formId}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.provider.apiKey,
          email,
          first_name: name.split(' ')[0],
          fields: {
            phone: phone || '',
            location: location || '',
            persona: persona,
            local_affinity: metadata?.localAffinity || 0,
            speed_preference: metadata?.speedPreference || 0,
            quiz_completed_at: metadata?.quizCompletedAt || new Date().toISOString()
          },
          tags: ['quiz-completed', persona.toLowerCase().replace(/\s+/g, '-')]
        })
      }
    );

    const data = await response.json();
    return { success: true, id: data.subscription.id };
  }

  /**
   * Add to custom API
   */
  async addToCustomAPI(userData) {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': QuizConfig.security.apiKey
      },
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        location: userData.location,
        persona: userData.persona,
        priority: userData.priority,
        source: 'quiz',
        metadata: userData.metadata,
        addedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, ...data };
  }

  /**
   * Get Mailchimp merge fields configuration
   */
  getMergeFields() {
    // Define your custom merge fields here
    return {
      PERSONA: '',
      PRIORITY: 0,
      LOCAL_AFF: 0,
      SPEED_PREF: 0
    };
  }
}

module.exports = WaitlistService;
