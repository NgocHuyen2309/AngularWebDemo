const assert = require('assert');
const { waitForElement } = require('../../utils/dom-helper');
const { parseXml } = require('../../utils/xml-helper');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const SOAP_ENVELOPE = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://tempuri.org/">
   <soapenv:Body>
      <web:GetProjectInfoRequest/>
   </soapenv:Body>
</soapenv:Envelope>
`;

module.exports = {
  'TC-T3-01': {
    name: 'F1 x F4: User registration updates DOM layout cleanly within col-md-3 sidebar',
    run: async ({ agent, createJSDOMContext }) => {
      const dom = createJSDOMContext();
      
      const emailInput = dom.window.document.querySelector('.user-form__input-email');
      const dobInput = dom.window.document.querySelector('.user-form__input-dob');
      const form = dom.window.document.getElementById('regForm');
      
      emailInput.value = 't3-f1-f4@example.com';
      dobInput.value = '1990-05-05';
      
      // Submit form
      form.dispatchEvent(new dom.window.Event('submit'));
      await delay(100);
      
      // Verify success card is rendered
      const successCard = dom.window.document.querySelector('.user-form__success-card');
      assert.ok(successCard, 'Success card should exist');
      
      // Verify layout class col-md-3 is still present on parent sidebar
      const sidebar = successCard.closest('.col-md-3');
      assert.ok(sidebar, 'Success card must be nested inside col-md-3 sidebar');
      dom.window.close();
    }
  },
  'TC-T3-02': {
    name: 'F2 x F5: Catalog UI displays exactly the items retrieved from REST API',
    run: async ({ agent, createJSDOMContext }) => {
      // 1. Get items from API
      const apiRes = await agent.get('/api/catalog');
      assert.strictEqual(apiRes.statusCode, 200);
      const apiItems = apiRes.body;
      
      // 2. Load JSDOM UI
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // 3. Compare UI rendered items count and titles
      const uiItems = dom.window.document.querySelectorAll('.catalog__item');
      assert.strictEqual(uiItems.length, apiItems.length);
      
      const firstUiName = uiItems[0].querySelector('.catalog__item-name').textContent;
      const matchingApiItem = apiItems.find(item => item.name === firstUiName);
      assert.ok(matchingApiItem, 'Rendered item must match seeded API item');
      dom.window.close();
    }
  },
  'TC-T3-03': {
    name: 'F1 x F6: Vanilla Modal displays newly registered user details (data flow)',
    run: async ({ agent, createJSDOMContext }) => {
      const dom = createJSDOMContext();
      
      // Register user
      const emailInput = dom.window.document.querySelector('.user-form__input-email');
      const dobInput = dom.window.document.querySelector('.user-form__input-dob');
      const form = dom.window.document.getElementById('regForm');
      
      const testEmail = 't3-f1-f6@example.com';
      emailInput.value = testEmail;
      dobInput.value = '1985-10-10';
      form.dispatchEvent(new dom.window.Event('submit'));
      await delay(100);
      
      // Launch Vanilla Modal
      const modalBtn = dom.window.document.getElementById('launchModalBtn');
      modalBtn.click();
      
      // Verify modal text shows registered email
      const modalText = dom.window.document.querySelector('.vanilla-modal p');
      assert.ok(modalText);
      assert.ok(modalText.textContent.includes(testEmail), `Modal should mention registered email ${testEmail}`);
      dom.window.close();
    }
  },
  'TC-T3-04': {
    name: 'F3 x F2: SOAP status check correlates with REST catalog availability',
    run: async ({ agent }) => {
      // SOAP request
      const soapRes = await agent
        .post('/api/soap/info')
        .set('Content-Type', 'text/xml')
        .send(SOAP_ENVELOPE);
      assert.strictEqual(soapRes.statusCode, 200);
      
      const xml = parseXml(soapRes.text);
      const envelope = xml['soapenv:Envelope'] || xml['Envelope'];
      const body = envelope['soapenv:Body'] || envelope['Body'];
      const response = body['web:GetProjectInfoResponse'] || body['GetProjectInfoResponse'];
      const version = response['web:Version'] || response['Version'];
      assert.strictEqual(version, '1.0.0');
      
      // REST request
      const restRes = await agent.get('/api/catalog');
      assert.strictEqual(restRes.statusCode, 200);
      assert.ok(restRes.body.length >= 20);
    }
  },
  'TC-T3-05': {
    name: 'F4 x F5: Mobile resize layout adjusts catalog UI container cleanly',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // Simulate mobile resize
      dom.window.innerWidth = 480;
      dom.window.dispatchEvent(new dom.window.Event('resize'));
      
      const filterBtn = dom.window.document.querySelector('.catalog__filter-btn[data-category="Books"]');
      filterBtn.click();
      await delay(50);
      
      // Ensure layout holds BEM class styling and displays filtered items
      const catalog = dom.window.document.querySelector('.catalog');
      assert.ok(catalog);
      const items = dom.window.document.querySelectorAll('.catalog__item');
      for (const item of items) {
        assert.strictEqual(item.querySelector('.catalog__item-category').textContent, 'Books');
      }
      dom.window.close();
    }
  },
  'TC-T3-06': {
    name: 'F5 x F6: Catalog category filters remain active when Vanilla Showcase Modal launches',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      await waitForElement(dom, '.catalog__item');
      
      // 1. Select Home filter
      const homeBtn = dom.window.document.querySelector('.catalog__filter-btn[data-category="Home"]');
      homeBtn.click();
      await delay(50);
      
      // 2. Launch modal
      const modalBtn = dom.window.document.getElementById('launchModalBtn');
      modalBtn.click();
      
      // Verify modal is present
      const modal = dom.window.document.querySelector('.vanilla-modal');
      assert.ok(modal);
      
      // Verify background category filter is still active
      const activeFilter = dom.window.document.querySelector('.catalog__filter-btn--active');
      assert.strictEqual(activeFilter.getAttribute('data-category'), 'Home');
      
      // Verify background items are still filtered
      const items = dom.window.document.querySelectorAll('.catalog__item');
      for (const item of items) {
        assert.strictEqual(item.querySelector('.catalog__item-category').textContent, 'Home');
      }
      dom.window.close();
    }
  }
};
