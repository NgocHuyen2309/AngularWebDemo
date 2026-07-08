// ============================================================================
// FILE: vanilla-showcase.js
// ============================================================================
// PURPOSE:
//   This is a comprehensive, self-contained ES6 module that demonstrates
//   five core Vanilla JavaScript concepts required by the Web Development
//   Training Plan. Every section is heavily commented for mentor review.
//
// CONCEPTS COVERED:
//   1. ES6 Modular JavaScript (export / import)
//   2. Hoisting (var, let/const, function declarations)
//   3. Prototype-based Inheritance (constructor functions, Object.create)
//   4. Pure DOM Tree Manipulation (document.createElement, BEM naming)
//   5. Event Bubbling & stopPropagation
//
// USAGE:
//   import { initVanillaShowcase } from './vanilla-showcase.js';
//   initVanillaShowcase('#my-container');
//
// NOTE ON ES6 MODULES:
//   This file uses ES6 `export` syntax. When consumed by Angular's build
//   pipeline (Webpack/esbuild), these exports are tree-shakeable. Each
//   exported function can also be imported individually for unit testing.
// ============================================================================


// ============================================================================
// CONCEPT 1: ES6 MODULAR JAVASCRIPT
// ============================================================================
// ES6 modules use `export` and `import` to share code between files.
//
// KEY POINTS:
//   - `export` makes a binding available to other modules.
//   - `export default` provides a single default export per module.
//   - Named exports allow selective importing: import { fn } from './mod.js'
//   - Modules execute in strict mode by default.
//   - Modules are singletons — they execute once and cache the result.
//
// In this file, every function and class is a named export so consumers
// can cherry-pick exactly what they need:
//
//   import { demonstrateHoisting, UIComponent } from './vanilla-showcase.js';
//
// The main integration function `initVanillaShowcase` is ALSO a named export
// and serves as the primary entry point for the Angular wrapper component.
// ============================================================================


// ============================================================================
// CONCEPT 2: HOISTING DEMONSTRATION
// ============================================================================
// "Hoisting" is JavaScript's behavior of moving declarations to the top of
// their scope during the compilation phase — BEFORE any code executes.
//
// CRITICAL DISTINCTIONS:
//   • `var` declarations are hoisted AND initialized to `undefined`.
//   • `function` declarations are hoisted WITH their full body (fully usable).
//   • `let` and `const` are hoisted but NOT initialized — accessing them
//     before their declaration throws a ReferenceError. This zone between
//     the start of the scope and the declaration is the "Temporal Dead Zone"
//     (TDZ).
//
// WHY IT MATTERS:
//   Understanding hoisting prevents subtle bugs where variables appear to
//   have unexpected values (`undefined` instead of the assigned value) or
//   where function calls seem to work "before" the function is written.
// ============================================================================

/**
 * demonstrateHoisting()
 *
 * Runs three hoisting experiments and returns an array of result strings
 * that describe what happened. This function is pure (no DOM side effects)
 * so it can be unit-tested independently.
 *
 * @export
 * @returns {string[]} Array of human-readable result descriptions.
 */
