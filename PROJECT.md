# Project: Fullstack Enterprise Web Application Blueprint

## Architecture
This project is structured as a modular fullstack web application featuring:
1. **Backend Service** (`/backend`): A Node.js and Express application connected to MongoDB using Mongoose. It exposes:
   - RESTful API endpoints for User CRUD and Catalog items.
   - A custom SOAP service endpoint for XML-based project queries.
   - Unified testing utilizing Jest and Supertest with `mongodb-memory-server` (in-memory MongoDB) to eliminate the need for an external DB daemon during test runs.
2. **Frontend client** (`/frontend`): An Angular CLI application utilizing Bootstrap grid/flexbox for layout, Less for styling with strict BEM naming, and Angular Services (`HttpClient`) for backend API interactions.
3. **Vanilla JS Showcase**: An isolated component within Angular executing raw, ES6 modular JavaScript and pure DOM tree manipulation (`document.createElement`) to demonstrate and document core concepts (hoisting, prototype inheritance, event bubbling, and propagation).

```mermaid
graph TD
    Client[Angular CLI Frontend] -->|REST /api/users| Express[Express Backend]
    Client -->|REST /api/catalog| Express
    Client -->|SOAP /api/soap/info| Express
    Express -->|Mongoose| MongoDB[(MongoDB)]
    Express -->|Jest/Supertest| InMemDB[(In-Memory MongoDB)]
```

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | **Backend API & Testing Suite** | Express setup, MongoDB connection, REST CRUD for Users, REST Catalog with seeding, SOAP service route, and automated Jest tests with in-memory DB. | None | DONE |
| 2 | **Frontend Angular Shell & Less/BEM** | Angular initialization, Bootstrap grid & Less/BEM style integration, responsive layout shell. | M1 | DONE |
| 3 | **Angular Services & Catalog Integration** | Forms binding with `[(ngModel)]`, `UserService`, `CatalogService` HTTP calls, Catalog grid with category filtering and interactive sorting. | M2 | DONE |
| 4 | **Vanilla JS Showcase & Docs** | Pure DOM manipulation component with event bubbling/hoisting/prototypes demo, and README.md creation with Mermaid diagrams. | M3 | DONE |
| 5 | **E2E Testing Track** | Independent design and implementation of 4-tier opaque-box E2E test suite, publishing `TEST_READY.md`. Runs in parallel to milestones 1-4. | None | DONE |
| 6 | **E2E Verification & Hardening** | Pass 100% of E2E tests (Tiers 1-4) and complete white-box Adversarial Coverage Hardening (Tier 5). | M4, M5 | DONE |
| 7 | **v3.0 Live Sync & Dynamic Theme** | Account User List (`UserListComponent`) with real-time RxJS Subject (`userAdded$`) updates, SPA smooth scrolling navigation (`scrollToSection`), SOAP UI removal, and dynamic Light/Dark mode switcher with copper accents and calendar indicator contrast optimization. | M6 | DONE |
| 8 | **v3.2 Inline User Editing & UI Polish** | Inline account editing inside `UserListComponent` cards with edit pen icon (`PUT /api/users/:id`), margin separation (`22px`) between sidebar forms, refresh button hover contrast, responsive icon-only layout (`<= 1399px`), and 100% unit test coverage (`ng test`). | M7 | DONE |
| 9 | **v3.3 Enterprise Architecture & Style Migration** | Complete structural migration from Less (`.less`) to SCSS (`.scss`) with clean CSS specificity (`zero !important declarations`), PrimeNG v20 `SelectModule` integration (`p-select`), `ngx-formly` reactive forms for user registration/profile updates (`FormlyFieldConfig[]`), Role-Based Access Control (`AuthService`, `authGuard`, `adminGuard`) with modular routing (`app.routes.ts`) and Role Dashboards (`HomeComponent`, `LoginComponent`), plus strict backend validation enforcing TLD domain checks and `Age >= 16` age gating (`user.controller.js`). | M8 | DONE |

## Interface Contracts

### Frontend Service ↔ Backend Users API
- **Endpoint**: `POST /api/users/login`
  - Request: `{ email: string }`
  - Response: `200 OK` with `{ id: number, email: string, date_of_birth: string, role: 'admin' | 'user' }`
  - Error: `404 Not Found` if account does not exist or `400 Bad Request` if email is missing.
