const assert = require('assert');
const { waitForElement } = require('../../utils/dom-helper');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  'TC-T4-01': {
    name: 'Workload 1: New User Registration and Catalog Browsing integration flow',
    run: async ({ agent, createJSDOMContext }) => {
      const email = 't4-w1@example.com';
      const dob = '1995-05-15';
      
      // 1. Register a new user profile via POST /api/users
      const postRes = await agent
        .post('/api/users')
        .send({ email, date_of_birth: dob });
      assert.strictEqual(postRes.statusCode, 201);
      const userId = postRes.body.id;
      
      // 2. Retrieve profile via GET /api/users/:id to check correctness
      const getRes = await agent.get(`/api/users/${userId}`);
      assert.strictEqual(getRes.statusCode, 200);
      assert.strictEqual(getRes.body.email, email);
      
      // 3. Load frontend catalog in JSDOM, click "Electronics" filter, sort price ascending, verify rendering
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // Filter Electronics
      const elecBtn = dom.window.document.querySelector('.catalog__filter-btn[data-category="Electronics"]');
      elecBtn.click();
      await delay(50);
      
      // Sort price ascending
      const sortSelect = dom.window.document.querySelector('.catalog__sort-select');
      sortSelect.value = 'price-asc';
      sortSelect.dispatchEvent(new dom.window.Event('change'));
      await delay(50);
      
      // Verify items
      const items = dom.window.document.querySelectorAll('.catalog__item');
      assert.ok(items.length > 0);
      
      const prices = [];
      for (const item of items) {
        assert.strictEqual(item.querySelector('.catalog__item-category').textContent, 'Electronics');
        prices.push(parseFloat(item.querySelector('.catalog__item-price').textContent.replace('$', '')));
      }
      
      for (let i = 0; i < prices.length - 1; i++) {
        assert.ok(prices[i] <= prices[i + 1], 'Prices must be sorted ascending');
      }
      
      dom.window.close();
    }
  }
};
