const { test, expect } = require('@playwright/test');
const path = require('path');

const DEMO_PATH = 'file://' + path.resolve(__dirname, '../demo.html');

test.describe('onFail Hook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_PATH);
    await page.click('#tab-gate'); // Switch to CAPTCHA tab
  });

  test('should include onFail logic in generated HTML code', async ({ page }) => {
    // Enable Speed Bump to ensure full logic is present
    await page.locator('#speedBumpToggle').check();
    
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('validate: function(onFail)');
    expect(code).toContain("if(onFail) onFail('SPEED')");
    expect(code).toContain("if(!isValid && onFail) onFail('MISMATCH')");
  });

  test('should include onFail logic in generated React code', async ({ page }) => {
    await page.locator('#speedBumpToggle').check();
    await page.selectOption('#captchaExportFormat', 'react');
    
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('export default function BiDiCaptcha({ onValidate, onFail })');
    expect(code).toContain("if(onFail) onFail('SPEED')");
    expect(code).toContain("if (!isValid && onFail) onFail('MISMATCH')");
  });
});
