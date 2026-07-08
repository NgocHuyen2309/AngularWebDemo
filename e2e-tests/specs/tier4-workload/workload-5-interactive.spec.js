const assert = require('assert');
const { waitForElement } = require('../../utils/dom-helper');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  'TC-T4-05': {
    name: 'Workload 5: Interactive Catalog filter and Vanilla modal event handling workflow',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // 1. Perform category filter switching
      const booksBtn = dom.window.document.querySelector('.catalog__filter-btn[data-category="Books"]');
      booksBtn.click();
      await delay(50);
      
      const filteredItems = dom.window.document.querySelectorAll('.catalog__item');
      for (const item of filteredItems) {
        assert.strictEqual(item.querySelector('.catalog__item-category').textContent, 'Books');
      }
      
      // 2. Launch Vanilla JS modal
      const modalBtn = dom.window.document.getElementById('launchModalBtn');
      modalBtn.click();
      
      // Verify modal mounted
      const modal = dom.window.document.querySelector('.vanilla-modal');
      assert.ok(modal, 'Modal should exist in DOM');
      
      // Verify title is rendered correctly using prototype class
      const title = modal.querySelector('.vanilla-modal__title').textContent;
      assert.strictEqual(title, 'Vanilla Showcase Modal');
      
      // 3. Test stopPropagation on close button click
      const closeBtn = modal.querySelector('.vanilla-modal__close-btn');
      let parentOverlayClicked = false;
      modal.addEventListener('click', () => {
        parentOverlayClicked = true;
      });
      
      closeBtn.click();
      
      // Verify modal is closed and parent overlay click was NOT triggered (propagation stopped)
      assert.strictEqual(parentOverlayClicked, false, 'Event propagation should be stopped');
      assert.strictEqual(dom.window.document.querySelector('.vanilla-modal'), null, 'Modal should be removed from DOM');
      
      dom.window.close();
    }
  }
};