export function demonstrateHoisting() {
  const results = [];

  // ─── Experiment 1: `var` hoisting ───────────────────────────────────
  // The variable `hoistedVar` is declared with `var` on line ~88, but we
  // access it HERE, before that declaration. JavaScript's compiler hoists
  // the declaration `var hoistedVar;` to the top of this function scope,
  // so reading it does NOT throw an error — it simply returns `undefined`.
  //
  // Conceptually, the engine rewrites this as:
  //   var hoistedVar;           // ← hoisted declaration (value: undefined)
  //   ... code that reads hoistedVar ...
  //   hoistedVar = 'I exist!';  // ← assignment stays in place
  // ────────────────────────────────────────────────────────────────────

  // Reading `hoistedVar` BEFORE its var declaration — value is `undefined`
  results.push(
    `[var hoisting] Value before declaration: ${typeof hoistedVar === 'undefined' ? 'undefined ✓' : hoistedVar}`
  );

  // This is where the actual `var` declaration + assignment lives.
  // Only the declaration is hoisted; the assignment stays here.
  var hoistedVar = 'I exist!'; // eslint-disable-line no-var

  results.push(
    `[var hoisting] Value after declaration: ${hoistedVar}`
  );

  // ─── Experiment 2: Function declaration hoisting ────────────────────
  // Unlike `var`, function DECLARATIONS are hoisted with their entire
  // body. This means you can call a function before its declaration in
  // source order, and it works perfectly.
  //
  // NOTE: This only applies to function DECLARATIONS, not function
  // EXPRESSIONS (e.g., `const fn = function() {}` or arrow functions).
  // ────────────────────────────────────────────────────────────────────

  // Calling `hoistedFunction()` BEFORE its declaration — works because
  // the entire function body is hoisted to the top of this scope.
  const fnResult = hoistedFunction();
  results.push(
    `[function hoisting] Called before declaration: "${fnResult}" ✓`
  );

  // The function declaration itself. Even though it appears after the
  // call above, JavaScript has already hoisted the full definition.
  function hoistedFunction() {
    return 'I was hoisted with my full body!';
  }

  // ─── Experiment 3: `let` / `const` — Temporal Dead Zone (TDZ) ──────
  // Variables declared with `let` or `const` ARE hoisted (the engine
  // knows they exist in this scope), but they are NOT initialized.
  // Accessing them before their declaration throws a ReferenceError.
  //
  // The period between entering the scope and reaching the declaration
  // is called the "Temporal Dead Zone" (TDZ).
  //
  // We wrap this in a try/catch to capture the error without crashing.
  // ────────────────────────────────────────────────────────────────────

  try {
    // We use `eval` here to prevent static analysis tools from flagging
    // the reference as a compile-time error. In real code, you would
    // simply see the ReferenceError at runtime.
    //
    // Attempting to access `tdzVariable` before its `let` declaration:
    const beforeDeclaration = eval('typeof tdzVariable_no_exist'); // eslint-disable-line no-eval
    results.push(
      `[let/const TDZ] typeof undeclared variable: "${beforeDeclaration}" (typeof is safe)`
    );
  } catch (e) {
    results.push(
      `[let/const TDZ] Caught ReferenceError: ${e.message} ✓`
    );
  }

  // Now we actually declare a `let` variable. After this point, it is
  // fully initialized and accessible.
  let tdzDemo = 'Now I am initialized!'; // eslint-disable-line prefer-const
  results.push(
    `[let/const TDZ] Value after declaration: "${tdzDemo}" ✓`
  );

  // SUMMARY OF HOISTING RULES:
  // ┌────────────────┬──────────┬─────────────────────────────────────┐
  // │ Declaration    │ Hoisted? │ Initialized?                        │
  // ├────────────────┼──────────┼─────────────────────────────────────┤
  // │ var            │ Yes      │ Yes (to undefined)                  │
  // │ let            │ Yes      │ No (TDZ until declaration)          │
  // │ const          │ Yes      │ No (TDZ until declaration)          │
  // │ function decl  │ Yes      │ Yes (with full function body)       │
  // │ function expr  │ Partial  │ Only the var/let/const is hoisted   │
  // │ class          │ Yes      │ No (TDZ, like let/const)            │
  // └────────────────┴──────────┴─────────────────────────────────────┘

  return results;
}


// ============================================================================
// CONCEPT 3: PROTOTYPE-BASED INHERITANCE
// ============================================================================
// JavaScript uses PROTOTYPES instead of classical classes for inheritance.
// Every object has an internal [[Prototype]] link to another object. When
// you access a property that doesn't exist on the object itself, the engine
// walks UP the prototype chain looking for it.
//
// HOW IT WORKS:
//   1. Define a constructor function (e.g., `UIComponent`).
//   2. Add shared methods to `UIComponent.prototype`.
//   3. Define a child constructor (e.g., `Modal`).
//   4. Set `Modal.prototype = Object.create(UIComponent.prototype)` to
//      establish the chain: Modal instances → Modal.prototype → UIComponent.prototype.
//   5. Reset `Modal.prototype.constructor = Modal` so `instanceof` and
//      `.constructor` work correctly.
//
// WHY NOT ES6 CLASSES?
//   ES6 `class` syntax is syntactic sugar over prototypes. Understanding
//   the raw prototype mechanism is essential because:
//   - You'll encounter it in legacy codebases and library internals.
//   - It reveals how `this`, `new`, and `instanceof` truly work.
//   - It explains behaviors that confuse developers using only `class`.
//
// PROTOTYPE CHAIN VISUALIZATION:
//
//   modalInstance
//       │
//       └──▶ Modal.prototype        (has: open, close)
//               │
//               └──▶ UIComponent.prototype  (has: render, destroy)
//                       │
//                       └──▶ Object.prototype     (has: toString, hasOwnProperty)
//                               │
//                               └──▶ null
// ============================================================================

