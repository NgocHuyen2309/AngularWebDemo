const assert = require('assert');

module.exports = {
  'TC-T1-F4-01': {
    name: 'Navbar Element Renders Layout Shell',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const navbar = dom.window.document.querySelector('.navbar');
      assert.ok(navbar, 'Navbar element should exist');
      dom.window.close();
    }
  },
  'TC-T1-F4-02': {
    name: 'Bootstrap Grid Container & Row Elements Present',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const container = dom.window.document.querySelector('.container');
      const row = dom.window.document.querySelector('.row');
      assert.ok(container, 'Container element should exist');
      assert.ok(row, 'Row element should exist');
      dom.window.close();
    }
  },
  'TC-T1-F4-03': {
    name: 'BEM Block Classes Present on Layouts',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const navbar = dom.window.document.querySelector('.navbar');
      const catalog = dom.window.document.querySelector('.catalog');
      const userForm = dom.window.document.querySelector('.user-form');
      
      assert.ok(navbar, 'Navbar block should exist');
      assert.ok(catalog, 'Catalog block should exist');
      assert.ok(userForm, 'User-form block should exist');
      dom.window.close();
    }
  },
  'TC-T1-F4-04': {
    name: 'Less Compiled Custom Layout Styling Applies Rules',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const style = dom.window.document.querySelector('style');
      assert.ok(style, 'Style sheet tag should exist');
      assert.ok(style.textContent.includes('display: flex') || style.textContent.includes('grid'), 'Styles should apply flex/grid layouts');
      dom.window.close();
    }
  },
  'TC-T1-F4-05': {
    name: 'Sidebar and Main Columns Sum to 12',
    run: async ({ createJSDOMContext }) => {
      const dom = createJSDOMContext();
      const col3 = dom.window.document.querySelector('.col-md-3');
      const col9 = dom.window.document.querySelector('.col-md-9');
      
      assert.ok(col3, 'Sidebar col-md-3 should exist');
      assert.ok(col9, 'Main content col-md-9 should exist');
      
      // Verify sums
      const classes = [col3.className, col9.className];
      const numbers = classes.map(c => {
        const match = c.match(/col-md-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const sum = numbers.reduce((a, b) => a + b, 0);
      assert.strictEqual(sum, 12, 'Columns must sum to 12');
      dom.window.close();
    }
  }
};
