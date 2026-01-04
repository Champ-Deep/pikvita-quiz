# 📱 Mobile Testing Guide

This guide helps you test the Pikvita quiz on real mobile devices to ensure a perfect user experience.

## Quick Testing Methods

### Method 1: Local Network Testing (Recommended)

Test on real devices connected to your local network:

```bash
# 1. Start local server
cd embed
python -m http.server 8000

# 2. Find your local IP address
# Mac/Linux:
ifconfig | grep "inet "
# Windows:
ipconfig

# 3. Open on mobile device
# Use your local IP, e.g.:
http://192.168.1.100:8000/example.html
```

### Method 2: ngrok (Easy Remote Testing)

Test from anywhere using ngrok:

```bash
# 1. Install ngrok (https://ngrok.com)
brew install ngrok  # Mac
# Or download from https://ngrok.com/download

# 2. Start your local server
cd embed
python -m http.server 8000

# 3. In another terminal, expose it
ngrok http 8000

# 4. Use the https URL on any device
# Example: https://abc123.ngrok.io/example.html
```

### Method 3: GitHub Pages (Public Testing)

Deploy to GitHub Pages for easy testing:

```bash
# 1. Create gh-pages branch
git checkout -b gh-pages

# 2. Push embed folder
git subtree push --prefix embed origin gh-pages

# 3. Enable GitHub Pages in repo settings

# 4. Visit:
https://yourname.github.io/pikvita-quiz/example.html
```

## Device Testing Checklist

### iOS Devices

Test on various iOS devices and versions:

