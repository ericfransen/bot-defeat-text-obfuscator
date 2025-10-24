
# Lightweight Text Obfuscator

- A ultra-lightweight copy-paste repository for two effective text obfuscation techniques.

- The goal is to provide simple, reusable snippets to deter low-effort text harvesting bots without adding a library.

- This can be used for emails, phone numbers, addresses, or any other sensitive text.

## Techniques Included

### Click to Reveal:

- Hides the text until a user clicks a button or link. This is highly effective as most scrapers do not simulate user clicks.

### Canvas Rendering:

- Renders the text as pixels in an HTML canvas. This is effective against text-only scrapers but is vulnerable to OCR by advanced bots.

### How to Use

Use the interactive generator in demo.html to create your HTML snippets.

Copy the <script> tag from the bottom of demo.html and paste it just before your </body> tag.

Paste your generated HTML snippet where you want your obfuscated text to appear.

Snippet 1: Click to Reveal (Recommended)

This method balances security and accessibility. The text is fully accessible once clicked.

HTML:

data-obfuscate="click": Activates the script.

data-b64-text: Your sensitive text, encoded in Base64. (e.g., btoa("contact@example.com"))

```
<a href="#"
   class="inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
   data-obfuscate="click"
   data-b64-text="Y29udGFjdEBleGFtcGxlLmNvbQ==">
   Click to Show Email
</a>
```

Snippet 2: Canvas Rendering

Use this if you prioritize bot protection over accessibility and user experience (users cannot copy the text). The script automatically handles multi-line text (separated by \n).

HTML:

    - data-obfuscate="canvas": Activates the script.

    - data-b64-text: Your sensitive text, encoded in Base64.

    - data-font (Optional): Sets the font style (e.g., "18px Inter").

    - data-color (Optional): Sets the text color (e.g., "#333333").

<!-- For a multi-line address. Adjust width/height as needed. -->

```
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

## Live Demo

You can view a live demo and generate your own snippets by opening the demo.html file in your browser.