/**
 * UIComponent — Base constructor function.
 *
 * All UI components share a `tagName` (the HTML element they render into)
 * and a `cssClass` (the BEM block class). These properties are set per
 * instance via the constructor.
 *
 * @export
 * @constructor
 * @param {string} tagName  - The HTML tag for this component (e.g., 'div').
 * @param {string} cssClass - The BEM block class (e.g., 'modal').
 */
export function UIComponent(tagName, cssClass) {
  // `this` refers to the newly created object when called with `new`.
  // These are INSTANCE properties — each instance gets its own copy.
  this.tagName = tagName || 'div';
  this.cssClass = cssClass || 'ui-component';
  this.element = null; // Will hold the created DOM element after render()
}

// ─── Adding methods to UIComponent.prototype ─────────────────────────
// Methods on the prototype are SHARED across all instances. They are not
// duplicated per instance — every UIComponent instance has a [[Prototype]]
// link that points to this same prototype object. This is memory-efficient.
// ──────────────────────────────────────────────────────────────────────

/**
 * render() — Creates the root DOM element for this component.
 * Defined on UIComponent.prototype so ALL UIComponent instances (and all
 * derived types like Modal) can call it via the prototype chain.
 *
 * @returns {HTMLElement} The created DOM element.
 */
UIComponent.prototype.render = function () {
  this.element = document.createElement(this.tagName);
  this.element.classList.add(this.cssClass);
  return this.element;
};

/**
 * destroy() — Removes the component's element from the DOM.
 * Also defined on UIComponent.prototype for inheritance by children.
 */
UIComponent.prototype.destroy = function () {
  if (this.element && this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
  }
};

/**
 * getInfo() — Returns a description string identifying the component.
 * Useful for debugging and for demonstrating prototype method resolution.
 *
 * @returns {string} Component info string.
 */
UIComponent.prototype.getInfo = function () {
  return `[UIComponent] tag=<${this.tagName}> class="${this.cssClass}"`;
};


/**
 * Modal — Derived constructor function that extends UIComponent.
 *
 * A Modal is a UIComponent that also has a `title` property and specialized
 * open/close behavior.
 *
 * @export
 * @constructor
 * @param {string} title - The modal dialog's title text.
 */
export function Modal(title) {
  // ─── Step 1: Call the parent constructor ──────────────────────────
  // `UIComponent.call(this, ...)` invokes the parent constructor with
  // `this` bound to the new Modal instance. This sets up the inherited
  // instance properties (tagName, cssClass, element) on the Modal.
  //
  // This is equivalent to `super('div', 'modal')` in ES6 class syntax.
  // ──────────────────────────────────────────────────────────────────
  UIComponent.call(this, 'div', 'modal');

  // Instance-specific property — only Modal instances have this.
  this.title = title || 'Untitled Modal';
  this.isOpen = false;
}

// ─── Step 2: Set up the prototype chain ──────────────────────────────
// `Object.create(UIComponent.prototype)` creates a NEW object whose
// [[Prototype]] is UIComponent.prototype. We assign this as Modal's
// prototype, establishing the chain:
//
//   new Modal() → Modal.prototype → UIComponent.prototype → Object.prototype
//
// WITHOUT this line, Modal.prototype would just be a plain object that
// does NOT link to UIComponent.prototype, and inherited methods like
// render() and destroy() would be unavailable.
// ──────────────────────────────────────────────────────────────────────
Modal.prototype = Object.create(UIComponent.prototype);

// ─── Step 3: Fix the constructor reference ───────────────────────────
// After `Object.create()`, Modal.prototype.constructor incorrectly points
// to UIComponent. We reset it so that:
//   - `new Modal().constructor === Modal` (true)
//   - Debugging tools show the correct constructor name
// ──────────────────────────────────────────────────────────────────────
Modal.prototype.constructor = Modal;

/**
 * open() — Opens the modal by adding a visibility class.
 * This method exists ONLY on Modal.prototype, not on UIComponent.prototype.
 * If you call `uiComponentInstance.open()`, it will throw a TypeError
 * because the method doesn't exist in UIComponent's prototype chain.
 */
