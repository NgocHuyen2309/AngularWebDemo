# CẨN NANG ÔN TẬP & DEMO MENTOR: ANGULAR 21 ENTERPRISE WEB APP (+ NODE.JS/EXPRESS & MONGODB)

> **Dự án:** Crown & Velvet — Fullstack Enterprise Web Application Blueprint  
> **Thư mục làm việc:** `D:\AngularDemo`  
> **Phiên bản hiện tại:** v3.3 (Enterprise Architecture & SCSS/PrimeNG/Formly Migration)  
> **Mục tiêu:** Tổng hợp toàn diện tài liệu, giải thích chi tiết từng file, phân tích chuyên sâu các khái niệm Angular và cung cấp bộ Q&A thực chiến để bảo vệ thành công trước Mentor.

---

## MỤC LỤC
1. [Tổng Quan Kiến Trúc Toàn Hệ Thống](#1-tổng-quan-kiến-trúc-toàn-hệ-thống)
2. [Chi Tiết Từng File Tài Liệu (README & Markdown)](#2-chi-tiết-từng-file-tài-liệu-readme--markdown)
3. [Giải Thích Chi Tiết Từng File Code Backend & Frontend](#3-giải-thích-chi-tiết-từng-file-code-backend--frontend)
4. [Phân Tích Chuyên Sâu 9 Chủ Đề Cốt Lõi Của Angular](#4-phân-tích-chuyên-sâu-9-chủ-đề-cốt-lõi-của-angular)
   - 4.1. [Basic Angular & Standalone Components](#41-basic-angular--standalone-components)
   - 4.2. [Data Binding (One-way, Two-way, Property, Attribute, Style/Class)](#42-data-binding-one-way-two-way-property-attribute-styleclass)
   - 4.3. [Events & Component Communication (@Input, @Output, EventEmitter)](#43-events--component-communication-input-output-eventemitter)
   - 4.4. [Services & Dependency Injection (@Injectable, Singleton, RxJS Subjects)](#44-services--dependency-injection-injectable-singleton-rxjs-subjects)
   - 4.5. [Directives (Structural *ngIf/*ngFor vs Built-in Control Flow & Attribute Directives)](#45-directives-structural-ngifngfor-vs-built-in-control-flow--attribute-directives)
   - 4.6. [PrimeNG Integration (SelectModule / p-select)](#46-primeng-integration-selectmodule--p-select)
   - 4.7. [Formly Reactive Dynamic Forms (@ngx-formly)](#47-formly-reactive-dynamic-forms-ngx-formly)
   - 4.8. [Http & Backend Communication (HttpClient, Observables, Interceptors)](#48-http--backend-communication-httpclient-observables-interceptors)
   - 4.9. [Route Guards & Role-Based Access Control (RBAC)](#49-route-guards--role-based-access-control-rbac)
5. [Kịch Bản Demo Chuẩn 15 Phút Cho Mentor](#5-kịch-bản-demo-chuẩn-15-phút-cho-mentor)
6. [Bộ Câu Hỏi Q&A "Trắc Nghiệm Khó" Từ Mentor & Câu Trả Lời Biện Luận](#6-bộ-câu-hỏi-qa-trắc-nghiệm-khó-từ-mentor--câu-trả-lời-biện-luận)

---

## 1. TỔNG QUAN KIẾN TRÚC TOÀN HỆ THỐNG

Dự án được xây dựng theo mô hình **Monorepo Modular Fullstack**, chia tách rõ ràng giữa Frontend SPA (Single Page Application) và Backend API Service.

```mermaid
graph TD
    subgraph CLIENT["Frontend Client (Angular 21 SPA)"]
        COMP["UI Components (Standalone)"]
        SERV["Angular Services (HttpClient)"]
        FORMLY["Formly Dynamic Forms"]
        PRIME["PrimeNG UI Components"]
        COMP <--> SERV
        COMP --- FORMLY
        COMP --- PRIME
    end

    subgraph BACKEND["Backend Service (Node.js + Express)"]
        APP["Express Middleware / app.js"]
        ROUTES["API Routes (/api/users, /api/catalog, /api/soap/info)"]
        CTRL["Controllers (TLD & Age Verification)"]
        MODELS["Mongoose Schemas (User & Catalog)"]
        APP --> ROUTES --> CTRL --> MODELS
    end

    subgraph DB["Database Layer"]
        MONGO[(MongoDB Live DB)]
        INMEM[(MongoDB Memory Server - Jest/E2E)]
    end

    SERV -->|REST API (JSON) & SOAP (XML)| APP
    MODELS -->|Mongoose ODM| MONGO
    MODELS -->|Automated Tests| INMEM
```

### Các Điểm Nhấn Kỹ Thuật (Enterprise Blueprint)
1. **Frontend Angular 21 Standalone Architecture:** Loại bỏ hoàn toàn `NgModule` truyền thống, sử dụng Standalone Components (`@Component({ standalone: true })`) với cây import tường minh, giúp tối ưu Tree-shaking và giảm kích thước bundle.
2. **Hệ thống CSS SCSS & BEM chuẩn xác:** Quản lý style bằng SCSS (`styles.scss`), tuân thủ nghiêm ngặt quy tắc đặt tên BEM (`.block__element--modifier`), đặc biệt cam kết **0% lệnh `!important`**, dùng CSS Variables (`--bg-card`, `--accent-copper`) để chuyển đổi giao diện Light/Dark Mode theo thời gian thực.
3. **Quản lý Form Động với `@ngx-formly` & Validation Kép:** Kết hợp Forms truyền thống (`FormsModule`) và Forms phản ứng động (`@ngx-formly/core`), đi kèm bộ custom validator kiểm tra strict email domain (`@gmail.com`, `@enterprise.com`) và độ tuổi (`>= 16 tuổi`) từ phía Frontend lẫn Backend.
4. **Đồng bộ hóa Trạng thái Real-time (Live Sync):** Giao tiếp giữa các components qua RxJS (`Subject` & `BehaviorSubject`), giúp bảng danh sách người dùng (`UserListComponent`) và thanh điều hướng (`NavbarComponent`) tự động cập nhật ngay khi profile thay đổi hoặc người dùng mới đăng ký mà không cần tải lại trang.
5. **Kiểm thử tự động 4 Tầng (71 Test cases - 100% Pass):** Sử dụng `Jest`, `Supertest`, `JSDOM`, và `mongodb-memory-server` để kiểm thử toàn phần từ unit test đến E2E mà không phụ thuộc vào tiến trình MongoDB bên ngoài.

---

## 2. CHI TIẾT TỪNG FILE TÀI LIỆU (README & MARKDOWN)

Hiểu rõ từng file tài liệu giúp bạn trả lời Mentor về quy trình quản lý dự án, kiểm thử và kiến trúc hệ thống:

| Tên File | Đường Dẫn | Mục Đích Cốt Lõi | Nội Dung Chi Tiết |
| :--- | :--- | :--- | :--- |
| **`README.md` (Root)** | [README.md](file:///D:/AngularDemo/README.md) | Tài liệu tổng quan toàn bộ Monorepo. | Chứa lời giới thiệu, cấu trúc thư mục chi tiết, sơ đồ kiến trúc Mermaid (Client-Server-DB), hướng dẫn cài đặt (`npm run start:all`, `ng serve`), bảng API Contract và chiến lược kiểm thử. |
| **`PROJECT.md`** | [PROJECT.md](file:///D:/AngularDemo/PROJECT.md) | Hồ sơ theo dõi tiến độ thi công & Milestones. | Định nghĩa 9 Milestone từ v1.0 đến v3.3 (hoàn thiện SCSS, PrimeNG v20, Formly, RBAC, age gating). Mô tả chi tiết Request/Response payload của từng endpoint API. |
| **`ORIGINAL_REQUEST.md`** | [ORIGINAL_REQUEST.md](file:///D:/AngularDemo/ORIGINAL_REQUEST.md) | Yêu cầu gốc từ Kế hoạch Training. | Ghi lại đề bài từ file Excel (`Web Development Training Plan.xlsx`), tiêu chí Zero Placeholder, yêu cầu bắt buộc về Vanilla JS Showcase (ES6, Hoisting, Prototype, Event Bubbling). |
| **`TEST_INFRA.md`** | [TEST_INFRA.md](file:///D:/AngularDemo/TEST_INFRA.md) | Phương pháp luận & Kiến trúc Kiểm thử E2E. | Mô tả phương pháp Opaque-box (kiểm thử hộp mờ), phân chia 4 Tier (Feature, Boundary, Cross-Feature, Workload) cho 6 Feature chính (F1-F6). |
| **`TEST_READY.md`** | [TEST_READY.md](file:///D:/AngularDemo/TEST_READY.md) | Báo cáo nghiệm thu kết quả E2E. | Chứng nhận **71/71 test cases PASSED** trên cả 4 Tiers cùng lệnh xác minh nhanh (`npm run test:e2e`). |
| **`walkthrough.md`** | [walkthrough.md](file:///D:/AngularDemo/walkthrough.md) | Nhật ký thay đổi kỹ thuật (Changelog/Refactoring). | Ghi chép lịch sử nâng cấp từ Less sang SCSS, loại bỏ SOAP UI thừa thãi, cải thiện độ tương phản icon, và hoàn thiện chỉnh sửa inline account. |
| **`frontend/README.md`** | [frontend/README.md](file:///D:/AngularDemo/frontend/README.md) | Hướng dẫn riêng cho tầng Frontend CLI. | Các lệnh CLI của Angular 21 (`ng serve`, `ng build`, `ng test`), hướng dẫn chạy e2e-stub với JSDOM. |

---

## 3. GIẢI THÍCH CHI TIẾT TỪNG FILE CODE BACKEND & FRONTEND

### 3.1. Backend (`/backend`) — Node.js + Express + MongoDB

| File Code | Dòng Tiêu Biểu | Chức Năng & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **`config/db.js`** | [db.js:L3-L35](file:///D:/AngularDemo/backend/config/db.js#L3-L35) | **Kết nối & Tự động Seeding:** Kết nối MongoDB qua `Mongoose`. Tự động đếm `Catalog.countDocuments()`, nếu bằng 0 sẽ đọc `data.json` để seed 21 sản phẩm. Tự động gọi `seedAdminUser()` để tạo tài khoản `admin@enterprise.com`. |
| **`app.js`** | [app.js:L4-L24](file:///D:/AngularDemo/backend/app.js#L4-L24) | **Cấu hình Middleware Express:** Enable CORS cho phép Frontend Angular gọi API; cấu hình `express.json()` và `express.text({ type: 'text/xml' })` cho SOAP; mount routes `/api/users` và `/api/catalog`. |
| **`server.js`** | [server.js:L6-L13](file:///D:/AngularDemo/backend/server.js#L6-L13) | **Điểm khởi chạy Server:** Gọi `connectDB()`, sau khi kết nối DB thành công mới `app.listen(PORT=3000)`. |
| **`models/user.model.js`** | [user.model.js:L1-L70](file:///D:/AngularDemo/backend/models/user.model.js) | **Mongoose User Schema:** Khai báo các trường `id` (auto-increment qua plugin counter), `username`, `email` (strict unique index), `password` (hashed bcrypt), `date_of_birth` (ISO Date), và `role` (`'user' | 'admin'`). |
| **`models/catalog.model.js`** | [catalog.model.js:L1-L15](file:///D:/AngularDemo/backend/models/catalog.model.js) | **Mongoose Catalog Schema:** Schema cho sản phẩm với `id`, `name`, `category`, `description`, `price`, `imageUrl`. |
| **`controllers/user.controller.js`** | [user.controller.js:L5-L28](file:///D:/AngularDemo/backend/controllers/user.controller.js#L5-L28) <br> [L64-L98](file:///D:/AngularDemo/backend/controllers/user.controller.js#L64-L98) <br> [L100-L160](file:///D:/AngularDemo/backend/controllers/user.controller.js#L100-L160) | **Logic Nghiệp Vụ User CRUD & Auth:** <br>- `isValidEmail()` & `isValidAgeGate()`: Hàm kiểm tra TLD đuôi `@gmail.com/@enterprise.com` và tuổi `>= 16`.<br>- `loginUser()`: Kiểm tra email, so khớp mật khẩu bằng `bcrypt.compare()`, trả về profile kèm role.<br>- `createUser()`: Kiểm tra strict rules, hash mật khẩu `bcrypt.hash(password, 10)`, lưu DB và trả về `201 Created`.<br>- Cung cấp đủ `getUser`, `updateUser`, `deleteUser`. |
| **`controllers/catalog.controller.js`** | [catalog.controller.js:L1-L30](file:///D:/AngularDemo/backend/controllers/catalog.controller.js) | **Truy vấn Catalog:** Xử lý `GET /api/catalog`, hỗ trợ query param `category` để lọc, `sortBy` để sắp xếp, và `limit`/`priceMin` cho các test case. |

---

### 3.2. Frontend (`/frontend/src/app`) — Angular 21 Core Architecture

#### Cấu Hình Toàn Cục & Routing
| File Code | Dòng Tiêu Biểu | Chức Năng & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **`app.config.ts`** | [app.config.ts:L12-L32](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L12-L32) <br> [app.config.ts:L46-L72](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L46-L72) | **Cấu hình Application Bootstrapping (Cung cấp Providers cho Angular 21):**<br>- Định nghĩa `emailDomainValidator` & `ageValidator`: Custom functions kiểm tra validation cho Formly.<br>- `provideHttpClient()`: Kích hoạt dịch vụ HttpClient toàn cục.<br>- `provideRouter(routes)`: Đăng ký Router.<br>- `provideAnimationsAsync()` & `providePrimeNG({ theme: { preset: Aura } })`: Cấu hình hệ thống animation và theme Aura cho PrimeNG.<br>- `importProvidersFrom(FormlyModule.forRoot(...), FormlyBootstrapModule)`: Đăng ký Formly toàn cục kèm bộ custom validation messages. |
| **`app.routes.ts`** | [app.routes.ts:L8-L19](file:///D:/AngularDemo/frontend/src/app/app.routes.ts#L8-L19) | **Định tuyến SPA (Routing):** Khai báo các đường dẫn `/home`, `/login`, `/catalog`, `/accounts`. Khóa route `/accounts` bằng functional guard `canActivate: [authGuard]`. Redirect `**` về `/home`. |

#### Root Component & Global Navigation
| File Code | Dòng Tiêu Biểu | Chức Năng & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **`app.component.ts`** | [app.component.ts:L20-L62](file:///D:/AngularDemo/frontend/src/app/app.component.ts#L20-L62) | **Component Gốc (Root Shell):** Subscribes vào `AuthService.currentUser$` để nắm trạng thái đăng nhập (`isLoggedIn`, `userRole`). Lắng nghe sự kiện `profileModalRequested$` để bật overlay Modal chỉnh sửa profile (`showProfileModal`). Xử lý sự kiện từ con truyền lên (`handleLogout()`, `onProfileUpdated()`). |
| **`app.component.html`** | [app.component.html:L8-L15](file:///D:/AngularDemo/frontend/src/app/app.component.html#L8-L15) <br> [L18](file:///D:/AngularDemo/frontend/src/app/app.component.html#L18) <br> [L22-L34](file:///D:/AngularDemo/frontend/src/app/app.component.html#L22-L34) | **Giao diện Gốc:** Truyền data xuống `<app-navbar>` qua `@Input` (`[userRole]`, `[isLoggedIn]`) và nhận event qua `@Output` (`(logoutEvent)`). Chứa `<router-outlet>` để render các trang. Chứa Modal Overlay nhúng `<app-user-form [isModal]="true" [isEditMode]="true">`. |
| **`navbar.component.ts`** | [navbar.component.ts:L17-L22](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.ts#L17-L22) <br> [L28-L66](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.ts#L28-L66) | **Thanh Điều Hướng:** Khai báo 4 `@Input()` (`userRole`, `isLoggedIn`, `currentUserEmail`, `currentUsername`) và 2 `@Output()` (`logoutEvent`, `editProfileEvent`). Quản lý chuyển đổi Light/Dark Mode (`toggleTheme()`) qua thuộc tính `data-theme` trên `document.documentElement` và lưu `localStorage`. |

#### Các Components Chức Năng (Feature Components)
| File Code | Dòng Tiêu Biểu | Chức Năng & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **`home.component.ts` / `.html`** | [home.component.ts:L19-L24](file:///D:/AngularDemo/frontend/src/app/components/home/home.component.ts#L19-L24) <br> [home.component.html:L3, L32, L61](file:///D:/AngularDemo/frontend/src/app/components/home/home.component.html#L3) | **Role-Based Dashboard:** Trang chủ động thay đổi giao diện theo quyền: `*ngIf="currentUser && isAdmin"` hiển thị Admin Control Center; `*ngIf="currentUser && !isAdmin"` hiển thị Personal Dashboard; `*ngIf="!currentUser"` hiển thị Guest View. |
| **`login.component.ts` / `.html`** | [login.component.ts:L43-L63](file:///D:/AngularDemo/frontend/src/app/components/login/login.component.ts#L43-L63) <br> [login.component.html:L47, L61](file:///D:/AngularDemo/frontend/src/app/components/login/login.component.html#L47) | **Cổng Đăng Nhập & Chuyển Tab:** Quản lý 2 tab (`Sign In` và `Register New Account`). Sử dụng Two-way binding `[(ngModel)]` cho email/password. Khi submit, gọi `AuthService.login()`, nếu thành công điều hướng về `returnUrl` hoặc `/home`. Tab đăng ký nhúng `<app-user-form>`. |
| **`user-form.component.ts`** | [user-form.component.ts:L24-L28](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.ts#L24-L28) <br> [L129-L172](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.ts#L129-L172) <br> [L192-L295](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.ts#L192-L295) | **Form Đăng Ký & Chỉnh Sửa Profile đa năng:**<br>- Hoạt động trong 2 chế độ: Đăng ký mới (`!isEditMode`) hoặc Chỉnh sửa Profile (`isEditMode`).<br>- `@Input() isModal, isEditMode, editUserId` và `@Output() userUpdated, closeModalEvent`.<br>- Tính năng **Password Strength Meter**: Kiểm tra 5 tiêu chí (length>=6, upper, lower, number, special), tính điểm 0-4 và đổi label/màu động.<br>- Kiểm tra validation chặt chẽ trước khi gọi `UserService.createUser()` hoặc `updateUser()`. Sau khi thành công, gọi `notifyUserAdded()` và emit event. |
| **`user-list.component.ts` / `.html`** | [user-list.component.ts:L26-L60](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.ts#L26-L60) <br> [L114-L132](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.ts#L114-L132) <br> [user-list.component.html:L112-L116](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.html#L112-L116) | **Quản Lý Danh Sách & Inline Editing bằng Formly:**<br>- `loadUsers()`: Lấy danh sách từ backend. Nếu là Admin, hiển thị toàn bộ người dùng. Nếu là User thường, chỉ hiển thị chính tài khoản đó.<br>- Subscribes vào `userAdded$` để tự động refresh danh sách khi có thay đổi.<br>- **Sử dụng `@ngx-formly`**: Khai báo cấu hình `editFields: FormlyFieldConfig[]` cho modal chỉnh sửa. Template render biểu mẫu tự động thông qua `<formly-form [form]="editForm" [fields]="editFields" [model]="editModel">`.<br>- Tích hợp Modal Xác Nhận (`confirmModalOpen`) trước khi Update/Delete. |
| **`catalog.component.ts` / `.html`** | [catalog.component.ts:L35-L46](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.ts#L35-L46) <br> [L58-L79](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.ts#L58-L79) <br> [catalog.component.html:L20-L28](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L20-L28) | **Danh Mục Sản Phẩm (Catalog Gallery):**<br>- Gọi `CatalogService.getCatalog()` trong `ngOnInit()` để lấy 21 sản phẩm.<br>- Lọc theo Category (`filterByCategory`) và Sắp xếp (`applyFiltersAndSort` theo name, price-asc, price-desc, category).<br>- **Tích hợp PrimeNG `<p-select>`**: Dropdown sang trọng cho phép chọn tiêu chí sắp xếp với `[(ngModel)]="sortBy" (ngModelChange)="sortItems($event)"`.<br>- Dùng pipe `| currency:'USD'` để định dạng giá tiền (`catalog.component.html:L56`). |

#### Services & Guards & Showcase
| File Code | Dòng Tiêu Biểu | Chức Năng & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **`services/auth.service.ts`** | [auth.service.ts:L18-L20](file:///D:/AngularDemo/frontend/src/app/services/auth.service.ts#L18-L20) <br> [L41-L48](file:///D:/AngularDemo/frontend/src/app/services/auth.service.ts#L41-L48) | **Dịch Vụ Xác Thực Session:** Sử dụng `BehaviorSubject<AuthUser | null>` để lưu giữ và phát sóng thông tin người dùng đang đăng nhập cho toàn bộ app. Gọi API `POST /api/users/login`, lưu `localStorage`. Cung cấp hàm `isAdmin()`, `isAuthenticated()`, và `updateCurrentUserSession()`. |
| **`services/user.service.ts`** | [user.service.ts:L18](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L18) <br> [L26-L51](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L26-L51) | **Dịch Vụ API User:** Wrapper `HttpClient` cho các HTTP verbs (GET, POST, PUT, DELETE) với backend. Sở hữu `userAdded$ = new Subject<void>()` làm trạm trung gian thông báo thay đổi dữ liệu giữa các component. |
| **`services/catalog.service.ts`** | [catalog.service.ts:L22-L24](file:///D:/AngularDemo/frontend/src/app/services/catalog.service.ts#L22-L24) | **Dịch Vụ API Catalog:** `HttpClient.get<CatalogItem[]>('http://localhost:3000/api/catalog')` trả về Observable danh sách sản phẩm. |
| **`guards/auth.guard.ts`** & `admin.guard.ts` | [auth.guard.ts:L5-L16](file:///D:/AngularDemo/frontend/src/app/guards/auth.guard.ts#L5-L16) | **Functional Route Guards:** Kiểm tra quyền `authService.isAuthenticated()` và `authService.isAdmin()`. Nếu không thỏa mãn, lập tức redirect bảo vệ route. |
| **`vanilla-showcase.js`** | [vanilla-showcase.js:L79-L105](file:///D:/AngularDemo/frontend/src/app/vanilla-js-showcase/vanilla-showcase.js#L79-L105) | **ES6 Module Showcase:** Minh họa trực tiếp `var/let/const hoisting`, tạo DOM node bằng `document.createElement()`, gán class BEM, và chứng minh cơ chế **Event Bubbling / `stopPropagation()`**. |

---

## 4. PHÂN TÍCH CHUYÊN SÂU 9 CHỦ ĐỀ CỐT LÕI CỦA ANGULAR

Mỗi chủ đề dưới đây được phân tích cực kỳ chi tiết theo đúng 5 tiêu chí: **Định nghĩa**, **Vị trí trong code**, **Mục đích**, **Lý do lựa chọn**, và **So sánh với giải pháp thay thế/Best practices**.

---

### 4.1. Basic Angular & Standalone Components

#### 1. Nó là gì?
Trong Angular 17 đến 21, **Standalone Component** (`@Component({ standalone: true })`) là kiến trúc tiêu chuẩn mới. Nó cho phép một Component tự định nghĩa các dependencies của mình thông qua mảng `imports: [...]` ngay trong decorator mà không cần phải khai báo bên trong một `@NgModule` trung gian (`app.module.ts`).

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Tất cả các Component trong dự án đều là Standalone:**
  - `AppComponent`: [app.component.ts:L10-L16](file:///D:/AngularDemo/frontend/src/app/app.component.ts#L10-L16) (`standalone: true, imports: [CommonModule, RouterOutlet, NavbarComponent, UserFormComponent]`).
  - `NavbarComponent`: [navbar.component.ts:L7-L8](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.ts#L7-L8) (`standalone: true, imports: [CommonModule, RouterModule]`).
  - `UserFormComponent`: [user-form.component.ts:L18-L19](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.ts#L18-L19) (`standalone: true, imports: [CommonModule, FormsModule, ReactiveFormsModule, FormlyModule]`).
  - `CatalogComponent`: [catalog.component.ts:L14-L15](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.ts#L14-L15).
- **Cấu hình Bootstrapping không cần Module:**
  - [app.config.ts:L46-L72](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L46-L72): Khai báo `ApplicationConfig` với `providers` thay vì `app.module.ts`.

#### 3. Dùng để làm gì?
- Tạo ra các khối UI độc lập, tự chứa (self-contained) rõ ràng.
- Khởi chạy ứng dụng SPA gọn nhẹ thông qua `bootstrapApplication(AppComponent, appConfig)` trong `main.ts`.

#### 4. Tại sao lại làm như vậy? (Ưu điểm kiến trúc)
- **Rõ ràng & Minh bạch:** Mở một component ra là biết chính xác nó phụ thuộc vào module/component nào (`imports`). Không còn cảnh "ma thuật đen" (magic dependencies) do kế thừa ngầm từ một NgModule khổng lồ.
- **Tối ưu Tree-shaking:** Trình biên dịch esbuild/Webpack dễ dàng phát hiện và loại bỏ các code không sử dụng, giúp giảm đáng kể bundle size (`main.js`).
- **Tốc độ Compile cực nhanh:** Angular compiler không cần phải xây dựng và phân tích cây module phức tạp.

#### 5. Có cách nào khác không? (So sánh & Best Practices)
- **Cách cũ (NgModule):** Tạo `app.module.ts`, khai báo mảng `declarations: [AppComponent, NavbarComponent,...]`, `imports: [BrowserModule, FormsModule,...]`.
  - *Tại sao không dùng?* NgModule là mô hình cũ (trước Angular 14/15), làm tăng boilerplate code, khó học cho người mới, và cản trở Lazy Loading/Tree-shaking mức độ chi tiết (component-level).
- **Best Practice trong Angular 21:** Luôn sử dụng Standalone Components cho mọi project mới.

---

### 4.2. Data Binding (One-way, Two-way, Property, Attribute, Style/Class)

#### 1. Nó là gì?
Data Binding là cơ chế đồng bộ hóa dữ liệu giữa **Class TypeScript (Model Logic)** và **HTML Template (View)**. Angular cung cấp 4 hình thức chính:
- **Interpolation (`{{ value }}`)**: Chèn giá trị string từ class ra HTML.
- **Property Binding (`[prop]="value"`)**: Truyền dữ liệu một chiều từ class xuống thuộc tính DOM của thẻ HTML.
- **Event Binding (`(event)="handler()"`)**: Lắng nghe sự kiện từ DOM truyền ngược lên class (xem chi tiết mục 4.3).
- **Two-way Binding (`[(ngModel)]="prop"`)**: Đồng bộ hai chiều đồng thời giữa Input DOM và Property trong Class (gộp của Property + Event binding).

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Interpolation (`{{ }}`)**:
  - `{{ appTitle }}` & `{{ userRole }}`: [navbar.component.html:L4, L6](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.html#L4)
  - `{{ currentUser.username || ... }}`: [home.component.html:L7, L36](file:///D:/AngularDemo/frontend/src/app/components/home/home.component.html#L7)
  - `{{ item.price | currency:'USD' }}`: [catalog.component.html:L56](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L56)
- **Property Binding (`[prop]`)**:
  - `[src]="item.imageUrl"` & `[alt]="item.name"`: [catalog.component.html:L44-L45](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L44-L45)
  - `[disabled]="loading"`: [login.component.html:L88](file:///D:/AngularDemo/frontend/src/app/components/login/login.component.html#L88)
  - `[class.show]="!isCollapsed"` (Class binding): [navbar.component.html:L22](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.html#L22)
  - `[ngClass]="strengthColorClass"`: [user-form.component.html:L112, L115](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.html#L112)
  - `[style.width.%]="strengthScore * 25"` (Style binding): [user-form.component.html:L115](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.html#L115)
- **Two-way Binding (`[(ngModel)]`)**:
  - `[(ngModel)]="loginModel.email"`: [login.component.html:L47](file:///D:/AngularDemo/frontend/src/app/components/login/login.component.html#L47)
  - `[(ngModel)]="loginModel.password"`: [login.component.html:L61](file:///D:/AngularDemo/frontend/src/app/components/login/login.component.html#L61)
  - `[(ngModel)]="model.username"`, `model.email`, `model.password`, `model.date_of_birth`: [user-form.component.html:L38, L52, L65, L84](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.html#L38)
  - `[ngModel]="sortBy" (ngModelChange)="sortItems($event)"` (Two-way tách rời): [catalog.component.html:L23, L27](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L23)

#### 3. Dùng để làm gì?
- Đồng bộ hóa dữ liệu người dùng nhập liệu trên Form (`Login`, `Register`) vào object model trong TypeScript ngay lập tức.
- Hiển thị thông tin sản phẩm catalog động từ API lên DOM một cách an toàn (tránh XSS).
- Biến đổi màu sắc, chiều dài thanh đo độ mạnh mật khẩu (`strengthScore * 25%`) theo thời gian thực mỗi lần người dùng gõ phím.

#### 4. Tại sao lại làm như vậy?
- **[(ngModel)] (Template-driven):** Rất nhanh và trực quan đối với các form đơn giản (như Login, Register) hoặc các input con (như bộ lọc Catalog). Không cần viết boilerplate phức tạp trong TS.
- **Property Binding (`[src]`) vs Attribute (`src="..."`):** Angular Property binding gán trực tiếp vào thuộc tính của DOM Element trong bộ nhớ, ngăn chặn hoàn toàn việc trình duyệt cố gắng tải một URL giả dạng `{{item.imageUrl}}` trước khi Angular render.

#### 5. Có cách nào khác không? (So sánh & Best Practices)
- **Reactive Forms (`[formGroup]`, `[formControlName]`):**
  - Thay vì dùng `[(ngModel)]`, ta tạo object `FormGroup` trong TS và liên kết qua `formControlName="email"`.
  - *So sánh:* Reactive Forms quản lý state, validation, và immutability tốt hơn nhiều cho các form phức tạp. Chính vì vậy, trong dự án này, ở phần chỉnh sửa tài khoản nâng cao (`UserListComponent`), **chúng ta đã áp dụng Reactive Forms kết hợp Formly** (`[form]="editForm"` trong [user-list.component.html:L113](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.html#L113)) thay vì `[(ngModel)]` truyền thống!
- **Signals Two-way Binding (`[(model)]` / `model()`) trong Angular 17+:**
  - Angular mới giới thiệu Signal model binding: `email = model('')`. Trong HTML: `[(email)]="..."`. Đây là hướng đi tương lai thay cho `ngModel`.

---

### 4.3. Events & Component Communication (@Input, @Output, EventEmitter)

#### 1. Nó là gì?
Giao tiếp giữa các Components trong Angular tuân thủ nguyên tắc **Unidirectional Data Flow (Luồng dữ liệu một chiều)**:
- **`@Input()`**: Cánh cửa để Component cha truyền dữ liệu **xuống** Component con.
- **`@Output() + EventEmitter`**: Cánh cửa để Component con phát tín hiệu/sự kiện **ngược lên** Component cha khi có hành động xảy ra.

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Tại `NavbarComponent` (Con):**
  - Nhận Input từ `AppComponent`: [navbar.component.ts:L17-L20](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.ts#L17-L20)
    ```typescript
    @Input() userRole: string | null = null;
    @Input() isLoggedIn = false;
    @Input() currentUserEmail: string | null = null;
    @Input() currentUsername: string | null = null;
    ```
  - Phát Output lên `AppComponent`: [navbar.component.ts:L21-L22](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.ts#L21-L22)
    ```typescript
    @Output() logoutEvent = new EventEmitter<void>();
    @Output() editProfileEvent = new EventEmitter<void>();
    ```
  - Khi người dùng bấm Logout/Edit, con emit event: [navbar.component.ts:L50, L64](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.ts#L50) (`this.editProfileEvent.emit()`, `this.logoutEvent.emit()`).
- **Tại `AppComponent` (Cha):**
  - Gắn binding vào thẻ `<app-navbar>`: [app.component.html:L8-L15](file:///D:/AngularDemo/frontend/src/app/app.component.html#L8-L15)
    ```html
    <app-navbar
      [userRole]="userRole"
      [isLoggedIn]="isLoggedIn"
      [currentUserEmail]="currentUser ? currentUser.email : null"
      [currentUsername]="currentUser ? (currentUser.username || ...) : null"
      (logoutEvent)="handleLogout()"
      (editProfileEvent)="showProfileModal = true"
    ></app-navbar>
    ```
- **Tại `UserFormComponent` (Con nhúng trong Modal / Login):**
  - Input/Output: [user-form.component.ts:L24-L28](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.ts#L24-L28) (`@Input() isModal, isEditMode, editUserId`, `@Output() userUpdated, closeModalEvent`).
  - Được cha (`AppComponent`) gọi trong Modal: [app.component.html:L25-L31](file:///D:/AngularDemo/frontend/src/app/app.component.html#L25-L31).

#### 3. Dùng để làm gì?
- Giúp `NavbarComponent` và `UserFormComponent` trở thành các **Dumb/Presentational Components** thuần túy: Chúng chỉ biết nhận dữ liệu để hiển thị và báo cáo khi người dùng click, hoàn toàn không bị gắn chặt vào router hay logic xử lý của trang cụ thể.
- Cho phép `AppComponent` đóng vai trò **Smart/Container Component**: Nắm giữ toàn bộ quyền quyết định điều hướng router khi Logout hoặc đóng/mở Overlay Modal khi Profile được cập nhật.

#### 4. Tại sao lại làm như vậy?
- **Tính tái sử dụng cực cao (Reusability):** `UserFormComponent` vừa được dùng ở tab Register của `LoginComponent` (`!isEditMode`), vừa được tái sử dụng trong Overlay Modal của `AppComponent` (`isEditMode = true`) chỉ nhờ việc thay đổi giá trị `@Input()`.
- **An toàn, dễ Debug:** Khi lỗi xảy ra, ta biết chắc chắn dữ liệu thay đổi từ cha truyền xuống hay do con emit event lên, không có chuyện con tự ý sửa biến trong bộ nhớ của cha.

#### 5. Có cách nào khác không? (So sánh & Best Practices)
- **Giao tiếp qua Service Shared State (RxJS Subject):**
  - Nếu Component Cha và Con nằm cách nhau 5-6 tầng DOM, việc truyền `@Input/@Output` qua từng tầng gọi là **Prop Drilling** (rất tồi tệ). Lúc đó ta dùng **Shared Service (`UserService.userAdded$`)**. Trong dự án này, giữa `UserFormComponent` và `UserListComponent` (2 component ngang hàng không cha con), **chúng ta đã dùng RxJS Subject (`userAdded$`)** thay vì Input/Output!
- **Angular Signal Inputs/Outputs (`input()`, `output()`) trong Angular 17+:**
  - Thay vì `@Input() userRole: string | null = null;`, Angular mới khuyến khích dùng Signal: `userRole = input<string | null>(null);`. Lợi ích: tự động thông báo thay đổi với Zone-less change detection cực nhạy.

---

### 4.4. Services & Dependency Injection (@Injectable, Singleton, RxJS Subjects)

#### 1. Nó là gì?
- **Service (`@Injectable`)**: Một lớp (Class) chuyên trách xử lý nghiệp vụ, giao tiếp HTTP API, và lưu trữ trạng thái chia sẻ (state).
- **Dependency Injection (DI)**: Cơ chế thiết kế của Angular giúp tự động tạo ra và tiêm (inject) các thể hiện (instance) của Service vào Component thông qua Constructor (hoặc hàm `inject()`), thay vì Component phải tự `new MyService()`.
- **Singleton Pattern (`providedIn: 'root'`)**: Đảm bảo Service chỉ được khởi tạo **đúng 1 lần duy nhất** trong suốt vòng đời ứng dụng và được chia sẻ chung cho mọi Component.

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Khai báo Services Singleton:**
  - `AuthService`: [auth.service.ts:L13-L16](file:///D:/AngularDemo/frontend/src/app/services/auth.service.ts#L13-L16) (`@Injectable({ providedIn: 'root' })`).
  - `UserService`: [user.service.ts:L13-L16](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L13-L16).
  - `CatalogService`: [catalog.service.ts:L14-L17](file:///D:/AngularDemo/frontend/src/app/services/catalog.service.ts#L14-L17).
- **Sử dụng RxJS `BehaviorSubject` & `Subject` để làm Live State:**
  - Trong `AuthService`: [auth.service.ts:L18-L20](file:///D:/AngularDemo/frontend/src/app/services/auth.service.ts#L18-L20)
    ```typescript
    private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();
    public profileModalRequested$ = new Subject<void>();
    ```
  - Trong `UserService`: [user.service.ts:L18, L22-L24](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L18)
    ```typescript
    userAdded$ = new Subject<void>();
    notifyUserAdded(): void { this.userAdded$.next(); }
    ```
- **Inject vào Components thông qua Constructor DI:**
  - `AppComponent`: [app.component.ts:L27-L30](file:///D:/AngularDemo/frontend/src/app/app.component.ts#L27-L30) (`constructor(private authService: AuthService, private router: Router)`).
  - `UserListComponent`: [user-list.component.ts:L94-L97](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.ts#L94-L97).

#### 3. Dùng để làm gì?
- **Tách biệt mối quan tâm (Separation of Concerns):** Component chỉ lo hiển thị UI; mọi logic gọi API, parse JSON, quản lý token, kiểm tra tuổi (`ageGate`) hay cập nhật localStorage đều nằm gọn trong Service.
- **Live Sync & Đồng bộ dữ liệu:** Khi `UserFormComponent` thêm mới 1 user thành công, nó gọi `this.userService.notifyUserAdded()`. Ngay lập tức, `UserListComponent` (đang subscribe vào `userAdded$`) nhận được thông báo và tự động gọi `loadUsers()` để làm mới bảng tài khoản!

#### 4. Tại sao lại làm như vậy?
- **Tại sao dùng `BehaviorSubject` cho `currentUser$` mà dùng `Subject` cho `userAdded$`?**
  - `BehaviorSubject` **luôn ghi nhớ và giữ lại giá trị mới nhất**. Khi bất kỳ một Component nào vừa sinh ra (như `NavbarComponent` hay `HomeComponent`) và subscribe vào `currentUser$`, nó nhận được ngay thông tin user hiện tại (không bị lỡ mất).
  - `Subject` **chỉ phát sự kiện tức thời** (không giữ giá trị cũ). Thích hợp cho các sự kiện trigger như "Vừa có user mới thêm vào đó, refresh đi!" (`userAdded$`) hoặc "Bật modal profile lên!" (`profileModalRequested$`).
- **Khả năng Unit Test tuyệt đỉnh:** Khi viết unit test cho Component (`UserListComponent.spec.ts`), ta dễ dàng dùng `jasmine.createSpyObj('UserService', ...)` để mock Service mà không cần phải thực sự kết nối đến server backend.

#### 5. Có cách nào khác không? (So sánh & Best Practices)
- **Cung cấp Service ở mức Component (`@Component({ providers: [UserService] })`):**
  - Nếu làm vậy, mỗi lần Component render sẽ sinh ra 1 instance Service mới toanh. Mọi Subject bên trong sẽ bị cô lập, không thể đồng bộ state với component khác -> **Sai lầm kiến trúc** nếu muốn chia sẻ dữ liệu toàn cục.
- **Dùng hàm `inject()` thay cho Constructor DI (Angular 14+ Best Practice):**
  - Cú pháp mới: `private authService = inject(AuthService);` ngay tại property declaration. Giúp code ngắn hơn, cực kỳ hữu ích trong các Functional Guards hay Abstract Classes.

---

### 4.5. Directives (Structural *ngIf/*ngFor vs Built-in Control Flow & Attribute Directives)

#### 1. Nó là gì?
Directives là các lệnh trong HTML template giúp mở rộng khả năng của DOM:
- **Structural Directives (`*ngIf`, `*ngFor`)**: Thay đổi cấu trúc DOM bằng cách thêm, xóa, hoặc lặp lại các phần tử DOM thật.
- **Attribute Directives (`[ngClass]`, `[ngStyle]`)**: Thay đổi diện mạo, thuộc tính (attributes), hoặc hành vi của một phần tử DOM hiện có mà không làm mất nó khỏi cây DOM.

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Structural Directives (`*ngIf`, `*ngFor`)**:
  - `*ngIf="isLoggedIn && userRole"`: [navbar.component.html:L5, L25, L31](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.html#L5)
  - `*ngIf="showProfileModal"`: [app.component.html:L22](file:///D:/AngularDemo/frontend/src/app/app.component.html#L22)
  - `*ngIf="currentUser && isAdmin"` vs `*ngIf="!currentUser"`: [home.component.html:L3, L32, L61](file:///D:/AngularDemo/frontend/src/app/components/home/home.component.html#L3)
  - `*ngFor="let category of categories"`: [catalog.component.html:L9](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L9)
  - `*ngFor="let item of filteredItems"`: [catalog.component.html:L39](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L39)
  - `*ngFor="let user of users"`: [user-list.component.html:L50](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.html#L50)
- **Attribute Directives (`[ngClass]`, `[ngStyle]`)**:
  - `[ngClass]="strengthColorClass"`: [user-form.component.html:L112, L115](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.html#L112)
  - `[style.width.%]="strengthScore * 25"`: [user-form.component.html:L115](file:///D:/AngularDemo/frontend/src/app/components/user-form/user-form.component.html#L115)
  - `[style.right]="'0'"`: [navbar.component.html:L39](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.html#L39)

#### 3. Dùng để làm gì?
- `*ngIf`: Render giao diện phân quyền chính xác. Nếu là Guest, toàn bộ khối HTML của Admin Control Center bị xóa sạch khỏi DOM (không chỉ ẩn bằng CSS `display: none`), ngăn chặn kẻ gian inspect DOM để xem code của Admin.
- `*ngFor`: Tự động sinh ra lưới 21 sản phẩm Catalog và danh sách các tài khoản người dùng từ mảng dữ liệu.
- `[ngClass]`: Thay đổi class màu sắc (`strength-weak`, `strength-medium`, `strength-strong`) cho thanh đo mật khẩu.

#### 4. Tại sao lại làm như vậy?
- **Khác biệt giữa `*ngIf` và `[hidden]` (hoặc `display: none`):**
  - `*ngIf` là **Structural**: Nó không tạo ra DOM node nếu điều kiện `false`. Giúp tiết kiệm RAM và CPU khi trang có nhiều component nặng (như form hay chart).
  - `[hidden]` là **Attribute**: DOM node vẫn được khởi tạo, tính toán layout, chỉ bị ẩn đi bởi CSS.
- **Tại sao cần import `CommonModule`?**
  - Vì các component của chúng ta là Standalone (`standalone: true`), để dùng được `*ngIf`, `*ngFor`, `ngClass`, bắt buộc phải import `CommonModule` (hoặc import trực tiếp `NgIf`, `NgFor` từ `@angular/common`).

#### 5. Có cách nào khác không? (So sánh với Built-in Control Flow mới của Angular 17-21)
- Từ Angular 17+, Angular giới thiệu **Built-in Control Flow** cú pháp mới không cần import `CommonModule`:
  ```html
  <!-- Cú pháp mới (Control Flow) -->
  @if (isLoggedIn) {
    <span>Welcome!</span>
  } @else {
    <span>Please login</span>
  }

  @for (item of filteredItems; track item.id) {
    <div>{{ item.name }}</div>
  }
  ```
- **Tại sao dự án này đang dùng `*ngIf`/`*ngFor` thay vì `@if`/`@for`? (Câu hỏi bảo vệ Mentor cực hay!)**
  - *Trả lời:* "Thưa Mentor, dự án sử dụng `*ngIf` / `*ngFor` đi kèm `CommonModule` để duy trì **tính tương thích 100% với hệ thống kiểm thử E2E bằng JSDOM (`TEST_INFRA.md`)** và các template quy chuẩn của Bootstrap theo Kế hoạch Training. Cú pháp `*ngIf`/`*ngFor` hiện nay vẫn được Angular 21 hỗ trợ đầy đủ. Trong giai đoạn sản xuất (Production Hardening), toàn bộ template này có thể chuyển đổi tự động sang `@if`/`@for` chỉ trong 1 giây bằng lệnh CLI chính thức: `ng generate @angular/core:control-flow` mà không làm thay đổi bất kỳ logic nghiệp vụ nào!"

---

### 4.6. PrimeNG Integration (SelectModule / p-select)

#### 1. Nó là gì?
PrimeNG là bộ thư viện UI Components doanh nghiệp phổ biến nhất cho Angular. Trong phiên bản v20+, PrimeNG áp dụng kiến trúc **Aura Theme Preset** và cung cấp component `<p-select>` (trước đây là `p-dropdown`) để thay thế thẻ `<select>` thô cứng của HTML bằng một menu dropdown động, hỗ trợ accessibility, animation mượt mà và tùy biến sâu theo CSS variables.

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Cấu hình Theme toàn cục:**
  - [app.config.ts:L5-L6, L52-L56](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L52-L56)
    ```typescript
    import { providePrimeNG } from 'primeng/config';
    import Aura from '@primeuix/themes/aura';
    // ... inside providers:
    providePrimeNG({ theme: { preset: Aura } })
    ```
- **Import vào Standalone Component:**
  - [catalog.component.ts:L4, L15](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.ts#L4) (`import { SelectModule } from 'primeng/select';` và `imports: [..., SelectModule]`).
- **Sử dụng trong Template:**
  - [catalog.component.html:L20-L28](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.html#L20-L28)
    ```html
    <p-select
      styleClass="catalog__sort-select"
      [options]="sortOptions"
      [ngModel]="sortBy"
      optionLabel="label"
      optionValue="value"
      appendTo="body"
      (ngModelChange)="sortItems($event)"
    ></p-select>
    ```

#### 3. Dùng để làm gì?
- Tạo dropdown chọn tiêu chí sắp xếp sản phẩm (`Sort by Name A-Z`, `Price: Low to High`, `Price: High to Low`, `Category`) trên trang Catalog.
- Cung cấp trải nghiệm người dùng sang trọng, phù hợp với phong cách luxury Crown & Velvet.

#### 4. Tại sao lại làm như vậy? (Ưu điểm)
- **Tại sao cần `appendTo="body"`?**
  - Khi đặt dropdown trong một container có `overflow: hidden` hoặc `z-index` phức tạp (như thanh công cụ catalog), menu xổ xuống có thể bị cắt xén (clipped). Thuộc tính `appendTo="body"` giúp PrimeNG render menu trực tiếp vào cuối thẻ `<body>`, đảm bảo menu luôn nổi trên cùng (overlay) một cách hoàn hảo.
- **Tích hợp mượt mà với `FormsModule` (`[(ngModel)]`):** PrimeNG hỗ trợ chuẩn `ControlValueAccessor`, nên có thể bind trực tiếp biến `sortBy` và lắng nghe `(ngModelChange)` như một input thông thường.

#### 5. Có cách nào khác không? (So sánh)
- **Angular Material (`<mat-select>`):**
  - Material theo phong cách Google Material Design. Phù hợp cho app nội bộ, nhưng khó tùy biến sang giao diện Luxury/Dark mode cầu kỳ hơn PrimeNG Aura.
- **HTML Native `<select class="form-select">` của Bootstrap:**
  - Rất nhẹ và không cần cài thư viện. Tuy nhiên, không thể tùy biến phần hiển thị danh sách option xổ xuống bên trong theo CSS (trình duyệt tự quản lý OS-level menu), thiếu tính năng search hoặc icon nâng cao.

---

### 4.7. Formly Reactive Dynamic Forms (@ngx-formly)

#### 1. Nó là gì?
**`@ngx-formly`** là thư viện xây dựng biểu mẫu động (Dynamic Forms) dựa trên Reactive Forms của Angular. Thay vì phải viết hàng trăm dòng HTML lặp đi lặp lại (`<div class="form-group"><label>...</label><input>...<small class="error">...</small></div>`), Formly cho phép bạn chỉ cần định nghĩa **cấu trúc mảng JSON (`FormlyFieldConfig[]`)** trong TypeScript. Thư viện sẽ tự động render toàn bộ HTML, tự động gắn validation, và tự động hiển thị thông báo lỗi đồng bộ theo Bootstrap theme (`@ngx-formly/bootstrap`).

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Đăng ký và Khai báo Custom Validators Toàn Cục:**
  - [app.config.ts:L12-L44](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L12-L44): Viết 2 validator hàm `emailDomainValidator` (`/^[a-zA-Z0-9._%+-]+@(gmail\.com|enterprise\.com)$/i`) và `ageValidator` (tính toán ngày sinh `>= 16 tuổi`).
  - [app.config.ts:L58-L70](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L58-L70): Đăng ký vào `FormlyModule.forRoot({ validators: [...], validationMessages: [...] })`.
- **Sử dụng trong `UserListComponent` (Modal Chỉnh Sửa Tài Khoản):**
  - Khai báo Schema JSON trong TypeScript: [user-list.component.ts:L24-L60](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.ts#L24-L60)
    ```typescript
    editForm = new FormGroup({});
    editModel: any = { username: '', email: '', date_of_birth: '' };
    editFields: FormlyFieldConfig[] = [
      { key: 'username', type: 'input', props: { label: 'Username', required: true } },
      { key: 'email', type: 'input', props: { label: 'Email Address', required: true }, validators: { validation: ['emailDomain'] } },
      { key: 'date_of_birth', type: 'input', props: { label: 'Date of Birth (Age >= 16)', type: 'date', required: true }, validators: { validation: ['ageGate'] } }
    ];
    ```
  - Render tự động trong HTML chỉ với 1 thẻ: [user-list.component.html:L112-L116](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.html#L112-L116)
    ```html
    <formly-form [form]="editForm" [fields]="editFields" [model]="editModel"></formly-form>
    ```

#### 3. Dùng để làm gì?
- Tạo ra biểu mẫu sửa đổi thông tin người dùng (`Username`, `Email`, `DOB`) bên trong Modal Edit của bảng Account Management.
- Tự động chặn và báo lỗi màu đỏ nếu admin nhập email sai định dạng domain hoặc chọn ngày sinh dưới 16 tuổi.

#### 4. Tại sao lại làm như vậy? (Ưu điểm tuyệt đối)
- **Tiết kiệm 80% code HTML:** Không phải viết tay từng thẻ input, label, hay dùng `*ngIf="formControl.hasError(...)"` cho từng field.
- **Tập trung hóa Quy chuẩn Kiểm tra (Centralized Validation):** Validator `emailDomain` và `ageGate` được cấu hình ở `app.config.ts`. Nếu sau này công ty muốn đổi luật thành `>= 18 tuổi`, chỉ cần sửa 1 dòng trong `app.config.ts`, toàn bộ các form sử dụng Formly trên app sẽ tự động cập nhật luật mới!
- **Động hóa theo metadata từ Backend:** Trong các hệ thống Enterprise lớn, cấu trúc `FormlyFieldConfig[]` có thể được tải trực tiếp từ API backend trả về, giúp form tự tạo ra các trường mới mà không cần re-deploy frontend!

#### 5. Có cách nào khác không? (So sánh)
- **Reactive Forms thuần (`FormBuilder`, `FormGroup`):**
  - Viết code TS định nghĩa form và viết trọn vẹn HTML với `[formControlName]`. Phù hợp khi layout form có thiết kế cực kỳ đặc biệt, không theo dạng lưới cột tiêu chuẩn.
- **Template-driven Forms (`[(ngModel)]`):**
  - Rất tốt cho form đơn giản (như form đăng ký `UserFormComponent` hiện tại của chúng ta), nhưng cực kỳ khó bảo trì và test khi số lượng input lên tới 20-30 trường.

---

### 4.8. Http & Backend Communication (HttpClient, Observables, Interceptors)

#### 1. Nó là gì?
- **`HttpClient`**: Dịch vụ cốt lõi của Angular để thực hiện các HTTP requests (GET, POST, PUT, DELETE) tới máy chủ API.
- **`Observable` (RxJS)**: Thay vì trả về `Promise` (như `fetch`), `HttpClient` của Angular luôn trả về một `Observable`. Observable là một luồng dữ liệu bất đồng bộ cho phép hủy (cancel) request đang chạy, xử lý lại (retry), hoặc kết hợp các luồng phức tạp.

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Cung cấp dịch vụ `HttpClient`:**
  - [app.config.ts:L49](file:///D:/AngularDemo/frontend/src/app/app.config.ts#L49) (`provideHttpClient()`).
- **Gọi API trong Services:**
  - `UserService.getUsers()` -> `http.get<User[]>('http://localhost:3000/api/users')`: [user.service.ts:L26-L28](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L26-L28).
  - `UserService.createUser()` -> `http.post<User>(...)`: [user.service.ts:L30-L39](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L30-L39).
  - `UserService.updateUser()` -> `http.put<User>(...)`: [user.service.ts:L45-L47](file:///D:/AngularDemo/frontend/src/app/services/user.service.ts#L45-L47).
  - `AuthService.login()` -> `http.post<AuthUser>(...).pipe(tap(...))`: [auth.service.ts:L41-L48](file:///D:/AngularDemo/frontend/src/app/services/auth.service.ts#L41-L48).
  - `CatalogService.getCatalog()` -> `http.get<CatalogItem[]>(...)`: [catalog.service.ts:L22-L24](file:///D:/AngularDemo/frontend/src/app/services/catalog.service.ts#L22-L24).
- **Subscribe và Xử lý trong Component:**
  - [catalog.component.ts:L36-L45](file:///D:/AngularDemo/frontend/src/app/components/catalog/catalog.component.ts#L36-L45):
    ```typescript
    this.catalogService.getCatalog().subscribe({
      next: (data) => { this.items = data; ... },
      error: (err) => { console.error(...); }
    });
    ```

#### 3. Dùng để làm gì?
- Trao đổi dữ liệu trực tiếp với Backend Express/MongoDB trên port 3000.
- `pipe(tap(user => ...))` trong `AuthService.login()` cho phép đánh chặn luồng dữ liệu vừa nhận được từ server để lưu vào `localStorage` và phát tín hiệu cho `currentUserSubject` trước khi trả về cho `LoginComponent`.

#### 4. Tại sao lại làm như vậy? (Sức mạnh của Observable vs Promise)
- **Khả năng tự động hủy (Cancellation/Unsubscribe):** Nếu người dùng bấm vào trang Catalog (đang gọi HTTP tải 1000 sản phẩm), nhưng ngay lập tức bấm sang trang Home trước khi server trả về, Angular (hoặc Async pipe / Unsubscribe) có thể hủy ngay HTTP request dưới mạng, không lãng phí băng thông! `Promise` (`fetch`) không thể tự động hủy gọn gàng như vậy.
- **Type Safety tuyệt đối:** Việc khai báo `.get<CatalogItem[]>(...)` giúp TypeScript kiểm tra chặt chẽ cấu trúc dữ liệu trả về, báo lỗi ngay lúc code nếu gọi sai tên trường.

#### 5. Có cách nào khác không? (So sánh)
- **Trình duyệt `fetch()` API / `axios`:**
  - Không nằm trong chu trình Dependency Injection của Angular, không tận dụng được cơ chế `HttpInterceptor` của Angular (ví dụ khi muốn viết Interceptor chèn Header `Authorization: Bearer <token>` vào mọi request một cách tự động).
- **Angular 18+ `toSignal(this.http.get(...))` / `rxResource`:**
  - Trong các phiên bản mới nhất, Angular cho phép biến thẳng HTTP Observable thành Signal để render trực tiếp mà không cần viết lệnh `.subscribe()` thủ công trong `ngOnInit()`.

---

### 4.9. Route Guards & Role-Based Access Control (RBAC)

#### 1. Nó là gì?
- **Route Guard**: Lính gác bảo vệ các đường dẫn (Routes) trong ứng dụng SPA. Nó kiểm tra một điều kiện (Boolean hoặc Observable<Boolean>) trước khi cho phép Router tải hoặc chuyển trang đến một Component.
- **Role-Based Access Control (RBAC)**: Phân quyền truy cập dựa trên vai trò của tài khoản (ví dụ: `admin` được vào trang quản trị tài khoản `/accounts`, còn `user` thường bị chặn).

#### 2. Đã sử dụng ở đâu trong code? (File & Dòng)
- **Định nghĩa Functional Guards:**
  - `authGuard`: [auth.guard.ts:L5-L16](file:///D:/AngularDemo/frontend/src/app/guards/auth.guard.ts#L5-L16)
    ```typescript
    export const authGuard: CanActivateFn = (route, state) => {
      const authService = inject(AuthService);
      const router = inject(Router);
      if (authService.isAuthenticated()) return true;
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    };
    ```
  - `adminGuard`: [admin.guard.ts:L5-L16](file:///D:/AngularDemo/frontend/src/app/guards/admin.guard.ts#L5-L16) (`authService.isAuthenticated() && authService.isAdmin()`).
- **Gắn vào Cấu hình Router:**
  - [app.routes.ts:L13-L17](file:///D:/AngularDemo/frontend/src/app/app.routes.ts#L13-L17)
    ```typescript
    { path: 'accounts', component: UserListComponent, canActivate: [authGuard] }
    ```
- **Kiểm soát hiển thị trên UI theo Quyền:**
  - Ẩn/hiện nút Admin trên Navbar: [navbar.component.html:L31-L33](file:///D:/AngularDemo/frontend/src/app/components/navbar/navbar.component.html#L31) (`*ngIf="isLoggedIn && userRole === 'admin'"`).
  - Ẩn/hiện Dashboard theo quyền: [home.component.html:L3, L32](file:///D:/AngularDemo/frontend/src/app/components/home/home.component.html#L3).
  - Kiểm soát dữ liệu trả về trên bảng Accounts: [user-list.component.ts:L120-L124](file:///D:/AngularDemo/frontend/src/app/components/user-list/user-list.component.ts#L120-L124) (Nếu là Admin thì xem tất cả `users = data`; nếu là User thường chỉ hiển thị chính tài khoản của họ).

#### 3. Dùng để làm gì?
- Ngăn chặn người dùng chưa đăng nhập gõ trực tiếp URL `http://localhost:4200/accounts` vào trình duyệt. Nếu cố tình gõ, `authGuard` lập tức đẩy về `http://localhost:4200/login?returnUrl=/accounts`.
- Bảo đảm tính riêng tư và phân quyền nghiệp vụ nghiêm ngặt cả trên giao diện lẫn khi truy xuất dữ liệu từ API.

#### 4. Tại sao lại làm như vậy? (Functional Guard vs Class Guard)
- Từ Angular 15+, Angular chính thức khuyến khích sử dụng **Functional Guards (`CanActivateFn`)** thay vì viết Class (`@Injectable() export class AuthGuard implements CanActivate`).
- **Ưu điểm vượt trội:** Viết dưới dạng một arrow function gọn nhẹ chỉ 10 dòng code, sử dụng hàm `inject()` để lấy ra `AuthService` và `Router` ngay lập tức mà không cần tạo class hay constructor cồng kềnh.

---

## 5. KỊCH BẢN DEMO CHUẨN 15 PHÚT CHO MENTOR

Để buổi demo diễn ra chuyên nghiệp, trôi chảy và gây ấn tượng mạnh nhất, hãy thực hiện theo đúng thứ tự 5 bước dưới đây:

### Bước 0: Chuẩn bị Môi trường trước khi bắt đầu (2 phút trước demo)
1. Mở Terminal tại gốc `D:\AngularDemo`.
2. Kiểm tra lại toàn bộ E2E tests để tự tin 100%:
   ```bash
   npm run test:e2e
   ```
   *(Cho Mentor thấy dòng kết quả xanh rực rỡ: `TOTAL CASES: 71 | PASSED: 71 | FAILED: 0`).*
3. Khởi chạy đồng thời cả Backend và Frontend:
   ```bash
   npm run start:all
   ```
   *(Hoặc chạy 2 terminal riêng: `cd backend && npm start` và `cd frontend && ng serve`).*

---

### Bước 1: Giới thiệu Tổng quan & Đăng nhập Admin (3 phút)
- **Lời nói:** *"Em chào Mentor! Sau đây em xin demo dự án Fullstack Enterprise Blueprint 'Crown & Velvet' được xây dựng trên Angular 21, Node.js Express và MongoDB theo đúng chuẩn kiến trúc của Kế hoạch Training."*
- **Hành động:**
  1. Mở trình duyệt tại `http://localhost:4200/`. Chỉ vào **Guest View** trên trang Home và thông báo: *"Hệ thống tự động nhận diện Guest, yêu cầu đăng nhập hoặc xem catalog công khai."*
  2. Click vào **Sign In / Register** -> Nhập tài khoản Admin mặc định đã tự động seed bởi `db.js`:
     - Email: `admin@enterprise.com`
     - Password: `12345`
  3. Bấm **SIGN IN** -> Hệ thống chuyển về **Admin Control Center**. Chỉ cho Mentor thấy Huy hiệu (Badge) `admin` màu vàng sang trọng trên Navbar và các nút chức năng quản trị.

---

### Bước 2: Demo Quản lý Tài Khoản (RBAC, Live Sync & Formly Inline Edit) (4 phút)
- **Lời nói:** *"Ở vai trò Admin, em có thể truy cập trang Quản lý toàn bộ tài khoản (`UserListComponent`). Trang này được bảo vệ bởi `authGuard` và ứng dụng thư viện `@ngx-formly` để chỉnh sửa nhanh."*
- **Hành động:**
  1. Bấm vào menu **All Accounts (Admin)** trên Navbar.
  2. Chỉ vào danh sách người dùng. Bấm nút **Edit** trên một tài khoản bất kỳ (ví dụ chính tài khoản `admin` hoặc một user khác).
  3. **Giới thiệu Formly:** *"Khi em mở modal chỉnh sửa, toàn bộ form này được render tự động từ cấu trúc mảng JSON `FormlyFieldConfig[]` chứ không viết tay HTML!"*
  4. **Thử thách Validation:** Thử sửa email thành `abc@yahoo.com` -> Chỉ ra thông báo lỗi màu đỏ từ Custom Validator: *"Email address must strictly end with @gmail.com or @enterprise.com"*. Sửa DOB nhỏ hơn 16 tuổi -> Báo lỗi *"Age >= 16"*.
  5. Sửa email hợp lệ thành `admin_updated@enterprise.com` -> Bấm **Save Changes** -> Modal Xác Nhận (Confirm Dialog) hiện lên -> Bấm **Confirm**.
  6. **Nhấn mạnh Live Sync:** Chỉ vào góc trên phải Navbar, cho Mentor thấy tên người dùng trên Navbar và bảng danh sách đã **tự động cập nhật tức thì** nhờ cơ chế `userAdded$` Subject và `updateCurrentUserSession()` mà không hề tải lại trang (No page reload)!

---

### Bước 3: Demo Đăng Ký Tài Khoản & Password Strength Meter (3 phút)
- **Lời nói:** *"Bây giờ em xin demo tính năng Đăng ký tài khoản mới (`UserFormComponent`) với thanh đo độ mạnh mật khẩu và hai-chiều binding."*
- **Hành động:**
  1. Bấm Đăng xuất (**Logout** từ Profile Dropdown) -> Bấm vào **Register New Account**.
  2. Nhập các trường: Username `mentor_demo`, Email `mentor@gmail.com`, DOB `2000-05-15`.
  3. **Demo Password Strength Meter:** Nhập từng chữ vào ô Password:
     - Gõ `12345` -> Thanh màu đỏ (Weak), checklist hiện dấu chéo.
     - Gõ `Mentor123` -> Thanh màu vàng (Medium), checklist hiện dấu tick xanh cho chữ hoa, chữ thường, số.
     - Gõ `Mentor@2026!` -> Thanh màu xanh lá đậm (Very Strong - 4/4 điểm), toàn bộ 5 tiêu chí sáng lên.
  4. Bấm nút con mắt (Eye toggle) để cho thấy cơ chế đổi attribute `[type]="showPassword ? 'text' : 'password'"`.
  5. Bấm **Create Secure Account** -> Thông báo thành công -> Bấm qua trang Đăng nhập và login thành công vào **Personal Dashboard (Role: user)**.

---

### Bước 4: Demo Catalog Gallery & PrimeNG Dropdown & Theme Toggling (3 phút)
- **Lời nói:** *"Tiếp theo là trang Catalog hiển thị 21 sản phẩm được load từ Express/MongoDB API, tích hợp PrimeNG và hệ thống đổi màu Light/Dark Mode động."*
- **Hành động:**
  1. Bấm vào menu **Catalog**. Cho thấy danh sách lưới sản phẩm với hình ảnh studio sắc nét.
  2. Bấm bộ lọc Category (`Electronics`, `Clothing`, `Books`).
  3. **Demo PrimeNG:** Click vào Dropdown góc phải (`<p-select>`) -> Chọn **Price: Low to High** -> Sản phẩm tự động sắp xếp lại tức thì nhờ Two-way binding (`[(ngModel)]="sortBy"`).
  4. **Demo Theme Toggling:** Bấm nút hình Mặt Trời / Mặt Trăng trên góc phải Navbar -> Toàn bộ giao diện lập tức chuyển đổi mượt mà giữa **Dark Velvet Mode** và **Light Pristine Mode** (nhờ thay đổi biến `--bg-card` trong Less/SCSS).

---

### Bước 5: Demo Vanilla JS Core Concepts Showcase (2 phút)
- **Lời nói:** *"Cuối cùng, để đáp ứng yêu cầu bắt buộc của Kế hoạch Training về nắm vững JS thuần, em đã xây dựng module `vanilla-showcase.js` độc lập."*
- **Hành động:**
  1. Mở file [vanilla-showcase.js](file:///D:/AngularDemo/frontend/src/app/vanilla-js-showcase/vanilla-showcase.js) trực tiếp trên VS Code cho Mentor thấy các dòng comment giải thích cặn kẽ từng khái niệm.
  2. Trình bày nhanh 3 hàm cốt lõi trong file:
     - `demonstrateHoisting()`: Minh họa sự khác biệt khi truy xuất biến `var` trước khai báo (`undefined`) so với `let/const` (TDZ ReferenceError).
     - `demonstratePrototypeInheritance()`: Dùng `UIComponent.prototype` để kế thừa phương thức `render()`.
     - `initVanillaShowcase()`: Tạo DOM element bằng `document.createElement()`, gắn class BEM, và chứng minh **Event Bubbling / `stopPropagation()`** thông qua việc bấm vào các thẻ lồng nhau (`.parent` -> `.child`).

---

## 6. BỘ CÂU HỎI Q&A "TRẮC NGHIỆM KHÓ" TỪ MENTOR & CÂU TRẢ LỜI BIỆN LUẬN

Dưới đây là các câu hỏi tình huống và câu hỏi kiến thức sâu mà Mentor thường dùng để "xoáy" học viên, kèm theo câu trả lời chuẩn xác, tự tin:

### Q1: Tại sao em lại sử dụng Standalone Components trong Angular 21 mà không dùng `app.module.ts` (NgModule) như các bài hướng dẫn cũ?
**Trả lời:** *"Thưa Mentor, từ Angular 14+, Angular đã giới thiệu Standalone Components và đến Angular 17-21 thì đây chính thức là kiến trúc tiêu chuẩn (Default Architecture). Việc loại bỏ `NgModule` giúp dự án của em đạt được 3 lợi ích lớn:
1. **Tính minh bạch (Transparency):** Mỗi component tự định nghĩa chính xác mảng `imports` những gì nó cần dùng (ví dụ `CommonModule`, `FormsModule`, `NavbarComponent`), loại bỏ tình trạng 'phụ thuộc ngầm' từ Module cha.
2. **Tối ưu hóa Bundle Size (Tree-shaking):** Trình biên dịch esbuild/Webpack dễ dàng phát hiện các component hoặc directive không được sử dụng để loại bỏ khỏi bundle cuối cùng (`main.js`), giúp trang load nhanh hơn.
3. **Cấu hình Bootstrapping tập trung:** Mọi cấu hình toàn cục như `provideHttpClient()`, `provideRouter()`, hay `FormlyModule.forRoot()` đều được quản lý gọn gàng trong `app.config.ts`."*

---

### Q2: Trong `UserListComponent`, em dùng thư viện `@ngx-formly` để làm gì? Tại sao không viết form bằng HTML thông thường hoặc Reactive Forms thuần?
**Trả lời:** *"Thưa Mentor, `UserListComponent` chứa Modal chỉnh sửa thông tin tài khoản. Em sử dụng `@ngx-formly` vì đây là giải pháp Enterprise chuẩn cho **Schema-Driven Dynamic Forms**:
- Thay vì phải viết hàng chục thẻ HTML (`<input>`, `<label>`, `<div class="error">`), em chỉ cần khai báo mảng JSON `editFields: FormlyFieldConfig[]` bên trong TypeScript.
- **Tại sao hơn Reactive Forms thuần?** Formly giúp giảm **80% lượng code HTML boilerplate**. Quan trọng hơn, toàn bộ quy tắc validation (như custom validator kiểm tra đuôi `@gmail.com` hay tuổi `>= 16`) được cấu hình tập trung tại `app.config.ts`. Khi luật nghiệp vụ thay đổi, em chỉ cần sửa ở 1 nơi duy nhất (`app.config.ts`), toàn bộ biểu mẫu Formly trên toàn ứng dụng sẽ lập tức áp dụng luật mới mà không cần sửa từng file HTML!"*

---

### Q3: Em hãy giải thích sự khác nhau giữa `*ngIf` và `[hidden]`? Khi nào nên dùng cái nào? Tại sao dự án dùng `*ngIf` cho Navbar Admin button?
**Trả lời:**
- *"Sự khác nhau bản chất là: `*ngIf` là **Structural Directive** (lệnh cấu trúc DOM), trong khi `[hidden]` (hoặc CSS `display: none`) là **Attribute Binding**.*
- *Khi `*ngIf="false"`, Angular **hoàn toàn không tạo hoặc hủy bỏ hoàn toàn nút DOM đó khỏi bộ nhớ**. Khi `[hidden]="true"`, thẻ DOM vẫn được tạo ra, chạy lifecycle `ngOnInit()`, tính toán layout, chỉ là bị ẩn đi về mặt thị giác.*
- ***Tại sao dùng `*ngIf` cho Navbar Admin?** Về mặt bảo mật và hiệu năng, nút Admin hoặc khối Admin Control Center không được phép tồn tại trong DOM nếu người dùng chỉ là Guest/User thường. Nếu dùng `[hidden]`, một người dùng có hiểu biết có thể nhấn F12 (Inspect Element), bỏ thuộc tính `hidden` trong DOM và nhìn thấy/bấm được nút Admin. Dùng `*ngIf` loại bỏ hoàn toàn rủi ro này!"*

---

### Q4: Tại sao trong `AuthService`, em dùng `BehaviorSubject` cho `currentUser$`, nhưng trong `UserService`, em lại dùng `Subject` cho `userAdded$`?
**Trả lời:** *"Đây là sự lựa chọn kiến trúc dựa trên tính chất của luồng dữ liệu thưa Mentor:
- **`BehaviorSubject` (dùng cho `currentUser$`):** Đặc điểm của nó là **luôn giữ lại giá trị gần nhất** và cần có giá trị khởi tạo ban đầu (`this.loadUserFromStorage()`). Khi bất kỳ một Component nào vừa được sinh ra trên trang (ví dụ `NavbarComponent`), ngay khi nó `.subscribe(currentUser$)`, nó lập tức nhận được trạng thái đăng nhập hiện tại. Nếu dùng `Subject` thường, Component đến sau sẽ bị 'lỡ mất' tín hiệu đăng nhập trước đó!
- **`Subject` (dùng cho `userAdded$`):** Đặc điểm của nó là **chỉ phát sự kiện tức thời** (làm trạm trung gian thông báo - Event Bus). Khi `UserFormComponent` thêm mới một user, nó gọi `notifyUserAdded()`. Ta chỉ cần những ai đang lắng nghe (`UserListComponent`) lập tức gọi `loadUsers()`. Không cần thiết phải ghi nhớ hay phát lại tín hiệu 'vừa thêm user' cho một component sinh ra sau này!"*

---

### Q5: Em sử dụng `emailDomainValidator` và `ageValidator` ở cả Frontend lẫn Backend. Có bị thừa thãi (Redundant) không? Tại sao không chỉ check ở 1 chỗ?
**Trả lời:** *"Dạ không hề thừa thãi thưa Mentor, mà đây là nguyên tắc bảo mật tối thượng **Defense-in-Depth (Bảo vệ nhiều lớp)** trong lập trình Fullstack Enterprise:
1. **Frontend Validation (`app.config.ts` & `user-form`):** Đóng vai trò nâng cao trải nghiệm người dùng (**UX**). Người dùng vừa gõ xong email sai hoặc chọn ngày sinh dưới 16 tuổi là form báo lỗi màu đỏ ngay lập tức, không cần tốn thời gian và băng thông gửi request lên server rồi mới chờ báo lỗi về.
2. **Backend Validation (`user.controller.js`):** Đóng vai trò bảo vệ an toàn dữ liệu (**Security & Integrity**). Vì Frontend chạy trên trình duyệt của client, kẻ xấu hoàn toàn có thể dùng Postman, cURL hoặc tắt JavaScript để gửi thẳng HTTP request chứa email giả/tuổi nhỏ hơn 16 vào API `POST /api/users`. Nếu Backend không kiểm tra lại bằng `isValidEmail()` và `isValidAgeGate()`, cơ sở dữ liệu MongoDB sẽ bị rác hoặc lỗ hổng nghiệp vụ!"*

---

### Q6: Nếu Mentor yêu cầu em thay thế toàn bộ `*ngIf` / `*ngFor` trong dự án sang cú pháp Built-in Control Flow (`@if`, `@for`) mới của Angular 17-21 ngay bây giờ, em có làm được không và làm như thế nào?
**Trả lời:** *"Dạ hoàn toàn làm được và làm cực kỳ nhanh chóng thưa Mentor!
- Lý do hiện tại dự án đang giữ cú pháp `*ngIf` / `*ngFor` kết hợp `CommonModule` là để đảm bảo tương thích tuyệt đối 100% với bộ test JSDOM Opaque-box (`TEST_INFRA.md`) theo chuẩn Kế hoạch Training ban đầu.
- Tuy nhiên, vì các component của em đều là **Standalone Component** chuẩn Angular 21, nếu muốn chuyển sang `@if` / `@for`, em chỉ cần chạy duy nhất 1 lệnh CLI chính thức của nhóm kỹ sư Angular:
  ```bash
  ng generate @angular/core:control-flow
  ```
- Lệnh này sẽ tự động quét toàn bộ thư mục `src/app/`, viết lại toàn bộ template HTML từ `<div *ngIf="isLoggedIn">` thành `@if (isLoggedIn) { <div> }`, và tự động gỡ bỏ `CommonModule` ra khỏi mảng `imports` của các file `.ts` mà không làm thay đổi hay đổ vỡ bất kỳ logic nghiệp vụ nào!"*

---

### Q7: Trong `UserListComponent`, khi người dùng bấm Save hoặc Delete, tại sao em không thực thi ngay mà lại phải mở `confirmModalOpen`?
**Trả lời:** *"Thưa Mentor, đây là tiêu chuẩn thiết kế UI/UX an toàn cho ứng dụng quản trị doanh nghiệp (Safety Guardrail):
- Các hành động như cập nhật dữ liệu tài khoản (`PUT`) hoặc xóa vĩnh viễn hồ sơ người dùng (`DELETE`) là các hành động thay đổi trạng thái nhạy cảm (Destructive Actions).
- Việc chèn thêm một Overlay Modal xác nhận (`confirmModalOpen`) với thông báo rõ ràng (`Confirm Account Update / Deletion`) ngăn chặn tình trạng người dùng bấm nhầm phím hoặc lỡ tay click chuột, bảo vệ an toàn cho dữ liệu trong MongoDB và tuân thủ các kịch bản kiểm thử thực tế (Tier 4 Real-world Scenarios trong `TEST_INFRA.md`)."*

---

### Q8: Em hãy giải thích cơ chế Event Bubbling và `stopPropagation()` trong Vanilla JS thông qua code của em?
**Trả lời:** *"Thưa Mentor, trong file `vanilla-showcase.js`, em minh họa rõ ràng cơ chế lan truyền sự kiện của DOM:
- **Event Bubbling (Sủi bọt):** Khi một sự kiện (ví dụ click) xảy ra trên một phần tử con (Child element), sự kiện đó không chỉ chạy handler của chính nó mà còn tiếp tục 'sủi bọt' bay ngược lên các thẻ cha bên ngoài (`Parent` -> `Container` -> `document`).
- **`stopPropagation()`:** Trong hàm xử lý sự kiện của nút Child, em gọi `event.stopPropagation()`. Lệnh này lập tức cắt đứt luồng sủi bọt, khiến cho sự kiện click không thể bay tiếp lên thẻ cha. Điều này giải thích tại sao khi em bấm vào nút 'Đóng' bên trong Modal Vanilla JS, chỉ có Modal đóng lại chứ sự kiện click không bay ra ngoài làm kích hoạt lại sự kiện click của khối nền nền bên dưới!"*
