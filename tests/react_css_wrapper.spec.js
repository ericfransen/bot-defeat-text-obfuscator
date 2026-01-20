const { test, expect } = require('@playwright/test');
const path = require('path');

const DEMO_PATH = 'file://' + path.resolve(__dirname, '../demo.html');

test.describe('React CSS Wrapper', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_PATH);
  });

  test('should include CSS styles in React component', async ({ page }) => {
    // Enable wrapper
    await page.locator('#useWrapper').check();
    
    // Select CSS mode
    await page.locator('input[value="css"]').check();
    
    // Type CSS with newlines and no trailing semicolon
    await page.fill('#rawStyles', 'margin-left: 55px\ncolor: red');
    
    // Select React format
    await page.selectOption('#exportFormat', 'react');
    
    // Check Generated Source (Raw)
    const source = page.locator('#sourceSnippet');
    const code = await source.getAttribute('data-raw');
    
    // Expect React style object in raw code
    expect(code).toContain("marginLeft:'55px'");
    expect(code).toContain("color:'red'");

    // Check Visible Preview (should NOT contain {{...}} placeholder)
    const previewText = await source.textContent();
    expect(previewText).toContain("marginLeft:'55px'");
    expect(previewText).not.toContain("{{...}}");

    // Check Highlighting (HTML structure)
    const previewHtml = await source.evaluate(el => el.innerHTML);
    // Should wrap the div start and style prop in pink
    expect(previewHtml).toContain('<span class="text-pink-400">&lt;div style={{marginLeft');
  });
});
