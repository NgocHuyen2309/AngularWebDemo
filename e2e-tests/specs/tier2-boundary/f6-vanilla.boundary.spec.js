const assert = require('assert');

module.exports = {
  'TC-T2-F6-01': {
    name: 'Close Button stopPropagation - Runs without runtime errors',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      const modal = dom.window.document.querySelector('.vanilla-modal');
      const closeBtn = modal.querySelector('.vanilla-modal__close-btn');
      
      try {
        closeBtn.click();
      } catch (err) {
        assert.fail(`Close button click threw error: ${err.message}`);
      }
      
      assert.strictEqual(dom.window.document.querySelector('.vanilla-modal'), null);
      dom.window.close();
    }
  },
  'TC-T2-F6-02': {
    name: 'Prototype Constructor Link - Strict reference verification',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const CustomModal = dom.window.CustomModal;
      
      assert.strictEqual(CustomModal.prototype.constructor, CustomModal, 'Constructor link must point to CustomModal');
      dom.window.close();
    }
  },
  'TC-T2-F6-03': {
    name: 'Cleanup Validation - No memory leaks or orphaned DOM nodes',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      // Launch and close twice to check clean cleanup
      let modal = dom.window.document.querySelector('.vanilla-modal');
      assert.ok(modal);
      modal.querySelector('.vanilla-modal__close-btn').click();
      
      btn.click();
      modal = dom.window.document.querySelector('.vanilla-modal');
      assert.ok(modal);
      modal.querySelector('.vanilla-modal__overlay').click();
      
      // Ensure zero modal elements remain
      const allModals = dom.window.document.querySelectorAll('.vanilla-modal');
      assert.strictEqual(allModals.length, 0, 'No modal elements should remain in the document body');
      
      dom.window.close();
    }
  },
  'TC-T2-F6-04': {
    name: 'Hoisting - Variable declared with var does not throw ReferenceError',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      
      // We check that accessing hoisting variables inside JSDOM doesn't crash the script run
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      const logs = dom.window.__capturedLogs;
      const hoistingLog = logs.find(log => log.includes('Hoisting Test:'));
      assert.ok(hoistingLog);
      
      dom.window.close();
    }
  },
  'TC-T2-F6-05': {
    name: 'XSS Prevention - textContent vs innerHTML check',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      
      // Override title to inject script and verify it is treated as plain text
      const xssTitle = '<img src=x onerror=alert(1)>';
      
      // Instantiate and check element text
      const modalObj = new dom.window.CustomModal(xssTitle);
      assert.strictEqual(modalObj.getTitle(), xssTitle);
      
      // Launch and check title element content
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      // Check title rendering
      const modal = dom.window.document.querySelector('.vanilla-modal');
      const titleEl = modal.querySelector('.vanilla-modal__title');
      
      assert.strictEqual(titleEl.textContent, xssTitle, 'Title element must use secure text assignments');
      assert.strictEqual(titleEl.innerHTML, '&lt;img src=x onerror=alert(1)&gt;', 'Characters must be HTML escaped');
      
      dom.window.close();
    }
  }
};
