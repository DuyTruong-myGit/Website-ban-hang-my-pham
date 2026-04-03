# Hướng Dẫn Test Chức Năng Giỏ Hàng (Cart) — TV3

---

## BƯỚC 1 — Khởi động hệ thống

### 1.1 Kiểm tra file .env Backend

Mở file `backend-springboot/.env`, đảm bảo có đủ:
```
MONGODB_URI=mongodb://localhost:27017/cosmetics_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=86400000
MAIL_USERNAME=...
MAIL_PASSWORD=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
> Nếu chưa có Cloudinary/Mail thì copy từ `.env.example` và điền tạm,
> riêng MONGODB_URI và JWT_SECRET là BẮT BUỘC phải có.

---

### 1.2 Chạy Backend

Mở terminal tại thư mục `backend-springboot/`:
```bash
./mvnw spring-boot:run
```
Hoặc trên Windows:
```bash
mvnw.cmd spring-boot:run
```
Đợi thấy dòng: `Started CosmeticsApplication in X seconds` là OK.
Backend chạy tại: **http://localhost:8080**

---

### 1.3 Khởi động Frontend

Mở terminal tại thư mục `frontend/`:
```bash
npm run dev
```
Frontend chạy tại: **http://localhost:5173**

---

## BƯỚC 2 — Test API bằng Postman (Backend only)

### 2.1 Đăng nhập để lấy JWT Token

**POST** `http://localhost:8080/api/auth/login`

Headers:
```
Content-Type: application/json
```

Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

> Nếu chưa có user, đăng ký trước qua POST /api/auth/register

Kết quả trả về sẽ có `token`. Copy token này để dùng cho các bước tiếp theo.

---

### 2.2 Set Authorization Header (dùng cho tất cả request Cart)

Trong Postman, tab **Authorization**:
- Type: `Bearer Token`
- Token: `<dán token vừa lấy vào đây>`

---

### 2.3 Test GET /api/cart — Lấy giỏ hàng

**GET** `http://localhost:8080/api/cart`

Kết quả mong đợi (giỏ rỗng lần đầu):
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "items": []
  }
}
```

---

### 2.4 Test POST /api/cart/items — Thêm sản phẩm

> Cần có sẵn 1 product trong MongoDB. Lấy productId từ collection products.

**POST** `http://localhost:8080/api/cart/items`

Body:
```json
{
  "productId": "ID_PRODUCT_THỰC_TẾ",
  "quantity": 2
}
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Đã thêm sản phẩm vào giỏ hàng.",
  "data": {
    "items": [
      {
        "productId": "...",
        "name": "...",
        "price": 250000,
        "quantity": 2
      }
    ]
  }
}
```

**Test thêm lần 2 cùng sản phẩm** → quantity phải cộng dồn (2+2=4)

---

### 2.5 Test PUT /api/cart/items/{productId} — Cập nhật số lượng

**PUT** `http://localhost:8080/api/cart/items/ID_PRODUCT`

Body:
```json
{
  "productId": "ID_PRODUCT",
  "quantity": 5
}
```

Kết quả: quantity trong giỏ phải thành 5.

---

### 2.6 Test DELETE /api/cart/items/{productId} — Xóa 1 sản phẩm

**DELETE** `http://localhost:8080/api/cart/items/ID_PRODUCT`

Kết quả: item đó biến mất khỏi `items[]`.

---

### 2.7 Test DELETE /api/cart — Xóa toàn bộ giỏ

**DELETE** `http://localhost:8080/api/cart`

Kết quả:
```json
{
  "success": true,
  "message": "Đã xóa toàn bộ giỏ hàng."
}
```

---

### 2.8 Test lỗi — Không gửi token

Thử gọi bất kỳ endpoint cart mà không có Authorization header.

Kết quả mong đợi: `401 Unauthorized`

---

## BƯỚC 3 — Test trên giao diện Web (Frontend)

### 3.1 Truy cập trang giỏ hàng

Mở trình duyệt → `http://localhost:5173/cart`

**Chưa đăng nhập**: Phải hiện thông báo "Vui lòng đăng nhập"

---

### 3.2 Đăng nhập

Vào `http://localhost:5173/login` → nhập email/password → đăng nhập.

---

### 3.3 Thêm sản phẩm vào giỏ (cần TV2 làm xong trang SP)

Nếu TV2 chưa làm trang sản phẩm, test trực tiếp qua Postman (BƯỚC 2.4)
rồi vào `http://localhost:5173/cart` để kiểm tra hiển thị.

---

### 3.4 Kiểm tra giao diện trang Cart

Sau khi có sản phẩm trong giỏ, kiểm tra từng thứ:

| Mục cần check | Kết quả mong đợi |
|---|---|
| Ảnh sản phẩm | Hiển thị đúng ảnh (hoặc icon placeholder nếu không có ảnh) |
| Tên & Variant | Hiển thị đúng tên và tên variant (nếu có) |
| Giá đơn vị | Hiển thị đúng giá (định dạng VND) |
| Nút + | Tăng số lượng lên 1 |
| Nút − | Giảm số lượng (disabled khi = 1) |
| Thành tiền | = giá × số lượng, tự cập nhật khi thay đổi |
| Nút thùng rác | Xóa item, còn lại vẫn hiển thị bình thường |
| Phí ship | < 500k → hiện "30.000 đ", >= 500k → "Miễn phí" |
| Thông báo cần thêm | "Mua thêm X đ để được miễn phí vận chuyển" |
| Xóa tất cả | Click 1 lần → nút chuyển vàng "Xác nhận?", click 2 lần → xóa hết |
| Giỏ rỗng | Hiện icon + animation + nút "Tiếp tục mua sắm" |
| Toast thông báo | Hiện 3 giây rồi tự mất sau khi thêm/xóa |

---

## BƯỚC 4 — Kiểm tra MongoDB (tùy chọn)

Dùng **MongoDB Compass** hoặc **mongosh** kết nối `localhost:27017`.

Vào database `cosmetics_db`, collection `carts`:

```js
// Xem tất cả giỏ hàng
db.carts.find()

// Xem giỏ của 1 user cụ thể
db.carts.findOne({ user_id: "ID_USER" })
```

---

## Các Lỗi Thường Gặp & Cách Xử Lý

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `401 Unauthorized` | Token hết hạn hoặc thiếu | Đăng nhập lại lấy token mới |
| `Sản phẩm không tồn tại` | productId sai | Kiểm tra lại ID trong collection products |
| `Connection refused 8080` | Backend chưa chạy | Chạy `mvnw spring-boot:run` |
| `CORS Error` | Frontend không phải port 5173 | Kiểm tra SecurityConfig.java |
| Giỏ hàng không load | Token không được gắn | Kiểm tra localStorage có `token` không |
