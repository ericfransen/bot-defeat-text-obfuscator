const { test, expect } = require('@playwright/test');
const path = require('path');

const DEMO_PATH = 'file://' + path.resolve(__dirname, '../demo.html');

test.describe('Obfuscator Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_PATH);
  });

  test('should generate basic obfuscated HTML', async ({ page }) => {
    const input = page.locator('#payloadInput');
    await input.fill('test@example.com');
    
    // Trigger generation (input event)
    await input.dispatchEvent('input');

    const source = page.locator('#sourceSnippet');
    const code = await source.getAttribute('data-raw');
    
    // Obfuscator chunks the text, so full words might be split
    // e.g. "test@exam" + "ple.com"
    // We check that the chunks exist, but arguably NOT the full clean string if entropy > 1
    // For Level 1 (default), it might just reverse or shard.
    
    expect(code).toContain('display:flex');
    expect(code).not.toBe('test@example.com'); // Should NOT be plain text
    expect(code).toContain('span');
  });

  test('should wrap in Shadow DOM when toggled', async ({ page }) => {
    const shadowToggle = page.locator('#useShadow');
    await shadowToggle.check();
    
    const source = page.locator('#sourceSnippet');
    const code = await source.getAttribute('data-raw');
    
    expect(code).toContain('attachShadow({mode: \'closed\'})');
    // The variable is usually 's' or '_root' depending on context, but innerHTML assignment is constant
    expect(code).toContain('.innerHTML =');
  });

  test('should update visual simulation for Shadow DOM', async ({ page }) => {
    // Initial state: No shadow, so scraper sees content
    const scraperResult = page.locator('#scraperResult');
    const shadowToggle = page.locator('#useShadow');
    
    // Check shadow
    await shadowToggle.check();
    
    // Scraper should now see empty/cloaked
    await expect(scraperResult).toContainText('[EMPTY STRING]');
    await expect(page.locator('#matchStatus')).toContainText('Shadow Cloaked');
  });
});

test.describe('CAPTCHA Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_PATH);
    await page.click('#tab-gate'); // Switch to CAPTCHA tab
  });

  test('should generate standard CAPTCHA code', async ({ page }) => {
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('BiDiCaptcha');
    expect(code).toContain('validate');
  });

  test('should wrap CAPTCHA in Shadow DOM when toggled', async ({ page }) => {
    const shadowToggle = page.locator('#shadowCaptchaToggle');
    await shadowToggle.check();
    
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('attachShadow({mode: \'closed\'})');
    expect(code).toContain('_root.innerHTML');
  });

  test('React export should work for Shadow CAPTCHA', async ({ page }) => {
    // Enable Shadow
    await page.locator('#shadowCaptchaToggle').check();
    // Switch to React format
    await page.selectOption('#captchaExportFormat', 'react');
    
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('import React');
    expect(code).toContain('useRef');
    expect(code).toContain('attachShadow');
    expect(code).toContain('shadow.innerHTML');
  });
});
