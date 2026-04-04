# KẾ HOẠCH DỰ ÁN MÔN 1
# Website Tư Vấn Mỹ Phẩm Chính Hãng
## Frontend: React + Bootstrap | Backend: Spring Boot + MongoDB

---

## 1. TỔNG QUAN CÔNG NGHỆ

| Layer | Công nghệ |
|---|---|
| **Frontend** | React, HTML, CSS, JavaScript, Bootstrap 5 |
| **Backend** | Spring Boot 3.x, Spring Data MongoDB, Spring Security + JWT |
| **Database** | MongoDB |
| **Realtime Chat** | Spring WebSocket (STOMP + SockJS) |
| **Upload ảnh** | Cloudinary (Spring SDK) |
| **Email** | JavaMailSender (Gmail SMTP - miễn phí) |
| **Security** | JWT Token, BCrypt, Spring Security Filter Chain |
| **Thanh toán** | Chỉ COD (thanh toán khi nhận hàng) |
| **Ngôn ngữ** | Tiếng Việt |

---

## 2. CẤU TRÚC THƯ MỤC

```
backend-springboot/
├── src/main/java/com/cosmetics/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── WebSocketConfig.java
│   │   ├── CloudinaryConfig.java
│   │   └── CorsConfig.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthFilter.java
│   │   └── CustomUserDetailsService.java
│   ├── model/          # MongoDB Document classes (18 collections)
│   │   ├── User.java
│   │   ├── Address.java
│   │   ├── Category.java
│   │   ├── Brand.java
│   │   ├── Product.java (embedded: Variant, Attribute)
│   │   ├── Inventory.java
│   │   ├── Cart.java (embedded: CartItem)
│   │   ├── Order.java (embedded: OrderItem, ShippingAddress, StatusHistory)
│   │   ├── Payment.java
│   │   ├── Review.java (embedded: AdminReply)
│   │   ├── Coupon.java
│   │   ├── Wishlist.java
│   │   ├── Notification.java
│   │   ├── Banner.java
│   │   ├── ChatRoom.java
│   │   ├── Message.java
│   │   ├── ProductQuestion.java
│   │   ├── SkinProfile.java        ← MỚI
│   │   ├── PageContent.java        ← MỚI
│   │   └── AdminLog.java
│   ├── repository/     # MongoRepository interfaces
│   ├── service/        # Business logic
│   ├── controller/     # REST API
│   ├── dto/            # Request/Response DTOs
│   ├── exception/      # GlobalExceptionHandler
│   └── util/           # Helpers
├── src/main/resources/
│   ├── application.properties
│   └── application-dev.properties
└── pom.xml
```