Modal.prototype.open = function () {
  this.isOpen = true;
  if (this.element) {
    this.element.classList.add('modal--open');
    this.element.setAttribute('aria-hidden', 'false');
  }
};

/**
 * close() — Closes the modal by removing the visibility class.
 */
Modal.prototype.close = function () {
  this.isOpen = false;
  if (this.element) {
    this.element.classList.remove('modal--open');
    this.element.setAttribute('aria-hidden', 'true');
  }
};

/**
 * getInfo() — Overrides UIComponent.prototype.getInfo().
 *
 * When you call `modalInstance.getInfo()`, the engine first looks at the
 * Modal instance itself (no `getInfo` there), then at Modal.prototype
 * (found HERE), so it stops. The UIComponent.prototype.getInfo is
 * "shadowed" — it still exists but won't be reached unless called
 * explicitly via `UIComponent.prototype.getInfo.call(this)`.
 *
 * @returns {string} Modal-specific info string.
 */
Modal.prototype.getInfo = function () {
  // Calling the parent's getInfo explicitly (equivalent to super.getInfo())
  const parentInfo = UIComponent.prototype.getInfo.call(this);
  return `${parentInfo} → [Modal] title="${this.title}" open=${this.isOpen}`;
};

/**
 * demonstratePrototypeChain()
 *
 * Creates instances of UIComponent and Modal, then runs a series of
 * checks to prove the prototype chain is working correctly.
 *
 * @export
 * @returns {string[]} Array of result descriptions.
 */
export function demonstratePrototypeChain() {
  const results = [];

  // Create instances
  const baseComponent = new UIComponent('span', 'badge');
  const modal = new Modal('Prototype Demo');

  // ─── instanceof checks ─────────────────────────────────────────────
  // `instanceof` walks the prototype chain of the left operand and checks
  // if the `.prototype` of the right operand appears anywhere in it.
  //
  //   modal → Modal.prototype → UIComponent.prototype → Object.prototype
  //
  // So: modal instanceof Modal          → true (Modal.prototype is in chain)
  //     modal instanceof UIComponent    → true (UIComponent.prototype is in chain)
  //     baseComponent instanceof Modal  → false (Modal.prototype is NOT in its chain)
  // ────────────────────────────────────────────────────────────────────
  results.push(
    `modal instanceof Modal: ${modal instanceof Modal} ✓`
  );
  results.push(
    `modal instanceof UIComponent: ${modal instanceof UIComponent} ✓`
  );
  results.push(
    `baseComponent instanceof Modal: ${baseComponent instanceof Modal} (expected false) ✓`
  );

  // ─── Method resolution via prototype chain ─────────────────────────
  results.push(
    `baseComponent.getInfo(): ${baseComponent.getInfo()}`
  );
  results.push(
    `modal.getInfo(): ${modal.getInfo()}`
  );

  // ─── Shared prototype verification ─────────────────────────────────
  // Both `modal.render` and `modal.destroy` are inherited from
  // UIComponent.prototype through the chain, NOT copied onto Modal.
  results.push(
    `modal.render === UIComponent.prototype.render: ${modal.render === UIComponent.prototype.render} ✓`
  );
  results.push(
    `modal.destroy === UIComponent.prototype.destroy: ${modal.destroy === UIComponent.prototype.destroy} ✓`
  );

  // ─── constructor property ──────────────────────────────────────────
  results.push(
    `modal.constructor === Modal: ${modal.constructor === Modal} ✓`
  );
  results.push(
    `modal.constructor === UIComponent: ${modal.constructor === UIComponent} (expected false) ✓`
  );

  return results;
}


// ============================================================================
// CONCEPT 4: PURE DOM TREE MANIPULATION
// ============================================================================
// Angular normally manages the DOM through its template engine and change
// detection. However, understanding raw DOM manipulation is foundational.
//
// This section builds a complete modal dialog using ONLY:
//   - document.createElement(tagName)
//   - element.appendChild(child)
//   - element.classList.add(className)
//   - element.textContent / element.setAttribute
//
// NO innerHTML, NO jQuery, NO framework abstractions.
//
// BEM NAMING CONVENTION:
//   Block:    .modal
//   Elements: .modal__overlay, .modal__content, .modal__title, etc.
//   Modifier: .modal--open, .modal__button--close
//
// DOM TREE STRUCTURE BUILT:
//
//   <div class="modal modal--open">              ← Root (overlay + container)
//     <div class="modal__overlay">                ← Semi-transparent backdrop
//       <div class="modal__content">              ← White content box
//         <h2 class="modal__title">...</h2>       ← Title bar
//         <div class="modal__body">               ← Body text area
//           <p class="modal__text">...</p>
//         </div>
//         <div class="modal__footer">             ← Action buttons
//           <button class="modal__button
//                   modal__button--close">Close</button>
//         </div>
//       </div>
//     </div>
//   </div>
// ============================================================================