- **Endpoint**: `POST /api/users`
  - Request: `{ email: string, date_of_birth: string (ISO Date format), role?: 'user' | 'admin' }`
  - Response: `201 Created` with `{ id: number, email: string, date_of_birth: string, role: string }`
  - Error: `400 Bad Request` if email is invalid (`Email address must contain a valid domain ending such as @gmail.com`) or age `< 16` (`User must be at least 16 years old to register`), or `409 Conflict` if email already exists.
- **Endpoint**: `GET /api/users/:id`
  - Response: `200 OK` with User object including `role`.
  - Error: `404 Not Found` if user doesn't exist.
- **Endpoint**: `PUT /api/users/:id`
  - Request: `{ email?: string, date_of_birth?: string, role?: string }`
  - Response: `200 OK` with updated User object.
  - Error: `400 Bad Request` (invalid TLD domain or age `< 16`) or `404 Not Found`.
- **Endpoint**: `DELETE /api/users/:id`
  - Response: `200 OK` or `204 No Content` indicating deletion.
  - Error: `404 Not Found` or `400 Bad Request`.

### Frontend Service ↔ Backend Catalog API
- **Endpoint**: `GET /api/catalog`
  - Response: `200 OK` with an array of at least 20 items:
    `Array<{ id: number, name: string, category: string, description: string, price: number, imageUrl: string }>`

## Code Layout

- `/backend/`
  - `config/`
    - `db.js` — MongoDB connection configuration and initial admin (`admin@enterprise.com`) seeding
  - `controllers/`
    - `user.controller.js` — User CRUD and authentication endpoint logic with strict TLD & age gating
    - `catalog.controller.js` — Catalog query and logic
  - `models/`
    - `user.model.js` — Strict Mongoose User schema with sequential ID counter and role (`user` vs `admin`)
    - `catalog.model.js` — Catalog schema
  - `routes/`
    - `user.routes.js` — Express routes for users including `POST /login`
    - `catalog.routes.js` — Express routes for catalog
  - `tests/`
    - `user.test.js` — User unit tests (Supertest + Jest)
    - `catalog.test.js` — Catalog unit tests
  - `data.json` — Pre-seeded catalog items (20+ items)
  - `app.js` — Express application configurations (middleware, routes mapping)
  - `server.js` — Express server listener entry
  - `package.json` — Backend dependency manager
- `/frontend/`
  - `src/`
    - `app/`
      - `components/`
        - `navbar/` — Global navigation bar component with RBAC status indicators and responsive navigation
        - `home/` — Role-based entry dashboard (`Admin Control Center` vs `Personal Dashboard` vs `Guest View`)
        - `login/` — Authentication and account switching portal (`ngx-formly` login & registration tabs)
        - `user-form/` — User CRUD registration component powered by `ngx-formly` reactive schema
        - `user-list/` — Account directory and inline editing modal powered by `ngx-formly` & confirmation dialog
        - `catalog/` — Catalog gallery displaying 20+ items, categories filter, and PrimeNG `p-select` sorting controls
      - `services/`
        - `auth.service.ts` — Authentication session state, login/logout observables, and role verification (`isAdmin()`)
        - `user.service.ts` — Angular HttpClient wrapper communicating with User APIs
        - `catalog.service.ts` — Angular HttpClient wrapper communicating with Catalog APIs
      - `guards/`
        - `auth.guard.ts` — Functional route guard protecting private pages
        - `admin.guard.ts` — Functional route guard protecting admin-only pages
      - `app.component.*` — Entry Angular layout shell housing `NavbarComponent` and `RouterOutlet`
      - `app.routes.ts` — Router configuration mapping paths to views with functional guards
      - `app.config.ts` — Angular environment config with `provideHttpClient()`, `provideRouter()`, `provideAnimationsAsync()`, PrimeNG Aura preset, and `FormlyModule.forRoot()`
      - `styles.scss` — Global SCSS stylesheet using CSS custom properties (`--bg-card`, `--accent-copper`) with strict specificity (zero `!important` rules)
    - `main.ts` — Bootstrapping script
  - `package.json` — Frontend dependency manager
  - `angular.json` — Build configuration specifying SCSS (`.scss`) as style preprocessor

