# Text-Obfuscator & Client-Side CAPTCHA

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.2-teal)
![Size](https://img.shields.io/badge/size-2kb-green)

**The lightweight, privacy-first alternative to heavy bot protection.**

Protect your email addresses, phone numbers, short-form data, and forms from 99% of bots, scrapers, and AI crawlers without relying on tracking-heavy third-party services or risking vendor lock-in.

---

## 🚨 The Problem

In 2026, the web is overrun by automated actors, BOTS!

1.  **"Broad-Net" Scrapers:** Millions of cheap, dumb scripts constantly crawl the web looking for `mailto:` links and `@` symbols to build spam lists.
2.  **Targeted Crawlers:** Sophisticated bots (Puppeteer/Playwright) that render JavaScript to extract pricing, content, or contact info.
3.  **Vision AI:** New-age bots that use OCR (Optical Character Recognition) to "read" images of text.

### The "Big Tech" Solution & Its Flaws
Traditionally, you would reach for **Google reCAPTCHA** or **Cloudflare Turnstile**. While effective, they come with significant downsides for personal sites, portfolios, and privacy-conscious projects:

*   **Vendor Lock-in & Outages:** If Cloudflare goes down (a seemingly growing common occurrence), your forms break. You are at the mercy of their uptime.
*   **Privacy Invasion:** These services often track your users across the web to build "risk scores."
*   **Performance Bloat:** Loading a 3rd-party CAPTCHA script can add hundreds of kilobytes of JavaScript, hurting your Lighthouse scores and slowing down your site.
*   **Overkill:** Do you really need an enterprise-grade banking security layer just to let someone send you a "Hello" email?

---

## 🛡️ The Solution: BiDi & Phantom Obfuscation

**Text-Obfuscator** sits in the "Goldilocks Zone" of security: **Low Cost, High Friction.**

We don't try to outsmart the Bots. We aim to make scraping your site **economically unviable** for spammers. By forcing bots to use expensive Vision AI instead of cheap string parsing, we effectively price them out of attacking you.

### Core Technologies

#### 1. Adversarial Weave (Visual Obfuscation)
We use **Bi-Directional (BiDi)** overrides to decouple the *Visual Order* from the *Logical (DOM) Order*.
*   **The User Sees:** `admin@example.com`
*   **The DOM Contains:** `moc.elpmaxe@nimda` (or a scrambled mess of spans).
*   **The Scraper Sees:** Garbage. Even if they extract the text, it is linguistically incorrect.

#### 2. Phantom Atoms
We inject characters using CSS `::after { content: 'a' }`.
*   These characters **do not exist** in the DOM text node.
*   `innerText` scrapers will see gaps in the words (e.g., "dmin@xample.co"), rendering the data useless for spam lists.

#### 3. Well Poisoning & Structural Chaos
We inject invisible "decoy" elements with `opacity: 0` that human users never see, but bots scrape as valid text.
*   **Result:** A scraped email looks like `adQmin@exZampPle.cRom`, which bounces when they try to email it.

#### 4. Anti-OCR Mesh (Visual Noise)
For the CAPTCHA, we overlay an SVG noise mesh that cuts through characters.
*   **Human Brain:** Easily ignores the lines and reads the code.
*   **Traditional OCR:** Fails segmentation, reading an `E` as an `8` or `F`.
*   **Vision AI:** Can solve it, but costs ~$0.01 per attempt, making spam campaigns bankrupt themselves.

#### 5. Shadow DOM Wrapper
We wrap the protected content inside a **Closed Shadow DOM Root**.
*   **Scrapers:** `document.body.innerText` returns an **empty string**. The content is invisible to standard DOM scraping.
*   **Protection:** Forces attackers to use expensive automation tools (Playwright/[CDP](https://chromedevtools.github.io/devtools-protocol/)) to pierce the shadow boundary.

---

## 🚀 Usage

This tool is a **Client-Side Generator**. You use the generator (the `demo.html` file) to create the code snippets, then paste them into your static site (Next.js, Hugo, Jekyll, plain HTML).

### 1. The Obfuscator (For Static Text)
Use this for **Emails**, **Phone Numbers**, **Public API Keys**, etc.

1.  Open `demo.html` in your browser.
2.  Paste your text (e.g., `me@mysite.com`) into the "Target Payload" box.
3.  Adjust the **Jumble Level** ("High" or "Extreme" recommended).
4.  Toggle **Smart Interactions** if you want "Click to Copy" or "Click to Email" functionality.
5.  Select your export format (**HTML** or **React**).
6.  Click **Copy**, and paste the code into your site.

**Zero Dependencies:** The generated HTML/CSS is self-contained. It works anywhere.

### 2. The BiDi CAPTCHA (For Forms)
Use this for **Contact Forms**, **Comments**, or **Signups**.

1.  Open `demo.html` and switch to the **CAPTCHA** tab.
2.  Toggle **Anti-OCR Mesh** based on your security needs.
3.  Select **React** or **HTML** format.
4.  Click **Copy Code**.
5.  Paste it into your project.

#### Integration Logic
The CAPTCHA runs entirely in the client's browser using a **Closure Pattern** (IIFE) to hide the secret key from the global scope.

**Vanilla JS Example:**
```html
<form onsubmit="return validateForm()">
  <!-- Paste generated CAPTCHA code here -->
  
  <button type="submit">Send</button>
</form>

<script>
  function validateForm() {
    if (!BiDiCaptcha.validate()) {
      alert("Invalid CAPTCHA code!");
      return false; // Stop submission
    }
    return true; // Allow submission
  }
</script>
```

**React Example:**
```jsx
import BiDiCaptcha from './BiDiCaptcha';

export default function ContactForm() {
  const [isHuman, setIsHuman] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isHuman) {
      alert("Robots not allowed!");
      return;
    }
    // Proceed with submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <BiDiCaptcha onValidate={setIsHuman} />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

## ☁️ Why Client-Side? (The Static Site Advantage)

Moving security to the client side offers benefits for the modern "JAMstack" web:

1.  **Unbreakable Uptime:** Your security logic lives in your code. It works offline, on localhost, and during major cloud outages.
2.  **Privacy Compliance:** No cookies, no IP tracking, no data sent to Google/Cloudflare. GDPR/CCPA friendly by default.
3.  **Instant Feedback:** Users don't wait for a server round-trip to know they typed the wrong code.
4.  **Free:** Costs $0.00/month forever.

---

## 🔬 How it Works (The Science)

We utilize advanced browser mechanics to create a "Phantom Shield" that separates what humans see from what bots read.

*   **[Technical Deep Dive: The Obfuscator](TECHNICAL_OBFUSCATOR.md)**
    *   Learn about **Phantom Atoms**, **BiDi Sharding**, and **XOR Encryption**.
*   **[Technical Deep Dive: The CAPTCHA](TECHNICAL_CAPTCHA.md)**
    *   Learn about **Scope Isolation (Closures)**, **Anti-OCR Meshes**, and **Visual Decoupling**.

---

## ⚠️ Security Disclaimer

This library implements **Security by Friction**.

*   **Is it hackable?** Yes. A motivated attacker with enough time, resources, and custom scripting *can* defeat client-side logic.
*   **Should I use it for high security?** Absolutely not. Critical security requires server-side validation and 2FA.
*   **Should I use it for my blog's contact form?** Yes. It is perfectly calibrated to stop the 99% of "drive-by" spam that plagues personal sites, without the heavy weight of enterprise tools.

---

## 💻 Live Demo

You can view a live demo and generate your own snippets by opening the demo.html here:

https://ericfransen.github.io/js-text-obfuscator/demo.html

---

## 📜 License

MIT License. Free to use for personal and commercial projects.

