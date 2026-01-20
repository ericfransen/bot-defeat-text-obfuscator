const { test, expect } = require('@playwright/test');
const path = require('path');

const DEMO_PATH = 'file://' + path.resolve(__dirname, '../demo.html');

test.describe('CAPTCHA Speed Bump', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_PATH);
    await page.click('#tab-gate'); // Switch to CAPTCHA tab
  });

  test('should show Speed Bump toggle and tooltip', async ({ page }) => {
    const toggle = page.locator('#speedBumpToggle');
    await expect(toggle).toBeVisible();
    
    // Check tooltip (might need to hover)
    const container = page.locator('label[for="speedBumpToggle"]').locator('..'); // Parent div
    await container.hover();
    const tooltip = container.locator('div:has-text("Disqualify <1.5s")');
    await expect(tooltip).toBeVisible();
  });

  test('should include speed bump logic in generated HTML code', async ({ page }) => {
    // Enable Speed Bump
    await page.locator('#speedBumpToggle').check();
    
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('let _startTime = null;');
    expect(code).toContain('_startTime = null;');
    expect(code).toContain('_generate(); return false;');
  });

  test('should include speed bump logic in generated React code', async ({ page }) => {
    await page.locator('#speedBumpToggle').check();
    await page.selectOption('#captchaExportFormat', 'react');
    
    const codeBox = page.locator('#integrationCode');
    const code = await codeBox.textContent();
    
    expect(code).toContain('const startTimeRef = useRef(null);');
    expect(code).toContain('startTimeRef.current = null;');
    expect(code).toContain("generateCaptcha(); return;");
  });

  test('Demo interaction: should reject fast submissions and regenerate', async ({ page }) => {
    // Enable Speed Bump
    await page.locator('#speedBumpToggle').check();
    
    // Get initial secret
    const initialSecret = await page.locator('#authOCRView').textContent();
    
    await page.click('button:has-text("Bot Attack")');
    // Bot Attack fills input and calls validateAuth(2000)
    
    const status = page.locator('#authStatus');
    // Should be "Too Fast, Bot!" immediately
    await expect(status).toHaveText('Too Fast, Bot!');
    await expect(status).toHaveClass(/text-orange-500/);
    
    // Wait for regeneration (2s delay + buffer)
    await page.waitForTimeout(2500);
    
    // Verify regeneration
    const newSecret = await page.locator('#authOCRView').textContent();
    expect(newSecret).not.toBe(initialSecret);
    expect(newSecret).not.toBe('[EMPTY]');
  });

  test('Demo interaction: should allow slow submissions', async ({ page }) => {
    // Enable Speed Bump
    await page.locator('#speedBumpToggle').check();
    
    // Wait > 1.5s
    await page.waitForTimeout(1600);
    
    // Get the secret code from the OCR view which shows it in plain text if noise is off (default)
    const secret = await page.locator('#authOCRView').textContent();
    
    // Use type with delay to ensure input events fire and simulation is human-like
    await page.type('#authInput', secret, { delay: 100 });
    
    // Additional wait to ensure total time > 1.5s (Type takes ~0.5s, so 1.6s wait is plenty)
    await page.waitForTimeout(1600);
    
    await page.click('button:has-text("Verify CAPTCHA")');
    
    const status = page.locator('#authStatus');
    await expect(status).toHaveText('Verified');
    await expect(status).toHaveClass(/text-green-500/);
  });
});
