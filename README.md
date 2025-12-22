# Lightweight Text Obfuscator

- A ultra-lightweight copy-paste repository for effective text obfuscation techniques.

- The goal is to provide simple, reusable snippets to deter text harvesting bots without adding a heavy library.

- This can be used for emails, phone numbers, addresses, or any other sensitive text.

## Comparison of Obfuscation Tiers

| Method | Bot Difficulty | UX/Accessibility | Implementation Cost |
| :--- | :--- | :--- | :--- |
| **Click-to-Reveal** | Low | High | Minimal |
| **Canvas Render** | Moderate | Very Low | Low |
| **CSS Reversal** | Moderate | High | Moderate |
| **SVG Path Data** | High | Low | High (Generation only) |
| **Cloudflare Turnstile** | Very High | High | High (API req) |

**Pros & Cons:**

- **Click-to-Reveal:** Best for accessibility, but weak against scrapers that can execute JS.
- **Canvas Render:** Strong against static scraping, but terrible for accessibility (screen readers cannot read this).
- **CSS Reversal:** Good balance of UX and bot deterrence (confuses DOM scrapers), but advanced bots can see through it.
- **SVG Path Data:** Extremely hard to scrape without OCR. Zero JavaScript required on the target site.
- **Cloudflare Turnstile:** The gold standard for protection, but requires an API key and external dependency.

## Techniques Included

### 1. Click to Reveal (Standard)
- Hides the text until a user clicks a button. 
- **Pros:** High security against static scrapers; text is accessible after click.
- **Cons:** Requires user interaction.

### 2. Canvas Rendering (Harder to Scrape)
- Renders the text as pixels in an HTML canvas.
- **Pros:** Effective against text-only scrapers (curl, Cheerio).
- **Cons:** **Major Accessibility Failure** (screen readers cannot read this). Use with caution.

### 3. CSS Reversal (UX Friendly)
- Renders text in reverse order (e.g., `moc.elpmaxe`) but uses CSS `unicode-bidi` and `direction: rtl` to display it correctly to the user.
- **Pros:** Seamless UX (looks normal to user); confuses bots reading the DOM directly.
- **Cons:** Advanced bots checking visual rendering might bypass it.

### 4. Honeypot Field (Bot Trap)
- A hidden input field that users cannot see but bots might fill out.
- **Usage:** Add this to your forms. If the backend receives a value in this field, the submission is from a bot.

### 5. SVG Path Data (High Security)
- Converts your text into vector shapes (`<path>` elements).
- **Pros:** 
    - **No JavaScript required** on the target site.
    - Scales perfectly (Retina/High DPI).
    - Can be styled with CSS (`fill: currentColor`).
- **Cons:** Not copy-pasteable by users (unless you wrap it in a custom script). Screen readers need `aria-label`.

## How to Use

Use the interactive generator in **demo.html** to create your HTML snippets.

1. Open `demo.html` in your browser.
2. Enter your text (email, phone, etc.).
3. Copy the generated HTML snippet.
4. Copy the `<script>` tag from the bottom of `demo.html` (only needed for "Click to Reveal" and "Canvas").

### Snippet 1: Click to Reveal

HTML Attributes:
- `data-obfuscate="click"`: Activates the script.
- `data-b64-text`: Your sensitive text, encoded in Base64.

```html
<a href="#"
   class="inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
   data-obfuscate="click"
   data-b64-text="Y29udGFjdEBleGFtcGxlLmNvbQ==">
   Click to Show Email
</a>
```

### Snippet 2: Canvas Rendering

```html
<canvas
    data-obfuscate="canvas"
    data-b64-text="MTIzIE1haW4gU3RyZWV0CkRlbnZlciwgQ08gODAyMDI="
    data-font="18px Arial"
    data-color="#374151"
    width="300"
    height="60"
    class="rounded-md">
</canvas>
```

### Snippet 3: CSS Reversal

No JavaScript required! Just CSS.

```html
<span style="unicode-bidi: bidi-override; direction: rtl;">
  moc.elpmaxe@tcatnoc
</span>
```

### Snippet 4: Honeypot Field

Paste this inside your `<form>` tags.

```html
<div style="opacity: 0; position: absolute; top: 0; left: 0; height: 0; width: 0; z-index: -1;">
    <label for="website_honeypot">Website</label>
    <input type="text" id="website_honeypot" name="website_honeypot" tabindex="-1" autocomplete="off">
</div>
```

### Snippet 5: SVG Path Data

Generates a vector image of your text. Zero dependencies.

```html
<svg viewBox="0 0 200 40" width="200" height="40" role="img" aria-label="Contact Information">
  <path d="M10 10 ... (vector data) ..." fill="currentColor" />
</svg>
```

## Live Demo

You can view a live demo and generate your own snippets by opening the `demo.html` file in your browser.