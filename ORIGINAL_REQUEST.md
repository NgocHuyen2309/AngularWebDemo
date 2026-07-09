# Original User Request

## Initial Request — 2026-07-07T21:58:49+07:00

Build a clean, robust, and completely functional Fullstack Web Application (Angular frontend, Node.js/Express + MongoDB backend with REST & SOAP endpoints) harmonizing all mandatory training milestones from `D:\AngularDemo\Web Development Training Plan.xlsx` into a single cohesive enterprise blueprint.

Working directory: D:\AngularDemo
Integrity mode: demo (Leverage pre-built libraries/frameworks like Bootstrap and Mongoose for core infrastructure; read test source code to understand expected behavior before implementing; write clean, self-documenting application logic from scratch without placeholders).

## Requirements

### R1. Modular Workspace & Zero Placeholder Architecture
- Organize the workspace into clean, modular boundaries:
  - `/backend`: Node.js, Express.js, Mongoose, Jest, Supertest.
  - `/frontend`: Angular CLI project with Bootstrap, Less preprocessor, and HttpClient.
- **Zero Placeholder Policy**: Write complete, fully realized logic across all frontend and backend modules. Do not truncate code files or include `// implement later` comments. Code must be self-documenting and strictly adhere to clean coding principles.

### R2. Backend RESTful API & Database Layer (Node.js + Express + MongoDB)
- Set up a clean Express server separating configuration, routing, controllers, and models.
- Implement a MongoDB connection layer using Mongoose with strict schema validation.
- **RESTful User Management Endpoint** (`/api/users`):
  - Schema constraints mirroring SQL rules: `id` (sequential counter or clean automated tracking), `email` (strictly UNIQUE, validated format), `date_of_birth` (ISO Date type).
  - Complete CRUD endpoints: POST `/api/users` (register profile), GET `/api/users/:id` (fetch profile), PUT `/api/users/:id` (update profile), DELETE `/api/users/:id` (opt-out/delete profile).
- **Catalog Items Endpoint** (`/api/catalog`):
  - Serve a list of at least 20 items belonging to specific categories (`id`, `name`, `category`, `description`, `price`, `imageUrl`).
  - Read initial data from a `data.json` file on startup and seed it into MongoDB if empty.

### R3. Basic SOAP Service & Backend Unit Testing
- **Basic SOAP Endpoint** (`/api/soap/info`): Implement a SOAP web service route using XML request/response formats to strictly satisfy the "Basic SOAP" mandatory training requirement.
- **Backend Unit Testing & Database Config**: Implement automated unit tests for REST and SOAP routes using Jest and Supertest. For automated unit tests, use an in-memory MongoDB database (`mongodb-memory-server`) so tests run reliably without requiring an external database daemon. Use a configurable MongoDB URI for live app execution.

### R4. Frontend Enterprise Blueprint (Angular + Bootstrap + Less + BEM)
- **Dependency Management**: Provide a precise initialization sequence explicitly installing Bootstrap, Less preprocessor, and setting up `HttpClient` / `provideHttpClient()`.
- **Layout & Styling (HTML, CSS, Grid, Flexbox, Responsive)**:
  - Build a responsive layout strictly applying Bootstrap grid and utility classes, augmented by modern CSS Grid and Flexbox for complex alignments and responsive media queries.
  - For custom styles, strictly use Less preprocessors and adhere strictly to the BEM (Block, Element, Modifier) class naming conventions.
- **Core Angular Concepts**:
  - Data Binding: Maximize structural use of one-way binding and two-way data binding (`[(ngModel)]`) inside forms.
  - Directives & Events: Efficiently apply structural directives (`*ngIf`, `*ngFor`) for DOM rendering and event binding (`(click)`, `(submit)`).
  - Services & Http: Separate all data logic into `UserService` and `CatalogService`. Use `HttpClient` to communicate with the Express backend APIs (REST and SOAP).
- **Catalog Module**: Showcase the 20+ items loaded via HTTP with dynamic UI features including category filtering and interactive sorting.

### R5. Vanilla JS Core Concepts Showcase (Mandatory)
- Create a specific dedicated feature (e.g., an Easter egg, a dynamic vanilla modal, or a custom directive) that explicitly uses ES6 Modular JS and pure DOM Tree manipulation (dynamic element creation via `document.createElement`).
- Explicitly demonstrate **Event Bubbling** (and `stopPropagation`), **Hoisting**, and **Prototype-based inheritance**.
- Add clear, educational comments in this specific file highlighting these concepts to pass mentor review.

### R6. Documentation & System Architecture Diagrams
- Generate a comprehensive `README.md` containing the full project overview, directory map, operational instructions, and precise system diagrams using Markdown Mermaid syntax:
  1. **System Architecture Diagram**: Client-Server-Database boundaries, detailing the interaction over RESTful and SOAP endpoints.
  2. **Data Flow Diagram**: Tracking data flow from user trigger in the Angular UI, through the Service layer, to the Express route/middleware, down to the MongoDB collection query, and tracking the response back.

## Acceptance Criteria

### Automated Verification & Code Quality (Backend)
- [ ] `npm test` inside `/backend` executes successfully using Jest and Supertest without manual intervention or external MongoDB daemon requirements.
- [ ] Server startup automatically verifies MongoDB connection and seeds at least 20 catalog items from `data.json` into the database if empty.
- [ ] `POST /api/users` validates required fields, enforces unique email constraint, converts `date_of_birth` to ISO Date, and returns `201 Created`.
- [ ] `GET /api/users/:id`, `PUT /api/users/:id`, and `DELETE /api/users/:id` correctly perform read, update, and deletion operations, returning appropriate HTTP status codes (`200`, `404`, `400`).
- [ ] `GET /api/soap/info` (or equivalent SOAP route) accepts valid XML SOAP envelopes and responds with well-formed XML satisfying basic SOAP specification.

### Automated Verification & Code Quality (Frontend)
- [ ] `npm test` inside `/frontend` executes unit tests successfully without compilation errors.
- [ ] Angular app initializes cleanly with `provideHttpClient()` / `HttpClientModule`, Bootstrap styles, and Less preprocessor support.
- [ ] No placeholder comments (`// implement later`, `// todo`) or truncated code files exist anywhere in `/backend` or `/frontend`.

### UI/UX & Training Plan Compliance
- [ ] Catalog UI displays 20+ items fetched from the backend REST API, providing responsive grid/flexbox layouts and interactive filtering/sorting controls.
- [ ] Custom styling within `.less` files strictly adheres to BEM naming conventions (`.block__element--modifier`).
- [ ] Angular forms implement two-way binding (`[(ngModel)]`), structural directives (`*ngIf`, `*ngFor`), and event binding (`(click)`, `(submit)`).
- [ ] Vanilla JS showcase feature executes without console errors, explicitly creating DOM nodes via `document.createElement` and demonstrating Event Bubbling/`stopPropagation`, Hoisting, and Prototype inheritance with annotated comments.
- [ ] `README.md` is present at the root with complete setup instructions, directory tree, and valid Mermaid diagrams for System Architecture and Data Flow.
