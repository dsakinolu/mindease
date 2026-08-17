# 🌮 MindEase — Web Version

**Live app:** https://dsakinolu.github.io/mindease/
**Design showcase:** https://dsakinolu.github.io/mindease/design.html

MindEase is a mental wellness app concept: mood check-ins, a mood log,
physician appointments, support chat, curated articles, relationship tips,
and a calming store — guided by a sleepy taco mascot.

It began as an **interactive Figma prototype** (UX coursework at Indiana
University). This repo is the working web version: every screen from the
prototype, rebuilt mobile-first with accessibility as the core requirement.

---

## ✨ What's here

- **Splash screen** — “Empower your mind, ease your journey,” starring the official sleepy taco logo, tap-anywhere to begin; returning users skip straight to their daily check-in
- **Breathe** — a guided box-breathing exercise with animation and screen-reader cues
- **Crisis Help** — real 24/7 US resources (988, Crisis Text Line, SAMHSA) with tap-to-call links
- **The full app flow** — splash → account → terms → tutorial → mood
  check-in → mood log → main menu → physicians (with date/time booking),
  support (with AI chat), articles, relationships (NURTURE), feedback,
  store & cart. All state saved in the browser.
- **A design showcase page** (`design.html`) — the original Figma screens
  with one-sentence captions, plus a built-in **draft mode**: upload
  screenshots and edit captions right on the page, then export the updated
  data file to publish.

## ♿ Accessibility (the point of this rebuild)

- **WCAG AA color contrast** — the prototype's gray-on-gray buttons became
  navy/white; every text-background pair checked
- **Atkinson Hyperlegible** body font — designed for low-vision readers
- **Real semantics** — the emoji mood picker is a labeled radio group; the
  chat is a live region; forms have visible labels and inline errors
- **Keyboard-first** — every control reachable and operable by keyboard,
  with strong visible focus rings; focus moves to each new screen's heading
- **Touch targets ≥ 44px**, skip link, `prefers-reduced-motion` respected
- **Screen-reader announcements** for toasts and chat replies

## 📲 It's an installable app (PWA)

MindEase is a Progressive Web App. On the live site:
- **iPhone:** Share button → **Add to Home Screen**
- **Android:** browser menu → **Install app** / **Add to Home screen**

It installs with the sleepy taco icon, opens fullscreen like a native app,
and **works offline** thanks to a service worker that caches the whole app.
(Note: PWA install & offline need the deployed HTTPS site, not local files.)

## 🛠️ Stack

Vanilla HTML/CSS/JavaScript, hash-based screen routing, localStorage.
No frameworks, no build step — deploys to GitHub Pages as-is.

## Updating the design showcase

1. Open `design.html` → **✏️ Draft mode**
2. Click a card to upload a Figma screenshot (Figma: select frame →
   Export → PNG 2x), type its one-sentence caption
3. **⬇ Download showcase-data.js** and replace `js/showcase-data.js`
   in the repo — done, it's published

## ⚠️ Demo disclaimer

MindEase is a portfolio prototype, not a medical service, and is not a
substitute for professional care. In the US, call or text **988** for the
Suicide & Crisis Lifeline.

Designed & built by **Sefunmi Akin-Olukunle** ·
[Portfolio](https://dsakinolu.github.io/portfolio/)
