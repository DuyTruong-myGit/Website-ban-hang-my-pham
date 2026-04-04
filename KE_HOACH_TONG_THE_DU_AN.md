# KẾ HOẠCH TỔNG THỂ DỰ ÁN CUỐI KỲ
# Website Tư Vấn & Kinh Doanh Mỹ Phẩm Chính Hãng (Hasaki Clone)

> // AI hỗ trợ: Bản kế hoạch được tối ưu bám sát YCCK.txt, tách biệt 2 repo và đơn giản hóa quy trình nhánh.

---

## 1. CẤU TRÚC LƯU TRỮ (REPOSITORIES)
Dự án được chia thành 2 kho lưu trữ mã nguồn riêng biệt để phục vụ 2 môn học.

| Repo | Nội dung | Công nghệ | Workflow |
|---|---|---|---|
| **Repo 1 (Chính)** | Frontend + Backend Java | ReactJS + Spring Boot | Chặt chẽ (Master/Develop/Feature) |
| **Repo 2 (Phụ)** | Backend Node.js | Node.js (Express) | Đơn giản (Không yêu cầu workflow) |

---

## 2. PHÂN CÔNG 5 THÀNH VIÊN
*Mỗi thành viên phụ trách Fullstack phần việc của mình trên cả 2 Repos.*

| Thành viên | Chức năng phụ trách | Giao diện (Frontend) |
|---|---|---|
| **TV1 (Lead)** | Auth, Profile & Infra | Login, Register, Account, Skin Profile |
| **TV2** | Danh mục & Sản phẩm | Home, Category, Product Detail, Search |
| **TV3** | Giỏ hàng & Đơn hàng | Cart, Checkout, Order History |
| **TV4** | Tương tác & Hỗ trợ | Chat Popup, Review, Q&A, Wishlist |
| **TV5** | Quản trị & Báo cáo | Admin Dashboard, Inventory, Logs |

---

## 3. QUY TRÌNH NHÁNH (GIT WORKFLOW)

### 3.1 Tại Repo Chính (Java + Frontend)
Sử dụng cấu trúc nhánh phân cấp theo loại tác vụ (`ui`, `api`, `admin`) để quản lý chi tiết:

- **Nhánh lõi:** `master` (Bản chuẩn), `develop` (Bành tích hợp).
- **Phân nhóm nhánh tính năng (Đề tài Mỹ phẩm):**
    - `feature/admin/repository-setup` (Khởi tạo repo Java/FE)
    - `feature/admin/security-config` (JWT & Phân quyền)
    - `feature/admin/user-management` (Quản trị người dùng)
    - `feature/admin/content-management` (Quản lý Banner, Page)
    - `feature/ui/home-page` (Giao diện Trang chủ)
    - `feature/ui/product-browsing` (Tìm kiếm & Lọc sản phẩm)
    - `feature/ui/product-details` (Trang chi tiết sản phẩm)
    - `feature/ui/skin-profile-quiz` (Trắc nghiệm loại da)
    - `feature/ui/checkout-flow` (Giỏ hàng & Thanh toán)
    - `feature/api/product-service` (API Sản phẩm & Danh mục)
    - `feature/api/order-service` (API Đơn hàng & Inventory)
    - `feature/api/chat-service` (API Chat tư vấn & Review)
    - `feature/api/report-service` (API Thống kê doanh thu)

*Lưu ý: Tên nhánh phải mô tả đúng thành phần và tác vụ thực hiện.*

### 3.2 Tại Repo Node.js
- **Quy tắc:** Không yêu cầu Workflow chặt chẽ. Thành viên có thể commit trực tiếp hoặc chia nhánh đơn giản tùy ý để hoàn thành bài tập môn "Ngôn ngữ mới".

---

## 4. TIÊU CHUẨN JIRA (Dành cho báo cáo)
*Mục tiêu tối thiểu để đạt điểm tối đa theo YCCK.txt:*
- **10 Epics:** Chia theo các nhóm chức năng ở mục 2.
- **20 Stories:** Mỗi thành viên viết ít nhất 4 stories cho phần việc của mình.
- **30-40 Tasks:** Bẻ nhỏ stories thành các task code FE, code BE, test.
- **5 Bugs:** Log và fix các lỗi phát sinh trong quá trình ghép nối.

---

## 5. THỰC THI (IMPLEMENTATION)
- **API Consistency:** Dù làm trên 2 repo khác nhau, nhưng định dạng JSON API phải giống hệt nhau để Frontend có thể đổi URL là chạy được với cả 2 backend.
- **AI Integration:** Tất cả các thành viên phải sử dụng AI hỗ trợ viết code và ghi chú lại để đưa vào báo cáo cuối kỳ.

---
*Bản kế hoạch này là bản chuẩn cuối cùng, thay thế cho các tài liệu trước đó.*