- [ ] iPhone SE (small screen - 4.7")
- [ ] iPhone 12/13/14 (standard - 6.1")
- [ ] iPhone 14 Pro Max (large - 6.7")
- [ ] iPad Mini (tablet - 8.3")
- [ ] iPad Pro (large tablet - 12.9")

**iOS-Specific Checks:**

1. **Safe Area Insets**
   - [ ] Content not hidden by notch
   - [ ] Bottom bar doesn't overlap navigation
   - [ ] Proper padding on iPhone 14 Pro

2. **Touch Interactions**
   - [ ] All buttons at least 44x44pt (iOS guideline)
   - [ ] Sliders easy to drag with thumb
   - [ ] No accidental taps
   - [ ] Haptic feedback works (if implemented)

3. **Rendering**
   - [ ] Gradients render smoothly
   - [ ] Fonts load correctly
   - [ ] Animations run at 60fps
   - [ ] No layout shifts

4. **Safari-Specific**
   - [ ] Works in Safari
   - [ ] Works in Safari Private Mode
   - [ ] Works in Chrome iOS
   - [ ] Works in Firefox iOS

### Android Devices

Test on various Android devices and versions:

- [ ] Small phone (5.0" - 5.5")
- [ ] Standard phone (6.0" - 6.5")
- [ ] Large phone (6.5"+)
- [ ] Android tablet
- [ ] Foldable (if available)

**Android-Specific Checks:**

1. **Touch Interactions**
   - [ ] All buttons at least 48x48dp (Material Design)
   - [ ] Sliders work smoothly
   - [ ] No double-tap zoom on buttons

2. **Browser Compatibility**
   - [ ] Chrome Android
   - [ ] Samsung Internet
   - [ ] Firefox Android
   - [ ] Opera Mini

3. **Rendering**
   - [ ] Colors match iOS
   - [ ] Fonts render correctly
   - [ ] Smooth scrolling

## Functional Testing

### Question Types

Test each question type thoroughly:

#### 1. Quadrant Selector
- [ ] Can tap all 4 options
- [ ] Selection highlights correctly
- [ ] Checkmark appears
- [ ] Can change selection
- [ ] Works in landscape mode

#### 2. Emotion Spectrum
- [ ] All 5 emotions tappable
- [ ] Selection animates smoothly
- [ ] Current emotion shows at top
- [ ] Color changes properly

#### 3. Simple Ranking
- [ ] Can tap to add items
- [ ] Order displays correctly
- [ ] Can remove items by tapping again
- [ ] Priority numbers update

### Navigation

- [ ] "Back" button works
- [ ] "Continue" button enabled when answered
- [ ] "Continue" disabled when not answered
- [ ] Progress bar updates
- [ ] Step counter accurate
- [ ] Smooth transitions between questions

### User Form

- [ ] All fields visible
- [ ] Keyboard doesn't cover inputs
- [ ] Email validation works
- [ ] Required fields enforced
- [ ] Submit button works
- [ ] Loading state shows

### Results Screen

- [ ] Persona displays correctly
- [ ] Emoji renders
- [ ] Score bars animate
- [ ] CTA button works
- [ ] Share button works (native share on mobile)
- [ ] All text readable

## Performance Testing

### Loading Speed

```bash
# Test with Chrome DevTools
# 1. Open Chrome DevTools
# 2. Go to Network tab
# 3. Set throttling to "Slow 3G"
# 4. Reload page

Target metrics:
- First Contentful Paint: < 2s
- Time to Interactive: < 4s
- Total Load Time: < 6s
```

- [ ] Quiz loads in < 4s on 3G
- [ ] No flash of unstyled content
- [ ] Fonts load quickly
- [ ] Images optimized

### Scrolling Performance

- [ ] Smooth 60fps scrolling
- [ ] No jank when typing
- [ ] Animations don't lag
- [ ] No memory leaks (long sessions)

### Battery Usage

- [ ] Doesn't drain battery excessively
- [ ] CPU usage reasonable
- [ ] No background processes

## Accessibility Testing

### Screen Reader

**iOS VoiceOver:**
```
Settings → Accessibility → VoiceOver → On
```

- [ ] All buttons announced
- [ ] Quiz questions readable
- [ ] Form labels associated
- [ ] Proper heading hierarchy

**Android TalkBack:**
```
Settings → Accessibility → TalkBack → On
```

- [ ] All elements accessible
- [ ] Logical reading order
- [ ] Buttons have descriptions

### Visual Accessibility

- [ ] Text legible (16px minimum)
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Works with larger text sizes
- [ ] Works with reduced motion
- [ ] Color not sole information carrier

### Motor Accessibility

- [ ] Can complete with one hand
- [ ] Targets large enough
- [ ] No time limits
- [ ] Can navigate with keyboard (if applicable)

## Network Conditions

Test under various network conditions:

### Fast 4G/5G
- [ ] Loads quickly
- [ ] Animations smooth
- [ ] Form submission instant

### 3G
- [ ] Still usable
- [ ] Loading indicators show
- [ ] Graceful degradation

### Offline
- [ ] Shows appropriate message
- [ ] Doesn't break
- [ ] Can resume when back online

### Slow/Flaky Connection
- [ ] Retry logic works
- [ ] Timeout handling
- [ ] Error messages clear

## Orientation Testing

### Portrait Mode
- [ ] All content visible
- [ ] Proper layout
- [ ] No horizontal scroll
- [ ] Text readable

### Landscape Mode
- [ ] Layout adapts
- [ ] Buttons accessible
- [ ] Keyboard doesn't cover content
- [ ] Optional: different layout if beneficial

### Orientation Change
- [ ] Smooth transition
- [ ] State preserved
- [ ] No layout breaks
- [ ] No data loss

## Form Factor Testing

### Small Screens (< 360px)
- [ ] Content doesn't overflow
- [ ] Buttons not cut off
- [ ] Text remains readable
- [ ] Sliders still functional

### Medium Screens (360px - 414px)
- [ ] Optimal layout
- [ ] Good spacing
- [ ] Easy to use

### Large Screens (> 414px)
- [ ] Centered content
- [ ] Not stretched
- [ ] Maintains readability

### Tablets
- [ ] Makes use of space
- [ ] Not just scaled-up phone view
- [ ] Touch targets appropriate for tablet

## Embedded Testing

### iFrame Embed
- [ ] Loads in iframe
- [ ] Correct height
- [ ] No scrollbar issues
- [ ] PostMessage communication works

### WordPress
- [ ] Shortcode works
- [ ] Renders correctly
- [ ] No conflicts with theme
- [ ] Mobile-responsive

### Other Platforms
- [ ] Webflow
- [ ] Shopify
- [ ] Squarespace
- [ ] Wix

## Real User Scenarios

### Use Case 1: Commuter
*Testing while moving (bus, train)*

- [ ] Works with motion
- [ ] Touch precision maintained
- [ ] Network switches handled
- [ ] Can pause and resume

### Use Case 2: One-Handed Use
*Testing with thumb only*

- [ ] All controls reachable
- [ ] Can complete entire quiz
- [ ] No accidental taps

### Use Case 3: Sunlight
*Testing in bright conditions*

- [ ] Screen readable outdoors
- [ ] Contrast sufficient
- [ ] Colors distinguishable

### Use Case 4: Noisy Environment
*Testing without sound*

- [ ] No audio required
- [ ] Visual feedback sufficient
- [ ] Still engaging

## Browser-Specific Issues

### iOS Safari

Common issues to check:

- [ ] Viewport height (100vh bug with bottom bar)
- [ ] Fixed positioning
- [ ] Touch event handling
- [ ] Date input styling
- [ ] Autocomplete behavior

### Chrome Mobile

- [ ] Address bar auto-hide
- [ ] Pull-to-refresh doesn't interfere
- [ ] Tab switching preserves state

### Samsung Internet

- [ ] Layout consistent
- [ ] Colors accurate
- [ ] Gestures don't conflict

## Testing Tools

### Remote Debugging

**iOS (Safari):**
1. Enable Web Inspector on iOS: Settings → Safari → Advanced
2. Connect device to Mac
3. Safari → Develop → [Device Name]

**Android (Chrome):**
1. Enable USB Debugging on Android
2. Connect device to computer
3. Chrome → chrome://inspect → Devices

### Emulators/Simulators

**iOS Simulator (Mac only):**
```bash
# Open Xcode
# Xcode → Open Developer Tool → Simulator
```

**Android Emulator:**
```bash
# Install Android Studio
# Tools → AVD Manager → Create Virtual Device
```

**BrowserStack (Online):**
```
https://www.browserstack.com
# Test on real devices without owning them
```

### Testing Automation

Simple automated test:

```javascript
// test-mobile.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Emulate iPhone
  await page.emulate(puppeteer.devices['iPhone 12']);

  await page.goto('http://localhost:8000/example.html');

  // Test question interaction
  await page.click('button[data-quadrant="explorer"]');
  await page.click('button:has-text("Continue")');

  // Take screenshot
  await page.screenshot({ path: 'mobile-test.png' });

  await browser.close();
})();
```

## Issue Tracking Template

When you find an issue, document it:

```markdown
### Issue: [Brief Description]

**Device:** iPhone 14 Pro, iOS 17.0
**Browser:** Safari 17.0
**Screen Size:** 393 x 852
**Network:** 4G

**Steps to Reproduce:**
1. Open quiz
2. Answer first question
3. Tap Continue
4. ...

**Expected Behavior:**
Should transition smoothly to next question

**Actual Behavior:**
Animation stutters, shows blank screen for 1s

**Screenshot/Video:**
[Attach if possible]

**Severity:** Medium
**Priority:** High
**Status:** Open
```

## Performance Benchmarks

Target performance metrics:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| First Paint | < 1s | < 2s | > 2s |
| Time to Interactive | < 3s | < 5s | > 5s |
| Quiz Completion | < 2min | < 3min | > 3min |
| FPS (animations) | 60fps | 30fps | < 30fps |
| Memory Usage | < 50MB | < 100MB | > 100MB |
| Battery (10min use) | < 2% | < 5% | > 5% |

## Final Checklist

Before launching:

### Critical
- [ ] Works on iOS Safari
- [ ] Works on Chrome Android
- [ ] All questions functional
- [ ] Form submission works
- [ ] Data saved correctly
- [ ] No console errors

### Important
- [ ] Fast loading (< 4s on 3G)
- [ ] Smooth animations
- [ ] Accessible (screen reader)
- [ ] Works in landscape
- [ ] Email delivery confirmed

### Nice-to-Have
- [ ] Haptic feedback
- [ ] Native share working
- [ ] Offline message
- [ ] PWA capabilities

## Resources

### Testing Services

- **BrowserStack**: https://www.browserstack.com - Real device testing
- **LambdaTest**: https://www.lambdatest.com - Cross-browser testing
- **Sauce Labs**: https://saucelabs.com - Automated testing

### Tools

- **Google Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

### Documentation

- **iOS Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Material Design**: https://material.io/design
- **MDN Touch Events**: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

---

**Pro Tip:** Test early, test often. Get the quiz on your personal phone and use it throughout development. You'll catch issues faster than any checklist!
