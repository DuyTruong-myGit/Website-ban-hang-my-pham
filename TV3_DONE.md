# TV3 — Giỏ hàng (Cart) | Ngày làm: 04/04/2026

---

## BACKEND

### [MỚI] model/Cart.java
MongoDB document lưu giỏ hàng của user.
Có embedded class `CartItem` gồm: productId, variantSku, name, imageUrl, variantName, price, quantity.
Mỗi user có đúng 1 document Cart (unique theo userId).

### [MỚI] repository/CartRepository.java
Interface MongoDB repository.
Có 2 method: `findByUserId` và `deleteByUserId`.

### [MỚI] dto/request/CartRequest.java
DTO nhận dữ liệu từ client khi thêm/cập nhật item giỏ hàng.
Gồm: productId (bắt buộc), variantSku (optional), quantity (>= 1).
Có validation annotation (@NotBlank, @Min).

### [MỚI] service/CartService.java
Business logic cho toàn bộ giỏ hàng:
- getCart: lấy giỏ hàng (trả về rỗng nếu chưa có)
- addItem: thêm sản phẩm, tự merge nếu đã có cùng productId + variantSku
- updateItem: cập nhật số lượng
- removeItem: xóa 1 item
- clearCart: xóa toàn bộ giỏ

### [MỚI] controller/CartController.java
5 REST endpoints:
- GET    /api/cart
- POST   /api/cart/items
- PUT    /api/cart/items/{productId}
- DELETE /api/cart/items/{productId}
- DELETE /api/cart
Lấy userId từ JWT qua @AuthenticationPrincipal (không cần client truyền).

### [SỬA] exception/ErrorCode.java
Bổ sung 4 error code mới:
PRODUCT_NOT_FOUND, PRODUCT_INACTIVE, CART_NOT_FOUND, CART_ITEM_NOT_FOUND.

### [SỬA] config/SecurityConfig.java
Thêm comment ghi rõ /api/cart/** và /api/orders/** yêu cầu JWT (đã được bảo vệ bởi anyRequest().authenticated()).

---

## FRONTEND

### [MỚI] services/cartService.js
5 hàm gọi API tương ứng với CartController:
getCart, addItem, updateItem, removeItem, clearCart.
Tự gắn Authorization Bearer token từ localStorage.

### [MỚI] context/CartContext.jsx
Global state management cho giỏ hàng.
Tự fetch khi user đăng nhập, tính totalItems + totalPrice.
Expose: addToCart, updateQuantity, removeItem, clearCart cho toàn app dùng.

### [MỚI] pages/Cart.jsx
Trang /cart đầy đủ gồm:
- Danh sách sản phẩm (ảnh, tên, variant, giá, +/- số lượng, xóa)
- Tóm tắt đơn hàng (tạm tính, phí ship, tổng cộng)
- Logic freeship: đơn >= 500k miễn phí, dưới thì hiện cần thêm bao nhiêu
- Trạng thái: loading, lỗi, giỏ rỗng (animation), notification toast
- Nút "Tiến hành thanh toán" → /checkout

### [MỚI] pages/Cart.css
Toàn bộ styling cho trang Cart.
Dùng màu hồng brand (#e91e8c), gradient, border-radius bo tròn.
Có animation float (empty state), slideDown (toast), shake (xác nhận xóa).
Responsive cho mobile.

### [SỬA] App.jsx
- Import CartProvider và Cart component
- Wrap toàn app bằng <CartProvider>
- Thêm route: /cart → <Cart />
