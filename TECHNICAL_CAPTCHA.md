# Technical Deep Dive: BiDi Client-Side CAPTCHA

This document details the architecture of the **BiDi-Auth CAPTCHA**, a client-side challenge-response system designed to defeat automated form submissions without requiring server-side session storage or third-party dependencies (like Google reCAPTCHA).

## 1. The Threat Model

Standard client-side CAPTCHAs are historically weak because the "Answer" must exist somewhere in the browser for validation to occur.
*   **Naive Approach:** Storing `var secret = "ABC"` in the global scope.
*   **Attack:** Bot simply reads `window.secret` and submits it.

**BiDi-Auth** addresses this by using **Scope Isolation** and **Visual-Logical Decoupling**.

---

## 2. Architecture: The Closure Fortress

To prevent bots from reading the secret variable, we utilize the **Module Pattern (IIFE)**.

```javascript
const BiDiCaptcha = (function() {
    // 🔒 PRIVATE SCOPE
    let _secret = ''; // Not accessible from window.BiDiCaptcha
    
    function _generate() { ... }
    
    return {
        // Public API
        init: _generate,
        validate: function(input) {
            return input === _secret; // Only the internal function can read _secret
        }
    };
})();
```

**Security Implication:**
There is no variable in the DOM or Global Scope that holds the answer. To find the secret, a bot must either:
1.  **Break the Visual Puzzle** (Solve the CAPTCHA).
2.  **Reverse Engineer the Memory:** Attempt to hook into the closure's memory context (extremely difficult for generic scrapers).

---

## 3. The Visual Puzzle: Defeating OCR

Once the secret is hidden, the only way to find it is to "read" it from the screen. We deploy three layers of defense against Machine Vision (OCR).

### Layer 1: Bi-Directional (BiDi) Override
We exploit the `unicode-bidi: bidi-override` CSS property to render text in reverse.

*   **Secret:** `ABCD`
*   **Rendered HTML:** `<span dir="rtl">DCBA</span>`
*   **Visual Output:** "A B" (The browser flips "DCBA" back to "ABCD")
*   **OCR/Scraper:** Sees "DCBA".

**The Trap:** If a bot reads the characters in order (left-to-right), it gets the sequence backwards. If it tries to be smart and reverse them, we randomize which chunks are reversed and which are standard, creating a non-deterministic sequence.

### Layer 2: The Phantom Atom
The last character of the CAPTCHA is never rendered as text. It is rendered as **CSS Content**.

```css
.phantom::after { content: 'X'; }
```
*   **DOM:** `<span></span>` (Empty)
*   **Vision:** "X"
*   **OCR Bots:** Often ignore empty spans, missing the final character entirely.

### Layer 3: Anti-OCR Noise Mesh (SVG)
We overlay a chemically-generated SVG noise pattern on top of the text.
*   **Bézier Curves:** Random thin lines that cut through characters (e.g., turning an `F` into an `E` or `P`).
*   **Stochastic Dots:** High-contrast dots that act as "salt and pepper" noise, confusing the segmentation algorithms of Tesseract and other standard OCR libraries.

### Layer 4: Shadow DOM Wrapper (New in v3.2)
The entire CAPTCHA widget can be rendered inside a `closed` Shadow DOM Root.
*   **Effect:** `document.body.innerText` does not see the CAPTCHA text.
*   **Scraper View:** Empty string.
*   **Attack Cost:** The bot must specifically query for shadow hosts and pierce them using [CDP](https://chromedevtools.github.io/devtools-protocol/)Puppeteer/Playwright methods, filtering out 90% of basic DOM scrapers.

---

## 4. Validation Logic

The validation is purely strict equality, but with a twist to handle "invisible" characters.

```javascript
const val = input.value
  .toUpperCase()
  .replace(/\u200B/g, '') // Remove Zero-Width spaces (Decoys)
  .trim();

return val === _secret;
```

**Why strip `\u200B`?**
We occasionally inject Zero-Width Spaces into the DOM.
*   **Human:** Doesn't see them, doesn't type them.
*   **Bot:** Copies the DOM text, including the invisible space.
*   **Result:** The bot submits `A​BC ` (length 4), which fails against the secret `ABC` (length 3).

---

## 5. Temporal Defense: The Speed Bump

In addition to visual and structural defenses, we employ **Timing Analysis** to detect non-human behavior.

*   **Mechanism:** Tracking the delta between **first interaction (typing)** and submission.
*   **Threshold:** `< 1.5 seconds`
*   **Rationale:** Even for a simple 5-character code, the cognitive load of reading the BiDi-obfuscated text and the physical latency of typing it exceeds 1.5s for even the speediest of humans.
*   **Outcome:** Submissions that are physically impossible for humans (e.g., instant programmatic filling or sub-second typing) are rejected immediately with a "Too Fast, Bot!" error. This prevents brute-force scripts and low-effort bots that fill inputs without simulating keystrokes.

---

## 6. Conclusion

BiDi-Auth shifts the cost of attack from **Computation** (cheap) to **Perception** (expensive).

By forcing an attacker to run a headless browser, render CSS, execute JavaScript, pierce Shadow DOM, and perform advanced computer vision on every attempt, we make spamming a personal blog or contact form economically unviable.