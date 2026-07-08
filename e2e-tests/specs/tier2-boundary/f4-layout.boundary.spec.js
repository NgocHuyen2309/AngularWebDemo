const assert = require('assert');

module.exports = {
  'TC-T2-F4-01': {
    name: 'Navbar Toggle - Button exists for responsive layout',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const toggle = dom.window.document.querySelector('.navbar__toggle');
      assert.ok(toggle, 'Navbar toggle button should exist in the markup');
      dom.window.close();
    }
  },
  'TC-T2-F4-02': {
    name: 'Text Overflow - Long inputs handled in user-form',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const emailInput = dom.window.document.querySelector('.user-form__input-email');
      assert.ok(emailInput);
      
      const longEmail = 'a'.repeat(100) + '@example.com';
      emailInput.value = longEmail;
      emailInput.dispatchEvent(new dom.window.Event('input'));
      
      assert.strictEqual(emailInput.value, longEmail);
      dom.window.close();
    }
  },
  'TC-T2-F4-03': {
    name: 'BEM Naming - Modifier formatting (--active) verified',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const style = dom.window.document.querySelector('style');
      assert.ok(style);
      
      // Verify BEM modifier naming (--active, --modifier, etc.) in CSS text
      assert.match(style.textContent, /--[a-zA-Z0-9]+/);
      assert.ok(style.textContent.includes('catalog__filter-btn--active'));
      dom.window.close();
    }
  },
  'TC-T2-F4-04': {
    name: 'BEM Naming - Element formatting (__element) verified',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const style = dom.window.document.querySelector('style');
      assert.ok(style);
      
      // Verify BEM element naming (__input, __toggle, etc.) in CSS text
      assert.match(style.textContent, /__[a-zA-Z0-9]+/);
      assert.ok(style.textContent.includes('navbar__toggle') || style.textContent.includes('user-form__input'));
      dom.window.close();
    }
  },
  'TC-T2-F4-05': {
    name: 'Form Inputs wrap on small screens (box-sizing / width styling)',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const style = dom.window.document.querySelector('style');
      assert.ok(style);
      assert.ok(style.textContent.includes('width: 100%') || style.textContent.includes('box-sizing: border-box'), 'CSS should implement responsive sizing');
      dom.window.close();
    }
  }
};
