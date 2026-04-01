# PHÂN CÔNG 5 THÀNH VIÊN — ƯU TIÊN SPRING BOOT
# Deadline: ~5 ngày | Mỗi người làm Backend + Frontend phần mình

---

## ⏰ TIMELINE ĐỀ XUẤT

| Ngày | Việc cần làm |
|---|---|
| **Ngày 1** | TV1 setup project Spring Boot + MongoDB + cấu trúc thư mục. **Tất cả** clone về và bắt đầu code backend phần mình |
| **Ngày 2-3** | Hoàn thành backend Spring Boot phần mình + test API bằng Postman |
| **Ngày 4** | Frontend React — mỗi người code trang mình phụ trách |
| **Ngày 5** | Ghép nối Frontend ↔ Backend, fix bug, test toàn bộ, deploy |

> ⚠️ **TV1 phải setup project trước rồi push lên Git để 4 người còn lại clone.**

---

## 👤 THÀNH VIÊN 1 — Auth & User (QUAN TRỌNG NHẤT, LÀM TRƯỚC)

### Backend Spring Boot
| Việc | Chi tiết |
|---|---|
| **Setup project** | Tạo Spring Boot project, cấu hình MongoDB, CORS, cấu trúc thư mục |
| **Security** | Spring Security + JWT (JwtTokenProvider, JwtAuthFilter, SecurityConfig) |
| **AuthController** | POST `/api/auth/register` · `/login` · `/logout` · `/me` · `/change-password` · `/forgot-password` · `/reset-password` |
| **UserController** | GET/PUT `/api/users/profile` · GET/PUT `/api/users/skin-profile` · GET `/api/users` [ADMIN] · GET `/api/users/:id` [ADMIN] · PUT `/api/users/:id/status` [ADMIN] · POST `/api/users/staff` [ADMIN] |
| **AddressController** | GET/POST/PUT/DELETE `/api/addresses` · PUT `/api/addresses/:id/default` |
| **Models** | User, Address, SkinProfile |
| **Email** | JavaMailSender config — gửi email chào mừng + link reset password |

### Frontend React
| Trang | Mô tả |
|---|---|
| **Login** `/login` | Form email + password, nút đăng nhập, link quên MK, link đăng ký |
| **Register** `/register` | Form họ tên, email, SĐT, password, xác nhận MK |
| **Quên MK** `/forgot-password` | Input email + nút gửi link |
| **Reset MK** `/reset-password` | Input MK mới + xác nhận |
| **Tài khoản** `/account/profile` | Form sửa avatar, họ tên, SĐT |
| **Hồ sơ da** `/account/skin-profile` | Form loại da, vấn đề da, dị ứng, độ tuổi |
| **Địa chỉ** `/account/addresses` | CRUD địa chỉ, đặt mặc định |
| **Layout chung** | Component `Navbar` + `Footer` + `AuthContext` + `PrivateRoute` |

> 🔴 **Ưu tiên cao nhất**: Auth phải xong sớm vì tất cả API khác đều cần JWT token.

---

## 👤 THÀNH VIÊN 2 — Sản phẩm & Danh mục

### Backend Spring Boot
| Việc | Chi tiết |
|---|---|
| **ProductController** | GET `/api/products` (filter, sort, paginate) · `/:slug` · `/featured` · `/best-sellers` · `/new-arrivals` · `/flash-sale` · `/related/:id` · POST/PUT/DELETE [ADMIN] |
| **CategoryController** | GET `/api/categories` (tree) · `/:slug` · POST/PUT/DELETE [ADMIN] |
| **BrandController** | GET `/api/brands` · `/:slug` · POST/PUT/DELETE [ADMIN] |
| **BannerController** | GET `/api/banners?position=` · POST/PUT/DELETE `/api/admin/banners` [ADMIN] |
| **UploadController** | POST `/api/upload/image` — tích hợp Cloudinary |
| **Models** | Product (+ Variant, Attribute embedded), Category, Brand, Banner |

