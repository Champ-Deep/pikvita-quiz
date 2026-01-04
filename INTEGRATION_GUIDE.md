# 🔌 Website Integration Guide

Complete guides for embedding the Pikvita quiz on popular website platforms.

## Table of Contents

- [WordPress](#wordpress)
- [Shopify](#shopify)
- [Webflow](#webflow)
- [Squarespace](#squarespace)
- [Wix](#wix)
- [Carrd](#carrd)
- [React](#react)
- [Next.js](#nextjs)
- [Vue.js](#vuejs)
- [Custom HTML](#custom-html)

---

## WordPress

### Method 1: Plugin (Recommended)

Create a custom plugin for easy management:

1. **Create plugin file**:

```php
<?php
/**
 * Plugin Name: Pikvita Quiz
 * Description: Embed the Pikvita shopping personality quiz
 * Version: 1.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

// Enqueue quiz script
function pikvita_quiz_enqueue_scripts() {
    wp_enqueue_script(
        'pikvita-quiz',
        'https://quiz.pikvita.com/embed/pikvita-quiz.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'pikvita_quiz_enqueue_scripts');

// Create shortcode
function pikvita_quiz_shortcode($atts) {
    $atts = shortcode_atts(array(
        'api' => 'https://api.pikvita.com/api/quiz-responses',
        'source' => 'wordpress',
        'width' => '100%',
        'height' => '800px'
    ), $atts);

    $container_id = 'pikvita-quiz-' . uniqid();

    ob_start();
    ?>
    <div id="<?php echo esc_attr($container_id); ?>" class="pikvita-quiz-container"></div>
    <script>
    (function() {
        if (typeof PikvitaQuiz !== 'undefined') {
            PikvitaQuiz.init({
                containerId: '<?php echo esc_js($container_id); ?>',
                apiEndpoint: '<?php echo esc_js($atts['api']); ?>',
                source: '<?php echo esc_js($atts['source']); ?>',
                width: '<?php echo esc_js($atts['width']); ?>',
                height: '<?php echo esc_js($atts['height']); ?>',
                onComplete: function(data) {
                    // Track conversion
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'quiz_complete', {
                            event_category: 'engagement',
                            persona: data.persona
                        });
                    }
                }
            });
        }
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('pikvita_quiz', 'pikvita_quiz_shortcode');

// Add admin menu
function pikvita_quiz_admin_menu() {
    add_options_page(
        'Pikvita Quiz Settings',
        'Pikvita Quiz',
        'manage_options',
        'pikvita-quiz',
        'pikvita_quiz_settings_page'
    );
}
add_action('admin_menu', 'pikvita_quiz_admin_menu');

// Settings page
function pikvita_quiz_settings_page() {
    ?>
    <div class="wrap">
        <h1>Pikvita Quiz Settings</h1>
        <div class="card">
            <h2>Usage Instructions</h2>
            <p>Add the quiz to any post or page using this shortcode:</p>
            <code>[pikvita_quiz]</code>

            <h3>Custom Parameters:</h3>
            <ul>
                <li><code>[pikvita_quiz api="your-api-url"]</code> - Custom API endpoint</li>
                <li><code>[pikvita_quiz source="blog-post"]</code> - Track source</li>
                <li><code>[pikvita_quiz height="600px"]</code> - Custom height</li>
            </ul>

            <h3>PHP Template Usage:</h3>
            <code>&lt;?php echo do_shortcode('[pikvita_quiz]'); ?&gt;</code>
        </div>
    </div>
    <?php
}
?>
```

2. **Install the plugin**:
   - Save as `pikvita-quiz.php`
   - Upload to `/wp-content/plugins/pikvita-quiz/`
   - Activate in WordPress admin

3. **Use in posts/pages**:
   ```
   [pikvita_quiz]
   ```

### Method 2: Gutenberg Block

Add as custom HTML block:

1. Create new post/page
2. Add "Custom HTML" block
3. Paste this code:

```html
<div id="pikvita-quiz"></div>
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    source: 'wordpress-post'
  });
</script>
```

### Method 3: Theme Integration

Add directly to theme templates:

```php
<!-- In your template file (e.g., page-quiz.php) -->
<?php get_header(); ?>

<div class="quiz-section">
    <h1>Discover Your Shopping Personality</h1>
    <div id="pikvita-quiz"></div>
</div>

<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    source: 'wordpress-theme'
  });
</script>

<?php get_footer(); ?>
```

---

## Shopify

### Method 1: Custom Page

1. **Create new page**:
   - Online Store → Pages → Add page
   - Title: "Shopping Quiz"

2. **Add quiz code** (click "Show HTML"):

```html
<div id="pikvita-quiz"></div>
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    source: 'shopify-page',
    onComplete: function(data) {
      // Optional: Add to customer tags
      fetch('/admin/api/customers.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            email: data.email,
            tags: 'quiz-completed, persona-' + data.persona.toLowerCase()
          }
        })
      });
    }
  });
</script>
```

### Method 2: Theme Integration

1. **Edit theme**:
   - Online Store → Themes → Actions → Edit code

2. **Create new template** (`templates/page.quiz.liquid`):

```liquid
<div class="page-width">
  <h1>{{ page.title }}</h1>

  <div id="pikvita-quiz" style="max-width: 600px; margin: 0 auto;"></div>
</div>

<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    source: 'shopify-theme-{{ shop.name }}',
    onComplete: function(data) {
      // Track with Shopify Analytics
      if (typeof ShopifyAnalytics !== 'undefined') {
        ShopifyAnalytics.lib.track('Quiz Completed', {
          persona: data.persona,
          email: data.email
        });
      }
    }
  });
</script>
```

3. **Assign template to page**:
   - Create page
   - Template: `page.quiz`

---

## Webflow

### Method 1: Embed Element

1. **Add Embed element**:
   - Drag "Embed" component onto page

2. **Paste code**:

```html
<div id="pikvita-quiz"></div>
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    source: 'webflow',
    height: '100vh' // Full viewport height
  });
</script>
```

3. **Style wrapper**:
   - Add padding to Embed wrapper
   - Set max-width: 800px
   - Center align

### Method 2: Custom Code (Site-wide)

1. **Project Settings** → Custom Code
2. **Before </body> tag**:

```html
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  // Auto-initialize any element with data-pikvita-quiz attribute
  document.addEventListener('DOMContentLoaded', function() {
    const quizContainers = document.querySelectorAll('[data-quiz]');
    quizContainers.forEach(function(container) {
      PikvitaQuiz.init({
        containerId: container.id,
        source: 'webflow-' + window.location.pathname
      });
    });
  });
</script>
```

3. **On page**, add HTML Embed:
```html
<div id="quiz-1" data-quiz></div>
```

---

## Squarespace

### Method 1: Code Block

1. **Edit page** → Add Block → Code
2. **Paste HTML**:

```html
<div id="pikvita-quiz" style="min-height: 800px;"></div>
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    source: 'squarespace',
    onComplete: function(data) {
      // Optional: Track with Squarespace Analytics
      if (window.Squarespace && window.Squarespace.Analytics) {
        window.Squarespace.Analytics.track('Quiz Completed', {
          persona: data.persona
        });
      }
    }
  });
</script>
```

### Method 2: Site-wide Injection

1. **Settings** → Advanced → Code Injection
2. **Footer**:

```html
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
```

3. **On page**, add Code Block:
```html
<div id="pikvita-quiz"></div>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz'
  });
</script>
```

---

## Wix

### Method 1: HTML iFrame

1. **Add** → Embed → HTML iframe
2. **Enter code**:

```html
<div id="pikvita-quiz"></div>
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
    source: 'wix'
  });
</script>
```

### Method 2: Corvid (Wix Code)

1. **Enable Corvid**: Dev Mode → Turn on Dev Mode
2. **Page Code**:

```javascript
// page.js
import { quiz } from 'public/pikvita-quiz.js';

$w.onReady(function () {
    // Load quiz in container
    $w('#quizContainer').html = `<div id="pikvita-quiz"></div>`;

    // Initialize
    quiz.init({
        containerId: 'pikvita-quiz',
        source: 'wix-corvid',
        onComplete: (data) => {
            // Store in Wix CRM
            wixCrm.createContact({
                firstName: data.name.split(' ')[0],
                lastName: data.name.split(' ').slice(1).join(' '),
                emails: [data.email],
                labels: ['quiz-completed', `persona-${data.persona}`]
            });
        }
    });
});
```

---

## Carrd

1. **Add Embed element**
2. **Type**: Code
3. **Code**:

```html
<div id="pikvita-quiz"></div>
<script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
<script>
  PikvitaQuiz.init({
    containerId: 'pikvita-quiz',
    source: 'carrd'
  });
</script>
```

4. **Style**: Set min-height to 800px

---

## React

### Method 1: Component Wrapper

```jsx
// PikvitaQuiz.jsx
import { useEffect, useRef } from 'react';

export default function PikvitaQuiz({ onComplete, source = 'react-app' }) {
  const containerRef = useRef(null);
  const quizInstanceRef = useRef(null);

  useEffect(() => {
    // Load script
    const script = document.createElement('script');
    script.src = 'https://quiz.pikvita.com/embed/pikvita-quiz.js';
    script.async = true;

    script.onload = () => {
      if (window.PikvitaQuiz && containerRef.current) {
        quizInstanceRef.current = window.PikvitaQuiz.init({
          containerId: 'pikvita-quiz-react',
          apiEndpoint: process.env.REACT_APP_QUIZ_API,
          source,
          onComplete: (data) => {
            console.log('Quiz completed:', data);
            if (onComplete) onComplete(data);
          },
          onStepChange: (data) => {
            console.log('Step changed:', data.step);
          }
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (quizInstanceRef.current) {
        window.PikvitaQuiz.destroy('pikvita-quiz-react');
      }
      document.body.removeChild(script);
    };
  }, [onComplete, source]);

  return (
    <div
      ref={containerRef}
      id="pikvita-quiz-react"
      style={{ minHeight: '800px' }}
    />
  );
}
```

### Usage:

```jsx
// App.js
import PikvitaQuiz from './components/PikvitaQuiz';

function App() {
  const handleQuizComplete = (data) => {
    console.log('User persona:', data.persona);
    // Update user profile, show modal, etc.
  };

  return (
    <div className="App">
      <h1>Discover Your Shopping Style</h1>
      <PikvitaQuiz
        onComplete={handleQuizComplete}
        source="react-homepage"
      />
    </div>
  );
}
```

---

## Next.js

### Method 1: Dynamic Component

```jsx
// components/PikvitaQuiz.jsx
'use client'; // For Next.js 13+

import { useEffect } from 'react';
import Script from 'next/script';

export default function PikvitaQuiz({ apiEndpoint, source = 'nextjs' }) {
  const [quizLoaded, setQuizLoaded] = useState(false);

  const initializeQuiz = () => {
    if (typeof window !== 'undefined' && window.PikvitaQuiz) {
      window.PikvitaQuiz.init({
        containerId: 'pikvita-quiz-next',
        apiEndpoint: apiEndpoint || process.env.NEXT_PUBLIC_QUIZ_API,
        source,
        onComplete: (data) => {
          // Track with Next.js analytics
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'quiz_complete', {
              persona: data.persona
            });
          }
        }
      });
      setQuizLoaded(true);
    }
  };

  return (
    <>
      <Script
        src="https://quiz.pikvita.com/embed/pikvita-quiz.js"
        strategy="afterInteractive"
        onLoad={initializeQuiz}
      />
      <div
        id="pikvita-quiz-next"
        className="min-h-screen"
      />
    </>
  );
}
```

### Usage:

```jsx
// app/quiz/page.jsx
import PikvitaQuiz from '@/components/PikvitaQuiz';

export const metadata = {
  title: 'Shopping Personality Quiz | Pikvita',
  description: 'Discover your shopping style and find local shops you\'ll love'
};

export default function QuizPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Discover Your Shopping Personality
      </h1>
      <PikvitaQuiz source="nextjs-quiz-page" />
    </main>
  );
}
```

---

## Vue.js

```vue
<!-- components/PikvitaQuiz.vue -->
<template>
  <div
    :id="containerId"
    class="pikvita-quiz-container"
    style="min-height: 800px"
  ></div>
</template>

<script>
export default {
  name: 'PikvitaQuiz',
  props: {
    apiEndpoint: {
      type: String,
      default: process.env.VUE_APP_QUIZ_API
    },
    source: {
      type: String,
      default: 'vue-app'
    }
  },
  data() {
    return {
      containerId: `pikvita-quiz-${Math.random().toString(36).substr(2, 9)}`,
      quizInstance: null
    };
  },
  mounted() {
    this.loadQuizScript();
  },
  beforeUnmount() {
    if (this.quizInstance && window.PikvitaQuiz) {
      window.PikvitaQuiz.destroy(this.containerId);
    }
  },
  methods: {
    loadQuizScript() {
      const script = document.createElement('script');
      script.src = 'https://quiz.pikvita.com/embed/pikvita-quiz.js';
      script.async = true;
      script.onload = this.initializeQuiz;
      document.head.appendChild(script);
    },
    initializeQuiz() {
      if (window.PikvitaQuiz) {
        this.quizInstance = window.PikvitaQuiz.init({
          containerId: this.containerId,
          apiEndpoint: this.apiEndpoint,
          source: this.source,
          onComplete: (data) => {
            this.$emit('complete', data);
          },
          onStepChange: (data) => {
            this.$emit('step-change', data);
          }
        });
      }
    }
  }
};
</script>
```

### Usage:

```vue
<template>
  <div class="quiz-page">
    <h1>Discover Your Shopping Style</h1>
    <PikvitaQuiz
      @complete="handleQuizComplete"
      @step-change="handleStepChange"
      source="vue-homepage"
    />
  </div>
</template>

<script>
import PikvitaQuiz from '@/components/PikvitaQuiz.vue';

export default {
  components: {
    PikvitaQuiz
  },
  methods: {
    handleQuizComplete(data) {
      console.log('Quiz completed:', data);
      // Navigate to results, update Vuex store, etc.
    },
    handleStepChange(data) {
      console.log('Current step:', data.step);
    }
  }
};
</script>
```

---

## Custom HTML

Simplest integration for any HTML page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopping Quiz</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #fef7ed 0%, #fde8d7 100%);
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #78350f;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Discover Your Shopping Personality</h1>
    <div id="pikvita-quiz"></div>
  </div>

  <script src="https://quiz.pikvita.com/embed/pikvita-quiz.js"></script>
  <script>
    PikvitaQuiz.init({
      containerId: 'pikvita-quiz',
      apiEndpoint: 'https://api.pikvita.com/api/quiz-responses',
      source: 'custom-html',
      onComplete: function(data) {
        alert('Thanks for completing the quiz, ' + data.persona + '!');
      }
    });
  </script>
</body>
</html>
```

---

## Troubleshooting

### Quiz not loading

**Check:**
1. Script URL is correct
2. Container ID matches
3. No JavaScript errors in console
4. CORS headers configured

### Styling conflicts

**Solution:**
```css
/* Isolate quiz styles */
#pikvita-quiz {
  all: initial;
}
#pikvita-quiz * {
  all: revert;
}
```

### Height issues

**Solution:**
```javascript
PikvitaQuiz.init({
  containerId: 'pikvita-quiz',
  height: '100vh', // or 'auto'
  onStepChange: function() {
    // Recalculate height on step change
    const iframe = document.querySelector('#pikvita-quiz iframe');
    if (iframe) {
      iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }
  }
});
```

### Multiple quizzes on one page

**Solution:**
```javascript
// Quiz 1
PikvitaQuiz.init({
  containerId: 'quiz-1',
  source: 'sidebar'
});

// Quiz 2
PikvitaQuiz.init({
  containerId: 'quiz-2',
  source: 'footer'
});
```

---

## Performance Tips

1. **Lazy load**: Only load quiz when user scrolls to it
2. **Preconnect**: Add to `<head>`:
   ```html
   <link rel="preconnect" href="https://quiz.pikvita.com">
   ```
3. **Cache**: Quiz script is cacheable for 1 year
4. **CDN**: Use CDN version for faster global loading

---

Need help? Email [hello@pikvita.com](mailto:hello@pikvita.com)
