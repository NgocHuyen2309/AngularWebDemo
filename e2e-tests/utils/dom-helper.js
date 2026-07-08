const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

function createJSDOMContext(backendUrl = 'http://localhost:3000') {
  const htmlPath = path.join(__dirname, '../../frontend/dist/browser/index.html');
  let htmlContent = '<html><body></body></html>';
  if (fs.existsSync(htmlPath)) {
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  }

  // Create JSDOM with scripting and resources enabled
  const dom = new JSDOM(htmlContent, {
    url: backendUrl,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });

  // Polyfills for browser APIs expected by modern frontend frameworks but missing in JSDOM
  dom.window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  dom.window.cancelAnimationFrame = (id) => clearTimeout(id);
  dom.window.matchMedia = dom.window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };
  dom.window.localStorage = dom.window.localStorage || {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
  };

  // Capture console logs for hoisting verification checks
  const consoleLogs = [];
  const originalLog = dom.window.console.log;
  dom.window.console.log = (...args) => {
    consoleLogs.push(args.join(' '));
    originalLog.apply(dom.window.console, args);
  };
  dom.window.__capturedLogs = consoleLogs;

  return dom;
}

function waitForElement(dom, selector, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const el = dom.window.document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new dom.window.MutationObserver(() => {
      const target = dom.window.document.querySelector(selector);
      if (target) {
        observer.disconnect();
        resolve(target);
      }
    });

    observer.observe(dom.window.document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

module.exports = {
  createJSDOMContext,
  waitForElement
};