### Frontend (chung cho cả 2 môn)
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/        # Navbar, Footer, Sidebar, MegaMenu
│   │   ├── product/       # ProductCard, ProductGrid, VariantSelector
│   │   ├── cart/           # CartItem, CartSummary
│   │   ├── chat/          # ChatPopup, ChatBubble, ChatRoomList
│   │   ├── review/        # ReviewList, ReviewForm, RatingStars
│   │   ├── order/         # OrderCard, OrderTimeline
│   │   ├── admin/         # DataTable, StatsCard, Charts
│   │   └── common/        # Modal, Pagination, Loading, ImageUpload
│   ├── pages/
│   │   ├── customer/      # Home, ProductList, ProductDetail, Cart, Checkout, Account/*
│   │   ├── admin/         # Dashboard, Products, Categories, Orders, Users, Coupons, Reviews, Inventory, Banners, Reports, Logs
│   │   ├── staff/         # Dashboard, ChatManagement, Questions, Orders
│   │   └── auth/          # Login, Register, ForgotPassword, ResetPassword
│   ├── services/          # API calls (axios) — đổi BASE_URL để chuyển backend
│   ├── context/           # AuthContext, CartContext, ChatContext
│   ├── hooks/             # useAuth, useCart, useNotification
│   ├── utils/             # formatPrice, formatDate, constants
│   └── App.js             # Routes
└── package.json
```

---

## 3. DATABASE — CÁC COLLECTION (20 collections)

> 18 collection gốc + 2 collection mới (SkinProfile, PageContent)

| # | Collection | Mô tả |
|---|---|---|
| 1 | **users** | Người dùng (customer/staff/admin) |
| 2 | **addresses** | Địa chỉ giao hàng |
| 3 | **categories** | Danh mục sản phẩm (đa cấp parent-child) |
| 4 | **brands** | Thương hiệu |
| 5 | **products** | Sản phẩm (embedded: variants, attributes) |
| 6 | **inventories** | Tồn kho theo variant |
| 7 | **carts** | Giỏ hàng |
| 8 | **orders** | Đơn hàng |
| 9 | **payments** | Thanh toán (chỉ COD) |
| 10 | **reviews** | Đánh giá sản phẩm |
| 11 | **coupons** | Mã giảm giá |
| 12 | **wishlists** | Danh sách yêu thích |
| 13 | **notifications** | Thông báo |
| 14 | **banners** | Banner quảng cáo |
| 15 | **chatrooms** | Phòng chat tư vấn |
| 16 | **messages** | Tin nhắn chat |
| 17 | **productquestions** | Hỏi đáp sản phẩm |
| 18 | **adminlogs** | Log hành động admin/staff |
| 19 | **skinprofiles** | Hồ sơ da khách hàng ← MỚI |
| 20 | **pagecontents** | Trang nội dung tĩnh ← MỚI |

---

## 4. THIẾT KẾ TRANG (CHI TIẾT ĐỂ VẼ WIREFRAME)

### 🛒 A. TRANG KHÁCH HÀNG

#### A1. Trang Chủ (`/`)
- **Navbar**: Logo · Thanh tìm kiếm · Icon Thông báo (badge) · Icon Yêu thích (badge) · Icon Giỏ hàng (badge số lượng) · Nút Đăng nhập / Avatar dropdown (Tài khoản, Đơn hàng, Đăng xuất)
- **Mega Menu**: Danh mục cấp 1 → hover hiện danh mục cấp 2
- **Hero Banner**: Carousel banner (3-5 slides, auto-play, dots navigation)
- **Flash Sale**: Countdown timer + grid sản phẩm giảm giá (ảnh, tên, giá gốc gạch, giá sale, % giảm)
- **Danh mục nổi bật**: Grid icon (ảnh tròn + tên danh mục), click → trang danh mục
- **Sản phẩm bán chạy**: Carousel product cards (ảnh, badge, tên, brand, giá, rating sao, đã bán, nút Thêm giỏ)
- **Thương hiệu nổi bật**: Logo carousel các brand, click → trang brand
- **Sản phẩm mới**: Grid product cards (is_new=true)
- **Sản phẩm nổi bật**: Grid product cards (is_featured=true)
- **Footer**: Về chúng tôi · Chính sách (đổi trả, vận chuyển, bảo mật) · Hotline · Email · Icons mạng xã hội
- **Chat Button**: Floating button góc phải dưới → mở chat popup

#### A2. Trang Danh Mục / Kết quả tìm kiếm (`/category/:slug`, `/search?q=`)
- **Breadcrumb**: Trang chủ > Chăm sóc da > Kem dưỡng ẩm
- **Sidebar Filters**: Danh mục con (checkbox) · Thương hiệu (checkbox + search) · Khoảng giá (slider min-max) · Rating (1-5 sao) · Nút Áp dụng / Xóa lọc
- **Toolbar**: "X sản phẩm" · Sort: Phổ biến, Mới nhất, Giá tăng, Giá giảm, Bán chạy
- **Product Grid**: Product cards có: Ảnh · Badge (Sale/New/Bestseller) · Tên · Brand · Giá gốc gạch + Giá sale · Rating (sao + số review) · Nút Thêm giỏ · Icon Yêu thích
- **Pagination**: Số trang 1,2,3...

#### A3. Chi Tiết Sản Phẩm (`/product/:slug`)
- **Breadcrumb**
- **Gallery ảnh**: Ảnh lớn + thumbnails dưới, zoom on hover
- **Thông tin**: Tên SP · Brand (link) · Rating TB (sao + số đánh giá) · Đã bán: X · SKU
- **Giá**: Giá gốc gạch · Giá sale lớn đỏ · Badge "Giảm X%"
- **Chọn Variant**: Nút chọn size/shade/color, giá thay đổi theo variant
- **Tồn kho**: "Còn hàng" xanh / "Hết hàng" đỏ
- **Số lượng + CTA**: Input +/- · Nút "THÊM VÀO GIỎ" · Nút "MUA NGAY" · Icon Yêu thích
- **Mã giảm giá**: Danh sách coupon cho SP (code, mô tả, nút Sao chép)
- **Tabs**: Mô tả | Thành phần & Cách dùng | Thông tin SP (từ attributes)
- **Hỏi đáp**: Danh sách Q&A + Form đặt câu hỏi
- **Đánh giá**: Biểu đồ thanh 1-5 sao · Filter theo sao · Danh sách reviews (avatar, tên, sao, loại da, comment, ảnh, ngày, nút Hữu ích) · Form viết review (chỉ khi đã mua)
- **SP liên quan**: Carousel sản phẩm cùng danh mục

#### A4. Giỏ Hàng (`/cart`)
- Danh sách SP: Checkbox · Ảnh · Tên + variant · Đơn giá · Số lượng (+/-) · Thành tiền · Xóa
- Mã giảm giá: Input + Nút Áp dụng
- Tóm tắt: Tạm tính · Giảm giá · Phí ship · **Tổng cộng** · Nút "THANH TOÁN"

#### A5. Thanh Toán (`/checkout`)
- Chọn/thêm địa chỉ (Họ tên, SĐT, Tỉnh, Quận, Phường, Đường)
- DS sản phẩm (ảnh nhỏ, tên, variant, SL, giá)
- Phương thức TT: Chỉ COD
- Ghi chú textarea
- Tóm tắt: Tạm tính · Phí ship · Giảm giá · **Tổng** · Nút "ĐẶT HÀNG"

#### A6. Tài Khoản (`/account/*`)
- **Sidebar**: Avatar + Tên · Menu: Thông tin TK, Hồ sơ da, Đơn hàng, Địa chỉ, Yêu thích, Thông báo, Đổi MK, Đăng xuất
- **Thông tin TK** (`/account/profile`): Form avatar upload, họ tên, email (readonly), SĐT
- **Hồ sơ da** (`/account/skin-profile`): Loại da (dropdown) · Vấn đề da (multi-checkbox) · Dị ứng (tags) · Độ tuổi
- **Đơn hàng** (`/account/orders`): Tabs trạng thái · Card đơn hàng (mã, ngày, tổng, TT, nút Xem/Hủy/Đánh giá)
- **Chi tiết đơn** (`/account/orders/:id`): Timeline TT · Thông tin giao · DS SP · Thanh toán · Mã vận đơn
- **Địa chỉ** (`/account/addresses`): DS + Thêm/Sửa/Xóa/Đặt mặc định
- **Yêu thích** (`/account/wishlist`): Grid SP + Xóa + Thêm giỏ
- **Thông báo** (`/account/notifications`): DS thông báo + Đánh dấu đã đọc

#### A7. Đăng Nhập / Đăng Ký / Quên MK (`/login`, `/register`, `/forgot-password`)
- **Login**: Email · Password · Nhớ MK · Link Quên MK · Nút ĐĂNG NHẬP · Link Đăng ký
- **Register**: Họ tên · Email · SĐT · Password · Xác nhận MK · Checkbox điều khoản · Nút ĐĂNG KÝ
- **Quên MK**: Input email · Nút "Gửi link reset" → email chứa link reset → trang đặt MK mới

#### A8. Chat Popup (Floating)
- **Header**: Avatar + tên staff · Trạng thái Online/Offline · Nút đóng
- **Body**: Tin nhắn bubble trái/phải · Hỗ trợ ảnh · Timestamp
- **Footer**: Input nhắn · Nút gửi ảnh · Nút gửi
- **Pre-chat**: Chọn chủ đề trước khi bắt đầu chat

---

### 🔧 B. TRANG ADMIN (`/admin/*`)

#### B1. Dashboard — Stats cards (doanh thu, đơn mới, KH mới, SP hết hàng) · Biểu đồ doanh thu · Đơn gần đây · SP sắp hết
#### B2. Quản lý SP — Bảng CRUD + form thêm/sửa đầy đủ (variants, attributes, ảnh Cloudinary, flags, SEO)
#### B3. Quản lý Danh mục — Tree view + form (tên, slug, ảnh, parent, thứ tự, TT)
#### B4. Quản lý Thương hiệu — Bảng CRUD + form (tên, slug, logo, mô tả, xuất xứ, website)
#### B5. Quản lý Đơn hàng — Bảng + filter + chi tiết + đổi trạng thái + thông tin vận chuyển
#### B6. Quản lý KH & Staff — Bảng users + chi tiết (hồ sơ da, đơn hàng, tổng chi) + form tạo staff
#### B7. Quản lý Mã giảm giá — Bảng CRUD + form (code, loại, giá trị, điều kiện, thời gian)
#### B8. Quản lý Đánh giá — Bảng + trả lời + ẩn/hiện review
#### B9. Quản lý Tồn kho — Bảng + cảnh báo hết hàng (highlight đỏ) + cập nhật SL
#### B10. Quản lý Banner — Bảng CRUD + form (tiêu đề, ảnh, link, vị trí, thời gian)
#### B11. Báo cáo — Doanh thu (biểu đồ) · Top SP bán chạy · Top KH
#### B12. Admin Logs — Bảng logs hành động + filter

### 👩‍💼 C. TRANG STAFF (`/staff/*`)

#### C1. Dashboard — Stats: Chat chờ, Chat đang xử lý, Q&A chưa TL, Đơn cần xử lý
#### C2. Quản lý Chat (TRANG CHÍNH) — Sidebar DS phòng chat (Đang chờ/Của tôi/Đã đóng) · Vùng chat giữa · Panel phải: thông tin KH + hồ sơ da + đơn hàng gần đây
#### C3. Quản lý Hỏi đáp — Bảng Q&A + form trả lời
#### C4. Xử lý Đơn hàng — Giống admin orders nhưng chỉ xem + đổi trạng thái (không xóa)

---

## 5. BACKEND SPRING BOOT — CONTROLLERS & API

> Base URL: `http://localhost:8080/api`

### 5.1 AuthController (`/api/auth`)
| Method | Endpoint | Mô tả | Request | Response |
|---|---|---|---|---|
| POST | `/register` | Đăng ký | `{name, email, password, phone}` | `{success, message, data:{user}}` |
| POST | `/login` | Đăng nhập | `{email, password}` | `{success, data:{token, user}}` |
| POST | `/logout` | Đăng xuất | — | `{success, message}` |
| GET | `/me` | User hiện tại (JWT) | — | `{success, data:{user}}` |
| PUT | `/change-password` | Đổi MK | `{oldPassword, newPassword}` | `{success, message}` |
| POST | `/forgot-password` | Gửi link reset | `{email}` | `{success, message}` |
| POST | `/reset-password` | Đặt MK mới | `{token, newPassword}` | `{success, message}` |

### 5.2 UserController (`/api/users`)
| Method | Endpoint | Mô tả | Response |
|---|---|---|---|
| GET | `/profile` | Lấy profile | `{_id, name, email, phone, avatar_url, role}` |
| PUT | `/profile` | Cập nhật profile | `{success, data:{user}}` |
| GET | `/skin-profile` | Lấy hồ sơ da | `{skin_type, skin_concerns, allergies, age_range}` |
| PUT | `/skin-profile` | Cập nhật hồ sơ da | `{success, data:{skinProfile}}` |
| GET | `/` | [ADMIN] DS user | `{data:[users], pagination}` |
| GET | `/:id` | [ADMIN] Chi tiết | `{data:{user, orders_count, total_spent}}` |
| PUT | `/:id/status` | [ADMIN] Kích hoạt/vô hiệu | `{success}` |
| POST | `/staff` | [ADMIN] Tạo staff | `{success, data:{user}}` |

### 5.3 ProductController (`/api/products`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | DS SP (filter, sort, paginate) — Query: `?category=&brand=&minPrice=&maxPrice=&rating=&sort=price_asc|price_desc|newest|best_selling|rating&page=1&limit=20&search=&inStock=` |
| GET | `/:slug` | Chi tiết SP (populate brand, category, inventory) |
| GET | `/featured` | SP nổi bật (is_featured=true) |
| GET | `/best-sellers` | SP bán chạy (is_best_seller=true) |
| GET | `/new-arrivals` | SP mới (is_new=true) |
| GET | `/flash-sale` | SP đang giảm giá (sale_price > 0) |
| GET | `/related/:id` | SP liên quan (cùng category) |
| POST | `/` | [ADMIN] Tạo SP |
| PUT | `/:id` | [ADMIN] Cập nhật SP |
| DELETE | `/:id` | [ADMIN] Xóa SP |

**Response GET `/`:**
```json
{
  "data": [{"_id","name","slug","images","base_price","sale_price","avg_rating","review_count","sold_count","brand":{"name"},"category":{"name"},"is_new","is_best_seller","in_stock"}],
  "pagination": {"page","limit","total","totalPages"}
}
```

### 5.4 CategoryController (`/api/categories`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Tất cả DM (tree: parent → children) |
| GET | `/:slug` | Chi tiết DM |
| POST | `/` | [ADMIN] Tạo |
| PUT | `/:id` | [ADMIN] Sửa |
| DELETE | `/:id` | [ADMIN] Xóa |

### 5.5 BrandController (`/api/brands`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Tất cả brands |
| GET | `/:slug` | Chi tiết + SP |
| POST/PUT/DELETE | `/`, `/:id` | [ADMIN] CRUD |

### 5.6 CartController (`/api/cart`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Lấy giỏ hàng |
| POST | `/items` | Thêm SP `{product_id, variant_sku, quantity}` |
| PUT | `/items/:productId` | Cập nhật SL `{quantity}` |
| DELETE | `/items/:productId` | Xóa SP |
| DELETE | `/` | Xóa tất cả |

### 5.7 OrderController (`/api/orders`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/` | Tạo đơn `{address_id, coupon_code, note}` (payment_method mặc định COD) |
| GET | `/` | Đơn của user `?status=&page=` |
| GET | `/:id` | Chi tiết đơn |
| PUT | `/:id/cancel` | Hủy đơn (user) `{reason}` |
| GET | `/admin/orders` | [ADMIN/STAFF] Tất cả đơn |
| PUT | `/admin/orders/:id/status` | [ADMIN/STAFF] Đổi TT `{status, note, shipping_provider, tracking_number}` |

### 5.8 ReviewController (`/api/reviews`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/product/:productId` | Reviews SP + stats (avg, distribution) |
| POST | `/` | Tạo review `{product_id, order_id, rating, comment, images, skin_type}` |
| PUT | `/:id/helpful` | +1 helpful |
| PUT | `/admin/:id/reply` | [ADMIN] Trả lời `{content}` |
| PUT | `/admin/:id/toggle-hide` | [ADMIN] Ẩn/hiện |

### 5.9 CouponController (`/api/coupons`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/validate` | Kiểm tra mã `{code, order_value, product_ids}` → `{valid, discount_amount, message}` |
| GET | `/available` | Mã khả dụng cho user |
| GET/POST/PUT/DELETE | `/admin/coupons` | [ADMIN] CRUD |

### 5.10 Các Controller khác

| Controller | Endpoints chính |
|---|---|
| **WishlistController** `/api/wishlist` | GET `/` · POST `/:productId` · DELETE `/:productId` |
| **AddressController** `/api/addresses` | GET `/` · POST `/` · PUT `/:id` · DELETE `/:id` · PUT `/:id/default` |
| **NotificationController** `/api/notifications` | GET `/` · PUT `/:id/read` · PUT `/read-all` |
| **ChatController** `/api/chat` | POST `/rooms` · GET `/rooms` · GET `/rooms/:id/messages` · POST `/rooms/:id/messages` · PUT `/rooms/:id/close` · PUT `/rooms/:id/assign` · GET `/staff/pending` |
| **QuestionController** `/api/questions` | GET `/product/:productId` · POST `/` · PUT `/staff/:id/answer` |
| **InventoryController** `/api/admin/inventory` | GET `/` · PUT `/:id` · GET `/low-stock` |
| **BannerController** `/api/banners` | GET `/?position=hero` · POST/PUT/DELETE `/admin/banners` |
| **ReportController** `/api/admin/reports` | GET `/revenue?from=&to=` · GET `/top-products` · GET `/overview` |
| **AdminLogController** `/api/admin/logs` | GET `/?user=&action=&from=&to=` |
| **UploadController** `/api/upload` | POST `/image` (Cloudinary) → `{url}` |

### WebSocket (STOMP + SockJS)
```
Endpoint: /ws
Subscribe: /topic/chat/{roomId}
Send: /app/chat.send
Events: new_message, typing, message_read, room_assigned, room_closed
```

---

## 6. SPRING BOOT — CẤU HÌNH CHÍNH

### pom.xml dependencies
```
spring-boot-starter-web
spring-boot-starter-data-mongodb
spring-boot-starter-security
spring-boot-starter-websocket
spring-boot-starter-mail
spring-boot-starter-validation
jjwt (io.jsonwebtoken)
cloudinary-http45
lombok
```

### application.properties
```properties
server.port=8080
spring.data.mongodb.uri=mongodb://localhost:27017/cosmetics_db
jwt.secret=your-secret-key
jwt.expiration=86400000
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email
spring.mail.password=your-app-password
cloudinary.cloud-name=xxx
cloudinary.api-key=xxx
cloudinary.api-secret=xxx
```

---

## 7. PHÂN CHIA CÔNG VIỆC ĐỀ XUẤT (4 Phases)

### Phase 1 — Core (Tuần 1-2)
- [ ] Setup Spring Boot project + MongoDB connection
- [ ] Models (Document classes) cho 20 collections
- [ ] AuthController (register, login, JWT)
- [ ] ProductController + CategoryController + BrandController
- [ ] Frontend: Trang chủ, Danh mục, Chi tiết SP

### Phase 2 — E-Commerce (Tuần 3-4)
- [ ] CartController + OrderController (COD only)
- [ ] AddressController + CouponController
- [ ] WishlistController + ReviewController
- [ ] Frontend: Giỏ hàng, Checkout, Tài khoản, Đơn hàng

### Phase 3 — Chat & Admin (Tuần 5-6)
- [ ] ChatController + WebSocket setup
- [ ] QuestionController
- [ ] Admin: Dashboard, CRUD SP/DM/Brand/Đơn/Users/Coupons/Reviews
- [ ] Frontend: Chat popup, Admin panel, Staff panel

### Phase 4 — Polish (Tuần 7)
- [ ] InventoryController + BannerController
- [ ] ReportController + AdminLogController
- [ ] Email service (xác nhận đơn, chào mừng)
- [ ] Upload Cloudinary
- [ ] Testing + Bug fixes
