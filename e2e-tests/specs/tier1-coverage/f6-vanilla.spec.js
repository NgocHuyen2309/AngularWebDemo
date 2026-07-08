const assert = require('assert');

module.exports = {
  'TC-T1-F6-01': {
    name: 'Showcase Component Mounts & Prints Hoisting Logs',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const btn = dom.window.document.getElementById('launchModalBtn');
      assert.ok(btn, 'Launch modal button should exist');
      
      btn.click();
      
      // Check console logs for hoisting verification
      const logs = dom.window.__capturedLogs;
      const hoistingLog = logs.find(log => log.includes('Hoisting Test:'));
      assert.ok(hoistingLog, 'Hoisting log should be printed');
      assert.ok(hoistingLog.includes('variable is undefined? true'), 'Log should confirm variable hoisting');
      assert.ok(hoistingLog.includes('Function can be called before declaration? true'), 'Log should confirm function hoisting');
      
      dom.window.close();
    }
  },
  'TC-T1-F6-02': {
    name: 'Dynamic Element Generation Creates Nodes via createElement',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      const modal = dom.window.document.querySelector('.vanilla-modal');
      assert.ok(modal, 'Modal element should exist');
      assert.ok(modal.querySelector('.vanilla-modal__content'), 'Modal content element should exist');
      assert.ok(modal.querySelector('.vanilla-modal__close-btn'), 'Modal close button should exist');
      
      dom.window.close();
    }
  },
  'TC-T1-F6-03': {
    name: 'Modal Click Outside Bubbles to Container to Close',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      const modal = dom.window.document.querySelector('.vanilla-modal');
      assert.ok(modal);
      
      const overlay = modal.querySelector('.vanilla-modal__overlay');
      assert.ok(overlay, 'Overlay should exist');
      
      overlay.click();
      
      const modalAfterClick = dom.window.document.querySelector('.vanilla-modal');
      assert.strictEqual(modalAfterClick, null, 'Modal should be removed from DOM after clicking overlay');
      
      dom.window.close();
    }
  },
  'TC-T1-F6-04': {
    name: 'Close Button Invokes stopPropagation',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const btn = dom.window.document.getElementById('launchModalBtn');
      btn.click();
      
      const modal = dom.window.document.querySelector('.vanilla-modal');
      const closeBtn = modal.querySelector('.vanilla-modal__close-btn');
      
      // Wire a click listener on the parent modal element to check bubbling
      let parentClicked = false;
      modal.addEventListener('click', () => {
        parentClicked = true;
      });
      
      closeBtn.click();
      
      assert.strictEqual(parentClicked, false, 'Click event should not bubble to parent modal element');
      const modalAfterClick = dom.window.document.querySelector('.vanilla-modal');
      assert.strictEqual(modalAfterClick, null, 'Modal should be removed from DOM');
      
      dom.window.close();
    }
  },
  'TC-T1-F6-05': {
    name: 'Prototype-based Class Instantiation & Constructor Link Integrity',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      
      // Access CustomModal constructor defined in index.html global scope
      const CustomModal = dom.window.CustomModal;
      assert.strictEqual(typeof CustomModal, 'function', 'CustomModal constructor should be defined');
      
      const instance = new CustomModal('Test Title');
      assert.strictEqual(instance.getTitle(), 'Test Title', 'Method getTitle should return instance title via prototype');
      assert.strictEqual(instance.constructor, CustomModal, 'Constructor link integrity should hold');
      
      dom.window.close();
    }
  }
};
