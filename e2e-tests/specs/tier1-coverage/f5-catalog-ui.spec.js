const assert = require('assert');
const { waitForElement } = require('../../utils/dom-helper');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  'TC-T1-F5-01': {
    name: 'Render Full Catalog List - 20+ items',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      const items = dom.window.document.querySelectorAll('.catalog__item');
      assert.ok(items.length >= 20, `Expected 20+ items, got ${items.length}`);
      dom.window.close();
    }
  },
  'TC-T1-F5-02': {
    name: 'Filter Catalog by Category - Electronics',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      const filterBtn = dom.window.document.querySelector('.catalog__filter-btn[data-category="Electronics"]');
      assert.ok(filterBtn, 'Electronics filter button should exist');
      
      filterBtn.click();
      await delay(50); // wait for rendering to update
      
      const items = dom.window.document.querySelectorAll('.catalog__item');
      assert.ok(items.length > 0 && items.length < 20);
      
      for (const item of items) {
        const cat = item.querySelector('.catalog__item-category').textContent;
        assert.strictEqual(cat, 'Electronics');
      }
      dom.window.close();
    }
  },
  'TC-T1-F5-03': {
    name: 'Sort Catalog by Price - Low to High (ascending)',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      const sortSelect = dom.window.document.querySelector('.catalog__sort-select');
      assert.ok(sortSelect, 'Sort select should exist');
      
      sortSelect.value = 'price-asc';
      sortSelect.dispatchEvent(new dom.window.Event('change'));
      await delay(50);
      
      const prices = Array.from(dom.window.document.querySelectorAll('.catalog__item-price'))
        .map(el => parseFloat(el.textContent.replace('$', '')));
      
      assert.ok(prices.length >= 20);
      for (let i = 0; i < prices.length - 1; i++) {
        assert.ok(prices[i] <= prices[i + 1], `Price at ${i} (${prices[i]}) should be <= Price at ${i+1} (${prices[i+1]})`);
      }
      dom.window.close();
    }
  },
  'TC-T1-F5-04': {
    name: 'Sort Catalog by Price - High to Low (descending)',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      const sortSelect = dom.window.document.querySelector('.catalog__sort-select');
      sortSelect.value = 'price-desc';
      sortSelect.dispatchEvent(new dom.window.Event('change'));
      await delay(50);
      
      const prices = Array.from(dom.window.document.querySelectorAll('.catalog__item-price'))
        .map(el => parseFloat(el.textContent.replace('$', '')));
      
      assert.ok(prices.length >= 20);
      for (let i = 0; i < prices.length - 1; i++) {
        assert.ok(prices[i] >= prices[i + 1], `Price at ${i} (${prices[i]}) should be >= Price at ${i+1} (${prices[i+1]})`);
      }
      dom.window.close();
    }
  },
  'TC-T1-F5-05': {
    name: 'Sort Catalog by Name - Alphabetical',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      const sortSelect = dom.window.document.querySelector('.catalog__sort-select');
      sortSelect.value = 'name';
      sortSelect.dispatchEvent(new dom.window.Event('change'));
      await delay(50);
      
      const names = Array.from(dom.window.document.querySelectorAll('.catalog__item-name'))
        .map(el => el.textContent.trim());
      
      assert.ok(names.length >= 20);
      for (let i = 0; i < names.length - 1; i++) {
        assert.ok(names[i].localeCompare(names[i + 1]) <= 0, `Name at ${i} (${names[i]}) should be alphabetically before Name at ${i+1} (${names[i+1]})`);
      }
      dom.window.close();
    }
  }
};
