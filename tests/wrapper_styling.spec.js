const { test, expect } = require('@playwright/test');
const path = require('path');

const DEMO_PATH = 'file://' + path.resolve(__dirname, '../demo.html');

test.describe('Wrapper Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_PATH);
  });

  test('should apply Tailwind wrapper to Obfuscator output', async ({ page }) => {
    // Enable wrapper
    await page.locator('#useWrapper').check();
    
    // Select Tailwind mode (default)
    await page.locator('input[value="tailwind"]').check();
    
    // Type some classes
    await page.fill('#twClasses', 'bg-red-500 p-4 rounded');
    
    // Check Generated Source
    const source = page.locator('#sourceSnippet');
    const code = await source.getAttribute('data-raw');
    expect(code).toContain('<div class="bg-red-500 p-4 rounded">');
    
    // Check Visual Render
    const renderTarget = page.locator('#renderTarget');
    // The wrapper should be inside renderTarget
    const wrapper = renderTarget.locator('.bg-red-500.p-4.rounded');
    await expect(wrapper).toBeVisible();
  });

  test('should apply CSS wrapper to Obfuscator output', async ({ page }) => {
    // Enable wrapper
    await page.locator('#useWrapper').check();
    
    // Select CSS mode
    await page.locator('input[value="css"]').check();
    
    // Type some styles
    await page.fill('#rawStyles', 'background: blue; padding: 20px;');
    
    // Check Generated Source
    const source = page.locator('#sourceSnippet');
    const code = await source.getAttribute('data-raw');
    expect(code).toContain('<div style="background: blue; padding: 20px;">');
    
    // Check Visual Render
    const wrapper = page.locator('#renderTarget > div');
    await expect(wrapper).toHaveAttribute('style', /background: blue/);
  });

  test('should apply wrapper to React export', async ({ page }) => {
    await page.locator('#useWrapper').check();
    await page.fill('#twClasses', 'bg-green-500');
    await page.selectOption('#exportFormat', 'react');
    
    const source = page.locator('#sourceSnippet');
    const code = await source.getAttribute('data-raw');
    expect(code).toContain('className="bg-green-500"');
  });
});
