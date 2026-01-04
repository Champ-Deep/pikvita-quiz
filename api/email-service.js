/**
 * Email Service Integration
 * Supports SendGrid, Mailgun, and AWS SES
 */

const QuizConfig = require('../config');

class EmailService {
  constructor(config = QuizConfig.email) {
    this.config = config;
    this.provider = this.initializeProvider();
  }

  /**
   * Initialize the email provider based on configuration
   */
  initializeProvider() {
    const provider = this.config.provider;

    switch (provider) {
      case 'sendgrid':
        return this.initSendGrid();
      case 'mailgun':
        return this.initMailgun();
      case 'ses':
        return this.initSES();
      default:
        console.warn(`Unknown email provider: ${provider}. Email sending disabled.`);
        return null;
    }
  }

  /**
   * Initialize SendGrid
   */
  initSendGrid() {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.config.sendgrid.apiKey);
      return sgMail;
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error);
      return null;
    }
  }

  /**
   * Initialize Mailgun
   */
  initMailgun() {
    try {
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');
      const mailgun = new Mailgun(formData);

      return mailgun.client({
        username: 'api',
        key: this.config.mailgun.apiKey
      });
    } catch (error) {
      console.error('Failed to initialize Mailgun:', error);
      return null;
    }
  }

  /**
   * Initialize AWS SES
   */
  initSES() {
    try {
      const AWS = require('aws-sdk');

      AWS.config.update({
        region: this.config.ses.region,
        accessKeyId: this.config.ses.accessKeyId,
        secretAccessKey: this.config.ses.secretAccessKey
      });

      return new AWS.SES({ apiVersion: '2010-12-01' });
    } catch (error) {
      console.error('Failed to initialize AWS SES:', error);
      return null;
    }
  }

  /**
   * Send email using configured provider
   */
  async send(emailData) {
    if (!this.provider) {
      console.log('Email provider not configured. Email would be sent:', emailData);
      return { success: false, message: 'Email provider not configured' };
    }

    const { to, subject, html, text } = emailData;

    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid({ to, subject, html, text });
        case 'mailgun':
          return await this.sendViaMailgun({ to, subject, html, text });
        case 'ses':
          return await this.sendViaSES({ to, subject, html, text });
        default:
          throw new Error('Unknown email provider');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send via SendGrid
   */
  async sendViaSendGrid({ to, subject, html, text }) {
    const msg = {
      to,
      from: {
        email: this.config.sendgrid.fromEmail,
        name: this.config.sendgrid.fromName
      },
      replyTo: this.config.sendgrid.replyTo,
      subject,
      text: text || this.htmlToText(html),
      html
    };

    const response = await this.provider.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  }

  /**
   * Send via Mailgun
   */
  async sendViaMailgun({ to, subject, html, text }) {
    const msg = {
      from: this.config.mailgun.fromEmail,
      to,
      subject,
      text: text || this.htmlToText(html),
      html
    };

    const response = await this.provider.messages.create(this.config.mailgun.domain, msg);
    return { success: true, messageId: response.id };
  }

  /**
   * Send via AWS SES
   */
  async sendViaSES({ to, subject, html, text }) {
    const params = {
      Source: this.config.ses.fromEmail,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: text || this.htmlToText(html),
            Charset: 'UTF-8'
          },
          Html: {
            Data: html,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const response = await this.provider.sendEmail(params).promise();
    return { success: true, messageId: response.MessageId };
  }

  /**
   * Send personalized quiz results email
   */
  async sendQuizResultsEmail(quizResponse) {
    const { name, email, persona, scores } = quizResponse;

    const subject = `${name}, you're a ${persona.title}! ${persona.emoji}`;
    const html = this.generateQuizResultsEmailHTML(quizResponse);

    return await this.send({
      to: email,
      subject,
      html
    });
  }

  /**
   * Generate HTML email template for quiz results
   */
  generateQuizResultsEmailHTML(quizResponse) {
    const { persona, name, scores } = quizResponse;

    const personaMessages = {
      'speed': 'As a Time Warrior, you value efficiency above all else. Pikvita\'s 30-minute delivery from local shops was built for people like you.',
      'local': 'As a Community Champion, you understand that every purchase supports a dream. Thank you for caring about local businesses.',
      'variety': 'As a Collector, you deserve access to everything. Browse inventory from 20+ local shops all in one place.',
      'price': 'As a Smart Shopper, you play chess while others play checkers. Compare prices across all local shops instantly.'
    };

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
        <div style="background: linear-gradient(135deg, ${persona.color} 0%, ${persona.color}dd 100%); padding: 40px 20px; text-align: center;">
          <div style="font-size: 72px; margin-bottom: 16px;">${persona.emoji}</div>
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            You're a ${persona.title}!
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 24px;">
          <p style="font-size: 18px; color: #92400e; margin-bottom: 20px;">
            Hey ${name}! 👋
          </p>

          <p style="font-size: 16px; line-height: 1.8; color: #78350f; margin-bottom: 24px;">
            Thank you for taking the time to share your shopping soul with us. We loved getting to know you!
          </p>

          <div style="background: linear-gradient(135deg, ${persona.color}15 0%, ${persona.color}25 100%); border-left: 4px solid ${persona.color}; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #78350f; font-size: 18px;">What This Means:</h3>
            <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.7;">
              ${personaMessages[persona.primaryTrait] || personaMessages.local}
            </p>
          </div>

          <h3 style="color: #78350f; margin-top: 32px; margin-bottom: 16px; font-size: 20px;">
            Your Shopping DNA:
          </h3>

          <!-- Score bars -->
          <div style="margin: 24px 0;">
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                <span style="font-size: 14px; color: #92400e;">❤️ Local Love</span>
                <span style="font-weight: bold; color: #10b981; font-size: 16px;">${scores.localAffinity}%</span>
              </div>
              <div style="background: #fed7aa; height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: #10b981; height: 100%; width: ${scores.localAffinity}%; border-radius: 5px; transition: width 0.5s;"></div>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                <span style="font-size: 14px; color: #92400e;">⚡ Speed Priority</span>
                <span style="font-weight: bold; color: #f59e0b; font-size: 16px;">${scores.speedPreference}%</span>
              </div>
              <div style="background: #fed7aa; height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: #f59e0b; height: 100%; width: ${scores.speedPreference}%; border-radius: 5px;"></div>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                <span style="font-size: 14px; color: #92400e;">✨ Engagement</span>
                <span style="font-weight: bold; color: #8b5cf6; font-size: 16px;">${scores.categoryEngagement || scores.overall}%</span>
              </div>
              <div style="background: #fed7aa; height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: #8b5cf6; height: 100%; width: ${scores.categoryEngagement || scores.overall}%; border-radius: 5px;"></div>
              </div>
            </div>
          </div>

          <!-- CTA Section -->
          <div style="background: #fef3e2; padding: 32px 24px; border-radius: 16px; margin: 32px 0; text-align: center;">
            <h3 style="margin: 0 0 12px 0; color: #78350f; font-size: 22px;">What's Next?</h3>
            <p style="margin: 0 0 24px 0; color: #92400e; font-size: 15px; line-height: 1.6;">
              You're on our priority waitlist! We'll notify you as soon as Pikvita launches in your area.
            </p>
            <a href="${QuizConfig.urls.waitlist}" style="display: inline-block; background: linear-gradient(135deg, ${persona.color} 0%, ${persona.color}dd 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px ${persona.color}40;">
              View Your Waitlist Status →
            </a>
          </div>

          <!-- Personal note -->
          <div style="background: rgba(232, 121, 91, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="font-size: 14px; color: #78350f; line-height: 1.7; margin: 0;">
              💌 <strong>We'd love to hear from you!</strong><br>
              Hit reply and tell us about your favorite neighborhood shop. Your stories inspire us.
            </p>
          </div>

          <p style="font-size: 14px; color: #78350f; margin-top: 32px; line-height: 1.6;">
            With gratitude,<br>
            <strong style="color: #92400e;">The Pikvita Team</strong><br>
            <span style="font-size: 12px; color: #a16207;">Supporting local, one delivery at a time 🧡</span>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #fef3e2; padding: 24px; text-align: center; border-top: 1px solid #fde8d7;">
          <div style="font-size: 32px; margin-bottom: 12px;">🛒</div>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #92400e; font-weight: 500;">
            Pikvita - Bringing your neighborhood to your doorstep
          </p>
          <div style="margin: 16px 0;">
            <a href="${QuizConfig.urls.website}" style="color: #e8795b; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
            <span style="color: #d4a574;">•</span>
            <a href="${QuizConfig.urls.privacyPolicy}" style="color: #e8795b; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy</a>
            <span style="color: #d4a574;">•</span>
            <a href="#" style="color: #e8795b; text-decoration: none; font-size: 12px; margin: 0 8px;">Unsubscribe</a>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #a16207;">
            You're receiving this because you completed our shopping quiz.
          </p>
        </div>
      </div>

      <!-- Tracking pixel (optional) -->
      <img src="${QuizConfig.urls.website}/track/email-open?id=${quizResponse._id}" width="1" height="1" style="display:none;" />
    </body>
    </html>
    `;
  }

  /**
   * Simple HTML to text conversion
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = EmailService;
