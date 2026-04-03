import axios from "axios";

// Khởi tạo trực tiếp API Client không cần import file bên ngoài
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// === PRODUCTS ===
export const productApi = {
  // Lấy danh sách có phân trang và bộ lọc
  getProducts: async (params) => {
    const res = await apiClient.get("/products", { params });
    return res.data;
  },
  // Lấy chi tiết bằng slug
  getBySlug: async (slug) => {
    const res = await apiClient.get(`/products/${slug}`);
    return res.data;
  },
  // Dành cho trang chủ
  getBestSellers: async () => {
    const res = await apiClient.get("/products/best-sellers");
    return res.data;
  },
  getFeatured: async () => {
    const res = await apiClient.get("/products/featured");
    return res.data;
  },
};

// === CATEGORIES ===
export const categoryApi = {
  getTree: async () => {
    const res = await apiClient.get("/categories");
    return res.data;
  },
  // Lấy chi tiết danh mục bằng slug
    getBySlug: async (slug) => {
        const res = await apiClient.get(`/categories/${slug}`);
        return res.data;
    },
};

// === BANNERS ===
export const bannerApi = {
  getByPosition: async (position) => {
    const res = await apiClient.get(`/banners?position=${position}`);
    return res.data;
  },
};