/**
 * buildModalDOM(title, bodyText)
 *
 * Constructs a complete modal dialog DOM tree from scratch using only
 * native DOM APIs. Returns the root element ready to be appended to
 * any container.
 *
 * @export
 * @param {string} title    - The modal's heading text.
 * @param {string} bodyText - The modal's body paragraph text.
 * @returns {HTMLElement}   - The root modal <div> element.
 */
export function buildModalDOM(title, bodyText) {
  // ─── 1. Create the root container ──────────────────────────────────
  // This is the outermost element. It acts as the modal's positioning
  // context and receives the BEM block class "modal".
  const root = document.createElement('div');
  root.classList.add('modal');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'modal-title');

  // ─── 2. Create the overlay (backdrop) ──────────────────────────────
  // A full-screen semi-transparent layer behind the content box.
  // Clicking the overlay will close the modal (set up in event section).
  const overlay = document.createElement('div');
  overlay.classList.add('modal__overlay');

  // ─── 3. Create the content container ───────────────────────────────
  // The white box that holds the title, body, and footer.
  const content = document.createElement('div');
  content.classList.add('modal__content');

  // ─── 4. Create the title element ───────────────────────────────────
  const titleEl = document.createElement('h2');
  titleEl.classList.add('modal__title');
  titleEl.setAttribute('id', 'modal-title');
  titleEl.textContent = title || 'Modal Title';

  // ─── 5. Create the body section ────────────────────────────────────
  const body = document.createElement('div');
  body.classList.add('modal__body');

  const paragraph = document.createElement('p');
  paragraph.classList.add('modal__text');
  paragraph.textContent = bodyText || 'Modal body content goes here.';

  // Append paragraph into body
  body.appendChild(paragraph);

  // ─── 6. Create the footer with a close button ─────────────────────
  const footer = document.createElement('div');
  footer.classList.add('modal__footer');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('modal__button');
  closeBtn.classList.add('modal__button--close');
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Close modal');
  closeBtn.textContent = 'Close';

  footer.appendChild(closeBtn);

  // ─── 7. Assemble the tree ──────────────────────────────────────────
  // Build bottom-up: add children to their parents, then parents to root.
  //
  //   content
  //     ├── titleEl
  //     ├── body
  //     │    └── paragraph
  //     └── footer
  //          └── closeBtn
  //
  //   overlay
  //     └── content
  //
  //   root
  //     └── overlay
  //
  content.appendChild(titleEl);
  content.appendChild(body);
  content.appendChild(footer);
  overlay.appendChild(content);
  root.appendChild(overlay);

  return root;
}


// ============================================================================
// CONCEPT 5: EVENT BUBBLING AND stopPropagation
// ============================================================================
// When an event fires on a DOM element, it doesn't just stay there. The
// event propagates through the DOM tree in three phases:
//
//   1. CAPTURING PHASE  — The event travels DOWN from `window` → target.
//   2. TARGET PHASE     — The event reaches the element that was clicked.
//   3. BUBBLING PHASE   — The event travels UP from target → `window`.
//
// By default, event listeners fire during the BUBBLING phase. This means
// a click on a child element will also trigger click handlers on all its
// ancestor elements, in order from nearest to farthest.
//
// EXAMPLE:
//   <div id="parent">          ← has click listener
//     <button id="child">      ← has click listener
//       Click Me
//     </button>
//   </div>
//
//   Clicking the button fires:
//     1. button's click handler (target phase)
//     2. div's click handler (bubbling phase)
//
// stopPropagation():
//   Calling event.stopPropagation() in the child's handler PREVENTS the
//   event from continuing to bubble up. The parent's handler will NOT fire.
//
// WHY IT MATTERS:
//   - Event delegation: attach ONE listener to a parent to handle clicks
//     on many children (efficient for dynamic lists).
//   - Preventing unintended side effects: stop a modal's close handler
//     from firing when clicking INSIDE the modal content.
// ============================================================================

