const assert = require('assert');
const { waitForElement } = require('../../utils/dom-helper');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  'TC-T2-F5-01': {
    name: 'Filter Catalog - Category with zero items displays fallback message',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // Inject category that does not exist in seed data
      dom.window.currentCategory = 'Automotive';
      dom.window.renderCatalog();
      
      const emptyMsg = dom.window.document.querySelector('.catalog__empty-message');
      assert.ok(emptyMsg, 'Fallback element should be rendered');
      assert.strictEqual(emptyMsg.textContent, 'No items found');
      dom.window.close();
    }
  },
  'TC-T2-F5-02': {
    name: 'Sort Stable Order - Items with identical prices',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // Inject items with same price
      dom.window.allCatalogItems = [
        { id: 101, name: 'Item B', category: 'Electronics', price: 50.00, description: 'Test', imageUrl: '' },
        { id: 102, name: 'Item A', category: 'Electronics', price: 50.00, description: 'Test', imageUrl: '' }
      ];
      
      dom.window.currentSort = 'price-asc';
      dom.window.renderCatalog();
      
      // By alphabetical fallback or stable insertion
      const names = Array.from(dom.window.document.querySelectorAll('.catalog__item-name'))
        .map(el => el.textContent);
      
      assert.deepStrictEqual(names, ['Item A', 'Item B']);
      dom.window.close();
    }
  },
  'TC-T2-F5-03': {
    name: 'Rapid Clicking Filters - No race conditions',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      const btnElectronics = dom.window.document.querySelector('.catalog__filter-btn[data-category="Electronics"]');
      const btnHome = dom.window.document.querySelector('.catalog__filter-btn[data-category="Home"]');
      
      // Simulate rapid toggling
      btnElectronics.click();
      btnHome.click();
      btnElectronics.click();
      
      await delay(50);
      
      // The final state should be Electronics
      assert.strictEqual(dom.window.currentCategory, 'Electronics');
      const items = dom.window.document.querySelectorAll('.catalog__item');
      for (const item of items) {
        assert.strictEqual(item.querySelector('.catalog__item-category').textContent, 'Electronics');
      }
      dom.window.close();
    }
  },
  'TC-T2-F5-04': {
    name: 'Filter Escape Validation - Special characters do not break UI',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // Inject malicious category name
      const xssCategory = '<script>alert("XSS")</script>';
      dom.window.allCatalogItems.push({
        id: 999,
        name: 'Safe Item',
        category: xssCategory,
        price: 1.00,
        description: 'Safe',
        imageUrl: ''
      });
      
      dom.window.currentCategory = xssCategory;
      dom.window.renderCatalog();
      
      const categoryEl = dom.window.document.querySelector('.catalog__item-category');
      assert.strictEqual(categoryEl.textContent, xssCategory, 'Text content should contain raw script text safely escaped');
      
      dom.window.close();
    }
  },
  'TC-T2-F5-05': {
    name: 'Empty Catalog State - Fallback layout displays cleanly',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      dom.window.allCatalogItems = [];
      dom.window.renderCatalog();
      
      const emptyContainer = dom.window.document.querySelector('.catalog__empty');
      assert.ok(emptyContainer, 'Empty catalog fallback layout should display');
      assert.strictEqual(emptyContainer.textContent, 'Empty catalog');
      dom.window.close();
    }
  }
};
