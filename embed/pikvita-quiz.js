/**
 * Pikvita Quiz Embed Script
 * Makes it super easy to embed the Pikvita quiz on any website
 *
 * Usage:
 * <div id="pikvita-quiz"></div>
 * <script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
 * <script>
 *   PikvitaQuiz.init({
 *     containerId: 'pikvita-quiz',
 *     apiEndpoint: 'https://api.pikvita.com/quiz-responses'
 *   });
 * </script>
 */

(function(window, document) {
  'use strict';

  const PikvitaQuiz = {
    version: '1.0.0',
    instances: {},

    /**
     * Initialize the quiz in a container
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
      const config = {
        containerId: options.containerId || 'pikvita-quiz',
        apiEndpoint: options.apiEndpoint || 'https://api.pikvita.com/api/quiz-responses',
        source: options.source || 'embedded',
        theme: options.theme || 'default',
        width: options.width || '100%',
        height: options.height || '800px',
        redirectUrl: options.redirectUrl || null,
        onComplete: options.onComplete || null,
        onStepChange: options.onStepChange || null,
        trackAnalytics: options.trackAnalytics !== false
      };

      const container = document.getElementById(config.containerId);

      if (!container) {
        console.error(`PikvitaQuiz: Container #${config.containerId} not found`);
        return null;
      }

      // Create iframe
      const iframe = this.createIframe(config);
      container.appendChild(iframe);

      // Set up message listener
      this.setupMessageListener(config);

      // Store instance
      this.instances[config.containerId] = {
        config,
        iframe,
        container
      };

      return this.instances[config.containerId];
    },

    /**
     * Create iframe element
     */
    createIframe: function(config) {
      const iframe = document.createElement('iframe');

      // Build URL with query parameters
      const baseUrl = config.embedUrl || 'https://quiz.pikvita.com/embed/pikvita-quiz-embed.html';
      const url = new URL(baseUrl);
      url.searchParams.set('api', config.apiEndpoint);
      url.searchParams.set('source', config.source);
      if (config.redirectUrl) {
        url.searchParams.set('redirect', config.redirectUrl);
      }
      url.searchParams.set('theme', config.theme);

      iframe.src = url.toString();
      iframe.style.width = config.width;
      iframe.style.height = config.height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '24px';
      iframe.style.overflow = 'hidden';
      iframe.style.boxShadow = '0 10px 40px rgba(139, 90, 43, 0.15)';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('allowtransparency', 'true');

      // Accessibility
      iframe.setAttribute('title', 'Pikvita Shopping Personality Quiz');
      iframe.setAttribute('aria-label', 'Interactive shopping quiz');

      return iframe;
    },

    /**
     * Set up postMessage listener for quiz events
     */
    setupMessageListener: function(config) {
      window.addEventListener('message', (event) => {
        // Verify origin in production
        // if (event.origin !== 'https://quiz.pikvita.com') return;

        if (event.data?.type === 'pikvita-quiz') {
          const { event: eventType, data } = event.data;

          // Handle events
          switch (eventType) {
            case 'quiz-loaded':
              this.trackEvent('Quiz Loaded', data, config);
              break;

            case 'step-changed':
              this.trackEvent('Quiz Step Changed', data, config);
              if (config.onStepChange) {
                config.onStepChange(data);
              }
              // Auto-resize iframe based on content
              this.resizeIframe(config.containerId);
              break;

            case 'quiz-completed':
              this.trackEvent('Quiz Completed', data, config);
              if (config.onComplete) {
                config.onComplete(data);
              }
              break;

            case 'answer-recorded':
              this.trackEvent('Quiz Answer', data, config);
              break;
          }
        }
      });
    },

    /**
     * Resize iframe to fit content
     */
    resizeIframe: function(containerId) {
      const instance = this.instances[containerId];
      if (!instance) return;

      // Send message to iframe to get content height
      instance.iframe.contentWindow.postMessage({
        type: 'pikvita-quiz-resize',
        action: 'get-height'
      }, '*');
    },

    /**
     * Track analytics events
     */
    trackEvent: function(eventName, data, config) {
      if (!config.trackAnalytics) return;

      // Google Analytics
      if (window.gtag) {
        gtag('event', eventName, {
          event_category: 'Pikvita Quiz',
          event_label: config.source,
          ...data
        });
      }

      // Facebook Pixel
      if (window.fbq) {
        fbq('trackCustom', eventName, data);
      }

      // Custom analytics callback
      if (config.onAnalyticsEvent) {
        config.onAnalyticsEvent(eventName, data);
      }

      console.log('[PikvitaQuiz Analytics]', eventName, data);
    },

    /**
     * Destroy a quiz instance
     */
    destroy: function(containerId) {
      const instance = this.instances[containerId];
      if (!instance) return;

      instance.container.removeChild(instance.iframe);
      delete this.instances[containerId];
    },

    /**
     * Get quiz data (for analytics)
     */
    getData: function(containerId) {
      return this.instances[containerId] || null;
    }
  };

  // Expose to global scope
  window.PikvitaQuiz = PikvitaQuiz;

  // Auto-initialize if data attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    const autoInitElements = document.querySelectorAll('[data-pikvita-quiz]');

    autoInitElements.forEach(function(element) {
      const options = {
        containerId: element.id,
        apiEndpoint: element.dataset.apiEndpoint,
        source: element.dataset.source,
        width: element.dataset.width,
        height: element.dataset.height,
        redirectUrl: element.dataset.redirectUrl
      };

      PikvitaQuiz.init(options);
    });
  });

})(window, document);
