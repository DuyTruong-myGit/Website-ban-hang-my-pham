import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

// AI hỗ trợ: Sử dụng cấu hình API tập trung để hỗ trợ Deployment Dynamic
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
  // Lấy sản phẩm mới
  getNewArrivals: async () => {
    const res = await apiClient.get("/products/new-arrivals");
    return res.data;
  },
  // Lấy sản phẩm Flash Sale
  getFlashSale: async () => {
    const res = await apiClient.get("/products/flash-sale");
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
// === BRANDS ===
export const brandApi = {
  getAll: async () => {
    const res = await apiClient.get("/brands");
    return res.data;
  },
};
