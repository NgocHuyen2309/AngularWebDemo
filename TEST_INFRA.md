# E2E Test Infra: Fullstack Web Application

## Test Philosophy
- **Opaque-box, requirement-driven**: Tests will verify functional requirements from the perspective of an end user or client integration, independent of internal code architecture.
- **Methodology**: Apply Category-Partition for feature coverage, Boundary Value Analysis (BVA) for edge cases, Pairwise Combinatorial testing for cross-feature interactions, and Real-World Workload testing for integration scenarios.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Workload) |
|---|---|---|:---:|:---:|:---:|:---:|
| F1 | User Profile Management (REST API) | ORIGINAL_REQUEST R2 | 5 cases | 5 cases | ✓ | ✓ |
| F2 | Catalog API & DB Seeding | ORIGINAL_REQUEST R2 | 5 cases | 5 cases | ✓ | ✓ |
| F3 | SOAP Info Service | ORIGINAL_REQUEST R3 | 5 cases | 5 cases | ✓ | |
| F4 | Responsive Angular Layout (BEM/Less) | ORIGINAL_REQUEST R4 | 5 cases | 5 cases | ✓ | ✓ |
| F5 | Catalog UI Filtering & Sorting | ORIGINAL_REQUEST R4 | 5 cases | 5 cases | ✓ | ✓ |
| F6 | Vanilla JS Core Concepts Showcase | ORIGINAL_REQUEST R5 | 5 cases | 5 cases | ✓ | ✓ |

## Test Architecture
- **E2E Test Runner**: A custom Node.js runner located at `/e2e-tests/runner.js`. It executes:
  - Backend API E2E tests using `supertest` against the running server.
  - Frontend DOM structures and behaviors using `jsdom` to simulate browser rendering, ensuring Angular components mount, bind elements, and style correctly without massive browser dependencies.
- **Invoking E2E Tests**: Run `npm run test:e2e` from the project root.
- **Test Case Format**: Each test case is defined in JSON/JS structure specifying inputs, endpoint/element selector, actions, and expected output codes/strings.

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: >=5 test cases per feature (Total: 30 test cases)
- **Tier 2 (Boundary & Corner Cases)**: >=5 test cases per feature covering boundaries (Total: 30 test cases)
- **Tier 3 (Cross-Feature Interactions)**: Pairwise coverage for features sharing workflows (Total: 6 test cases)
- **Tier 4 (Real-World Application Scenarios)**: High-level scenarios demonstrating standard end-to-end user paths (Total: 5 scenarios)
- **Total test cases: 71**

## Real-World Application Scenarios (Tier 4)
1. **New User Registration and Catalog Browsing**: A user registers a new profile with custom info, retrieves their profile to check correctness, then queries the catalog list, filters by category, and sorts by price ascending.
2. **Double Registration & Catalog Validation**: A user attempts to register with an existing email (assert error), registers with a different email, fetches catalog item list, and verifies catalog contains exactly 20+ items.
3. **User Profile Update and Opt-Out**: A user registers, updates their birth date, reads the updated profile, deletes the profile, and verifies it is gone (GET returns 404).
4. **Integration SOAP & REST Health Check**: Client queries SOAP service for project statistics, parses version and status, then checks REST catalog and verifies catalog API is active.
5. **Interactive Catalog and Vanilla Showcase**: Simulates loading the frontend catalog page, performing category switching, clicking a catalog item to activate the Vanilla JS showcase modal, and clicking to close it while verifying event propagation behavior.