/**
 * setupEventBubbling(containerEl, logCallback)
 *
 * Creates a parent-child DOM structure and attaches event listeners to
 * demonstrate bubbling and stopPropagation. All event activity is reported
 * via the `logCallback` function.
 *
 * @export
 * @param {HTMLElement} containerEl  - The container to append the demo into.
 * @param {function}    logCallback  - Called with (message: string) for each event.
 * @returns {{ parentEl: HTMLElement, childEl: HTMLElement, toggleBtn: HTMLElement }}
 */
export function setupEventBubbling(containerEl, logCallback) {
  const log = typeof logCallback === 'function' ? logCallback : console.log;

  // ─── Create the parent element ─────────────────────────────────────
  const parentEl = document.createElement('div');
  parentEl.classList.add('bubble-demo');
  parentEl.classList.add('bubble-demo__parent');
  parentEl.style.cssText =
    'padding: 24px; border: 3px solid #1565c0; border-radius: 8px; ' +
    'margin: 12px 0; background: #e3f2fd; cursor: pointer;';

  const parentLabel = document.createElement('span');
  parentLabel.textContent = '📦 Parent Container (click me — events bubble here)';
  parentLabel.style.cssText = 'font-weight: bold; display: block; margin-bottom: 12px;';
  parentEl.appendChild(parentLabel);

  // ─── Create the child button ───────────────────────────────────────
  const childEl = document.createElement('button');
  childEl.classList.add('bubble-demo__child');
  childEl.textContent = '🖱️ Child Button — Click Me!';
  childEl.style.cssText =
    'padding: 10px 20px; font-size: 14px; cursor: pointer; ' +
    'background: #fff; border: 2px solid #2e7d32; border-radius: 4px;';
  parentEl.appendChild(childEl);

  // ─── Create the stopPropagation toggle button ──────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.classList.add('bubble-demo__toggle');
  toggleBtn.textContent = '🛑 Toggle stopPropagation (currently: OFF)';
  toggleBtn.style.cssText =
    'display: block; margin-top: 12px; padding: 8px 16px; ' +
    'font-size: 13px; cursor: pointer; background: #ffebee; ' +
    'border: 2px solid #c62828; border-radius: 4px;';

  // State flag: when true, child's handler will call stopPropagation()
  let stopPropagationEnabled = false;

  toggleBtn.addEventListener('click', (e) => {
    // Stop this toggle click from bubbling to the parent demo
    e.stopPropagation();

    stopPropagationEnabled = !stopPropagationEnabled;
    toggleBtn.textContent = stopPropagationEnabled
      ? '✅ Toggle stopPropagation (currently: ON)'
      : '🛑 Toggle stopPropagation (currently: OFF)';
    toggleBtn.style.background = stopPropagationEnabled ? '#e8f5e9' : '#ffebee';
    toggleBtn.style.borderColor = stopPropagationEnabled ? '#2e7d32' : '#c62828';

    log(`[Toggle] stopPropagation is now ${stopPropagationEnabled ? 'ON' : 'OFF'}`);
  });

  parentEl.appendChild(toggleBtn);

  // ─── Attach PARENT event listener ──────────────────────────────────
  // This fires during the BUBBLING phase for any click that occurs on
  // the parent OR any of its descendants (unless propagation is stopped).
  parentEl.addEventListener('click', (e) => {
    log(`[BUBBLING] 📦 Parent received click event! (target was: ${e.target.tagName}.${e.target.classList[0] || ''})`);
  });

  // ─── Attach CHILD event listener ───────────────────────────────────
  // This fires at the TARGET phase (the button itself was clicked).
  // If stopPropagation is enabled, we call e.stopPropagation() to
  // prevent the event from reaching the parent's listener.
  childEl.addEventListener('click', (e) => {
    log(`[TARGET] 🖱️ Child button clicked!`);

    if (stopPropagationEnabled) {
      // ─── stopPropagation() in action ─────────────────────────────
      // This call prevents the event from traveling further UP the
      // DOM tree. The parent's click handler will NOT be invoked.
      // The event effectively "dies" at this element.
      // ─────────────────────────────────────────────────────────────
      e.stopPropagation();
      log(`[TARGET] ⛔ e.stopPropagation() called — parent will NOT receive this event`);
    } else {
      log(`[TARGET] ⬆️ Event will now bubble up to parent...`);
    }
  });

  // Append the entire demo structure to the container
  containerEl.appendChild(parentEl);

  return { parentEl, childEl, toggleBtn };
}