### Frontend React
| Trang | Mô tả |
|---|---|
| **Trang chủ** `/` | Hero banner carousel, flash sale (countdown), danh mục nổi bật, SP bán chạy, brand carousel, SP mới, SP nổi bật |
| **Danh mục** `/category/:slug` | Breadcrumb, sidebar filter (DM/brand/giá/rating), toolbar sort, product grid, pagination |
| **Tìm kiếm** `/search?q=` | Giống trang danh mục nhưng theo keyword |
| **Chi tiết SP** `/product/:slug` | Gallery ảnh, thông tin SP, chọn variant, giá, tồn kho, tabs mô tả/thành phần, SP liên quan |
| **Admin SP** `/admin/products` | Bảng CRUD sản phẩm + form thêm/sửa (variants, attributes, ảnh) |
| **Admin DM** `/admin/categories` | Tree view + form CRUD |
| **Admin Brand** `/admin/brands` | Bảng CRUD |
| **Admin Banner** `/admin/banners` | Bảng CRUD |
| **Components** | `ProductCard`, `ProductGrid`, `VariantSelector`, `ImageUpload`, `MegaMenu` |

---

## 👤 THÀNH VIÊN 3 — Giỏ hàng & Đơn hàng

### Backend Spring Boot
| Việc | Chi tiết |
|---|---|
| **CartController** | GET `/api/cart` · POST `/api/cart/items` · PUT `/api/cart/items/:productId` · DELETE `/api/cart/items/:productId` · DELETE `/api/cart` |
| **OrderController** | POST `/api/orders` (tạo đơn COD) · GET `/api/orders` · GET `/api/orders/:id` · PUT `/api/orders/:id/cancel` · GET `/api/admin/orders` [ADMIN/STAFF] · PUT `/api/admin/orders/:id/status` [ADMIN/STAFF] |
| **CouponController** | POST `/api/coupons/validate` · GET `/api/coupons/available` · CRUD `/api/admin/coupons` [ADMIN] |
| **PaymentController** | GET `/api/payments/:orderId` (chỉ COD, ghi nhận trạng thái) |
| **Models** | Cart (+ CartItem), Order (+ OrderItem, ShippingAddress, StatusHistory), Payment, Coupon |

### Frontend React
| Trang | Mô tả |
|---|---|
| **Giỏ hàng** `/cart` | DS SP (ảnh, tên, variant, giá, SL +/-, thành tiền, xóa), mã giảm giá, tóm tắt, nút thanh toán |
| **Checkout** `/checkout` | Chọn địa chỉ, DS SP, PT thanh toán (COD), ghi chú, tóm tắt, nút đặt hàng |
| **Đơn hàng** `/account/orders` | Tabs trạng thái, card đơn hàng, nút xem/hủy/đánh giá |
| **Chi tiết đơn** `/account/orders/:id` | Timeline trạng thái, thông tin giao hàng, DS SP, thanh toán |
| **Admin Đơn hàng** `/admin/orders` | Bảng đơn hàng + filter + đổi trạng thái + thêm mã vận đơn |
| **Admin Coupon** `/admin/coupons` | Bảng CRUD mã giảm giá |
| **Components** | `CartItem`, `CartSummary`, `OrderCard`, `OrderTimeline`, `CartContext` |

---

## 👤 THÀNH VIÊN 4 — Chat & Đánh giá

### Backend Spring Boot
| Việc | Chi tiết |
|---|---|
| **ChatController** | POST `/api/chat/rooms` · GET `/api/chat/rooms` · GET `/api/chat/rooms/:id/messages` · POST `/api/chat/rooms/:id/messages` · PUT `/api/chat/rooms/:id/close` · PUT `/api/chat/rooms/:id/assign` · GET `/api/staff/chat/pending` |
| **WebSocket** | Spring WebSocket config (STOMP + SockJS) — events: new_message, typing, message_read |
| **ReviewController** | GET `/api/reviews/product/:productId` · POST `/api/reviews` · PUT `/api/reviews/:id/helpful` · PUT `/api/admin/reviews/:id/reply` · PUT `/api/admin/reviews/:id/toggle-hide` |
| **QuestionController** | GET `/api/questions/product/:productId` · POST `/api/questions` · PUT `/api/staff/questions/:id/answer` |
| **WishlistController** | GET/POST/DELETE `/api/wishlist` |
| **NotificationController** | GET `/api/notifications` · PUT `/api/notifications/:id/read` · PUT `/api/notifications/read-all` |
| **Models** | ChatRoom, Message, Review, ProductQuestion, Wishlist, Notification |

