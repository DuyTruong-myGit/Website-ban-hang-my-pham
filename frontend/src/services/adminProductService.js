import { API_BASE_URL } from "../config/apiConfig";

const API_BASE = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Lỗi không xác định" }));
    throw new Error(error.message || "Lỗi kết nối server");
  }
  return response.json();
};

// === ADMIN CATEGORIES API ===
export const adminCategoryApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
// === ADMIN BRANDS API ===
export const adminBrandApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/brands`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/brands`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/brands/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/brands/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// === ADMIN BANNERS API ===
export const adminBannerApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/banners`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/banners`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
// === ADMIN PRODUCTS API ===
export const adminProductApi = {
  getAll: async (params = {}) => {
    // Chuyển object params thành query string (vd: ?page=1&limit=20)
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// === UPLOAD API (Cloudinary) ===
export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Lấy token nhưng KHÔNG set Content-Type để trình duyệt tự set multipart/form-data boundary
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(res);
  },
};