// ============================================================================
// CONCEPT 6: INTEGRATION FUNCTION
// ============================================================================
// This is the main entry point that ties all five concepts together into
// a single interactive demonstration. The Angular wrapper component calls
// this function with a CSS selector for the container element.
//
// FLOW:
//   1. Find the container element via querySelector.
//   2. Create a "Launch Modal" button.
//   3. On click, run ALL demonstrations:
//      a. Hoisting check → display results
//      b. Prototype chain check → display results
//      c. Build a modal via pure DOM manipulation
//      d. Set up event bubbling inside the modal
//   4. Modal's close button removes the modal from the DOM.
// ============================================================================

/**
 * initVanillaShowcase(containerSelector)
 *
 * Main integration function. Call this from an Angular component's
 * ngAfterViewInit() to bootstrap the vanilla JS showcase.
 *
 * @export
 * @param {string} containerSelector - CSS selector for the host element.
 */
export function initVanillaShowcase(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(
      `[VanillaShowcase] Container not found: "${containerSelector}". ` +
      `Make sure the element exists in the DOM before calling initVanillaShowcase().`
    );
    return;
  }

  // ─── Clear any previous content ────────────────────────────────────
  container.innerHTML = '';

  // ─── Section Header ────────────────────────────────────────────────
  const header = document.createElement('h2');
  header.textContent = 'Vanilla JS Core Concepts Showcase';
  header.style.cssText = 'margin-bottom: 16px; color: #1565c0; font-family: sans-serif;';
  container.appendChild(header);

  const description = document.createElement('p');
  description.textContent =
    'This section demonstrates ES6 modules, hoisting, prototype-based inheritance, ' +
    'pure DOM manipulation, and event bubbling — all without Angular abstractions.';
  description.style.cssText = 'margin-bottom: 20px; color: #555; font-family: sans-serif;';
  container.appendChild(description);

  // ─── Launch Button ─────────────────────────────────────────────────
  const launchBtn = document.createElement('button');
  launchBtn.textContent = '🚀 Launch Modal (Demonstrates All Concepts)';
  launchBtn.style.cssText =
    'padding: 12px 24px; font-size: 16px; cursor: pointer; ' +
    'background: #1565c0; color: #fff; border: none; border-radius: 6px; ' +
    'font-family: sans-serif; transition: background 0.2s;';
  launchBtn.addEventListener('mouseenter', () => { launchBtn.style.background = '#0d47a1'; });
  launchBtn.addEventListener('mouseleave', () => { launchBtn.style.background = '#1565c0'; });

  container.appendChild(launchBtn);

  // ─── Log Output Area ───────────────────────────────────────────────
  // A visible log panel that displays results from all demonstrations.
  const logPanel = document.createElement('div');
  logPanel.classList.add('showcase__log');
  logPanel.style.cssText =
    'margin-top: 20px; padding: 16px; background: #263238; color: #a5d6a7; ' +
    'font-family: "Consolas", "Monaco", monospace; font-size: 13px; ' +
    'border-radius: 6px; max-height: 400px; overflow-y: auto; ' +
    'white-space: pre-wrap; line-height: 1.6; display: none;';
  container.appendChild(logPanel);

  /**
   * logMessage() — Appends a message to the visible log panel.
   * @param {string} msg - The message to display.
   */
  function logMessage(msg) {
    logPanel.style.display = 'block';
    const line = document.createElement('div');
    line.textContent = msg;
    logPanel.appendChild(line);
    // Auto-scroll to bottom
    logPanel.scrollTop = logPanel.scrollHeight;
  }

  // ─── Launch Button Click Handler ───────────────────────────────────
  // This is where ALL concepts come together in a single interaction.
  launchBtn.addEventListener('click', () => {
    // Clear previous log entries
    logPanel.innerHTML = '';
    logPanel.style.display = 'block';

    logMessage('═══════════════════════════════════════════════════');
    logMessage('  VANILLA JS SHOWCASE — All Concepts Demo');
    logMessage('═══════════════════════════════════════════════════');
    logMessage('');

    // ─── A. Hoisting Demonstration ─────────────────────────────────
    logMessage('──── CONCEPT: Hoisting ────');
    const hoistingResults = demonstrateHoisting();
    hoistingResults.forEach((result) => logMessage(`  ${result}`));
    logMessage('');

    // ─── B. Prototype Chain Demonstration ──────────────────────────
    logMessage('──── CONCEPT: Prototype-based Inheritance ────');
    const protoResults = demonstratePrototypeChain();
    protoResults.forEach((result) => logMessage(`  ${result}`));
    logMessage('');

    // ─── C. Pure DOM Manipulation — Build Modal ────────────────────
    logMessage('──── CONCEPT: Pure DOM Tree Manipulation ────');
    logMessage('  Building modal dialog using document.createElement...');

    // Use our prototype-based Modal class to track state
    const modalInstance = new Modal('Vanilla JS Showcase');
    logMessage(`  Created Modal instance: ${modalInstance.getInfo()}`);

    // Build the modal DOM tree using our pure DOM function
    const modalRoot = buildModalDOM(
      'Vanilla JS — Interactive Demo',
      'This modal was built entirely with document.createElement(). ' +
      'No innerHTML, no frameworks. The event bubbling demo below shows ' +
      'how click events propagate through the DOM tree.'
    );

    // Apply inline styles for visibility (in production, these would be in CSS)
    modalRoot.style.cssText =
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000;';

    const overlay = modalRoot.querySelector('.modal__overlay');
    if (overlay) {
      overlay.style.cssText =
        'position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
        'background: rgba(0,0,0,0.5); display: flex; align-items: center; ' +
        'justify-content: center;';
    }

    const contentBox = modalRoot.querySelector('.modal__content');
    if (contentBox) {
      contentBox.style.cssText =
        'background: #fff; border-radius: 12px; padding: 32px; ' +
        'max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; ' +
        'box-shadow: 0 24px 48px rgba(0,0,0,0.2); font-family: sans-serif;';
    }

    const titleEl = modalRoot.querySelector('.modal__title');
    if (titleEl) {
      titleEl.style.cssText = 'margin: 0 0 16px 0; color: #1565c0; font-size: 22px;';
    }

    const closeBtn = modalRoot.querySelector('.modal__button--close');
    if (closeBtn) {
      closeBtn.style.cssText =
        'padding: 10px 24px; background: #c62828; color: #fff; border: none; ' +
        'border-radius: 4px; cursor: pointer; font-size: 14px; margin-top: 16px;';
    }

    logMessage('  Modal DOM tree assembled with BEM classes ✓');
    logMessage('  Appending modal to document.body...');

    // Append to document body (not the container) for full-screen overlay
    document.body.appendChild(modalRoot);
    modalInstance.element = modalRoot;
    modalInstance.open();
    logMessage(`  Modal state: ${modalInstance.getInfo()}`);
    logMessage('');

    // ─── D. Event Bubbling Demo Inside the Modal ───────────────────
    logMessage('──── CONCEPT: Event Bubbling & stopPropagation ────');
    logMessage('  Setting up parent-child event listeners inside modal...');
    logMessage('  → Click the child button to see bubbling in action.');
    logMessage('  → Toggle stopPropagation to prevent parent from receiving the event.');
    logMessage('');

    // Add the event bubbling demo inside the modal's body
    const modalBody = modalRoot.querySelector('.modal__body');
    if (modalBody) {
      setupEventBubbling(modalBody, logMessage);
    }

    // ─── Close Button Handler ──────────────────────────────────────
    // Demonstrates destroy() from the prototype chain.
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to overlay
        logMessage('');
        logMessage('──── Modal Closed ────');
        logMessage('  Calling modalInstance.destroy() (inherited from UIComponent.prototype)');
        modalInstance.close();
        modalInstance.destroy();
        logMessage('  Modal removed from DOM ✓');
        logMessage('  All concepts demonstrated successfully! ✅');
      });
    }

    // ─── Overlay Click to Close ────────────────────────────────────
    // Only close if the click was directly on the overlay, not on the
    // content box (this is a practical use of event target checking).
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          logMessage('');
          logMessage('──── Overlay Clicked — Closing Modal ────');
          modalInstance.close();
          modalInstance.destroy();
          logMessage('  Modal removed from DOM ✓');
        }
      });
    }
  });
}


// ============================================================================
// DEFAULT EXPORT
// ============================================================================
// While all functions are available as named exports for selective importing,
// we also provide a default export of the main integration function for
// convenience:
//
//   import initShowcase from './vanilla-showcase.js';
//   initShowcase('#container');
// ============================================================================
export default initVanillaShowcase;
