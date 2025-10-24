# js-text-obfuscator

## Lightweight Text Obfuscator

A simple, "ultra-lightweight," copy-paste repo for two effective text obfuscation techniques.  Made mainly for email or phone numbers; things you don't want bot scrapers to see.

The goal is to provide simple, reusable snippets to deter low-effort email/phone number harvesting bots.

### Techniques Included

- Click to Reveal (Technique 1): Hides the text until a user clicks a button. 

  - This is highly effective as most scrapers do not simulate user clicks.

- Canvas Rendering (Technique 2): Renders the text as pixels in an HTML canvas.
  
  - This is effective against text-only scrapers but is vulnerable to OCR by advanced bots.

### How to Use

Copy the <script> tag from the bottom of demo.html and paste it just before your </body> tag.

Add the corresponding HTML snippets where you want your email to appear.

Snippet 1: Click to Reveal

This method is recommended as it balances security and accessibility. The email is fully accessible once clicked.

HTML:

Place this where you want the "reveal" button to appear.

data-obfuscate="click": Activates the script.

data-user: The part of the email before the @.

data-domain: The part of the email after the @.

<a href="#"
   class="inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
   data-obfuscate="click"
   data-user="contact"
   data-domain="example.com">
   Click to Show Email
</a>


Snippet 2: Canvas Rendering

Use this if you prioritize bot protection over accessibility and user experience (as users won't be able to copy the text).

HTML:

Place this where you want the email image to appear.

data-obfuscate="canvas": Activates the script.

data-user: The part of the email before the @.

data-domain: The part of the email after the @.

data-font (Optional): Sets the font style (e.g., "18px Inter").

data-color (Optional): Sets the text color (e.g., "#333333").

<canvas
    data-obfuscate="canvas"
    data-user="hello"
    data-domain="world.com"
    data-font="20px Arial"
    data-color="#374151"
    width="300"
    height="40"
    class="rounded-md">
</canvas>


### Live Demo

You can view a live demo by opening the demo.html file in your browser.

#### License

This project is licensed under the MIT License. See the MIT.LICENSE file for details.