### Frontend React
| Trang | Mô tả |
|---|---|
| **Chat Popup** | Floating button, popup: header (staff info), body (messages bubble), footer (input + gửi ảnh), pre-chat chọn chủ đề |
| **Staff Chat** `/staff/chats` | Sidebar DS phòng chat (chờ/của tôi/đã đóng), vùng chat giữa, panel phải info KH (hồ sơ da, đơn hàng) |
| **Staff Q&A** `/staff/questions` | Bảng câu hỏi + form trả lời |
| **Yêu thích** `/account/wishlist` | Grid SP + xóa + thêm giỏ |
| **Thông báo** `/account/notifications` | DS thông báo + đánh dấu đã đọc |
| **Admin Reviews** `/admin/reviews` | Bảng đánh giá + trả lời + ẩn/hiện |
| **Component đánh giá** trong trang Chi tiết SP | ReviewList, ReviewForm, RatingStars (nhúng vào trang của TV2) |
| **Component hỏi đáp** trong trang Chi tiết SP | QuestionList, QuestionForm (nhúng vào trang của TV2) |
| **Components** | `ChatPopup`, `ChatBubble`, `ChatRoomList`, `ReviewList`, `ReviewForm`, `RatingStars`, `ChatContext` |

---

## 👤 THÀNH VIÊN 5 — Admin Dashboard & Quản lý

### Backend Spring Boot
| Việc | Chi tiết |
|---|---|
| **InventoryController** | GET `/api/admin/inventory` · PUT `/api/admin/inventory/:id` · GET `/api/admin/inventory/low-stock` |
| **ReportController** | GET `/api/admin/reports/overview` · `/revenue?from=&to=` · `/top-products` |
| **AdminLogController** | GET `/api/admin/logs` (filter user, action, date) |
| **PageContentController** | GET `/api/pages/:slug` · CRUD `/api/admin/pages` [ADMIN] |
| **Models** | Inventory, AdminLog, PageContent |
| **Middleware** | Tạo AdminLog middleware — tự động ghi log khi admin/staff thao tác |

### Frontend React
| Trang | Mô tả |
|---|---|
| **Admin Dashboard** `/admin/dashboard` | Stats cards (doanh thu, đơn mới, KH mới, SP hết hàng), biểu đồ doanh thu (chart.js), đơn gần đây, SP sắp hết |
| **Admin Users** `/admin/users` | Bảng KH + Staff, chi tiết user, form tạo staff |
| **Admin Tồn kho** `/admin/inventory` | Bảng tồn kho, cảnh báo hết hàng (highlight đỏ), cập nhật SL |
| **Admin Logs** `/admin/logs` | Bảng logs + filter |
| **Admin Sidebar** | Layout admin chung: sidebar menu + topbar |
| **Staff Dashboard** `/staff/dashboard` | Stats: chat chờ, đang xử lý, Q&A chưa TL |
| **Staff Đơn hàng** `/staff/orders` | Bảng đơn + đổi trạng thái (không xóa) |
| **Components** | `AdminLayout` (sidebar + topbar), `StatsCard`, `DataTable`, `Charts`, `Pagination`, `Modal`, `Loading` |

---

## 📋 QUY TẮC LÀM VIỆC CHUNG

### Git Branch
```
main
├── dev                    ← merge tất cả vào đây
│   ├── feature/auth       ← TV1
│   ├── feature/product    ← TV2
│   ├── feature/order      ← TV3
│   ├── feature/chat       ← TV4
│   └── feature/admin      ← TV5
```

### API Response Format (BẮT BUỘC THỐNG NHẤT)
```json
// Thành công
{ "success": true, "data": { ... }, "message": "..." }

// Thành công có phân trang
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }

// Lỗi
{ "success": false, "message": "Mô tả lỗi" }
```

### Cấu trúc thư mục Spring Boot
```
src/main/java/com/cosmetics/
├── config/          ← TV1 tạo
├── security/        ← TV1 tạo
├── model/           ← Mỗi người tạo model của mình
├── repository/      ← Mỗi người tạo repo của mình
├── service/         ← Mỗi người tạo service của mình
├── controller/      ← Mỗi người tạo controller của mình
├── dto/             ← Mỗi người tạo DTO của mình
└── exception/       ← TV1 tạo GlobalExceptionHandler
```

### Dependencies chung (pom.xml — TV1 setup)
```
spring-boot-starter-web, spring-boot-starter-data-mongodb,
spring-boot-starter-security, spring-boot-starter-websocket,
spring-boot-starter-mail, spring-boot-starter-validation,
jjwt, cloudinary-http45, lombok
```

---

## ⚡ THỨ TỰ ƯU TIÊN

```
TV1 (Auth) phải xong TRƯỚC → Các TV khác mới test API được (cần JWT token)
      ↓
TV2 (Product) + TV3 (Order) + TV4 (Chat) + TV5 (Admin) → làm SONG SONG
      ↓
Ngày 4-5: Tất cả chuyển sang Frontend → ghép nối → test → nộp
```
