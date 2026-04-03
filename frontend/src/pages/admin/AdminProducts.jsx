import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/admin/ImageUpload";
import {
  adminProductApi,
  adminCategoryApi,
  adminBrandApi,
  uploadApi,
} from "../../services/adminProductService";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ĐÃ CẬP NHẬT: Bổ sung tags, attributes và variants vào state mặc định
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    categoryId: "",
    brandId: "",
    basePrice: 0,
    salePrice: 0,
    images: [],
    shortDescription: "",
    description: "",
    tags: "", // tags để dạng string cách nhau dấu phẩy cho dễ nhập
    attributes: [], // Mảng động [{key: "", value: ""}]
    variants: [], // Mảng động [{sku: "", name: "", price: 0, salePrice: 0}]
    inStock: true,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        adminProductApi.getAll({ page, limit: 10 }),
        adminCategoryApi.getAll(),
        adminBrandApi.getAll(),
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data);
        if (prodRes.pagination) setTotalPages(prodRes.pagination.totalPages);
      }
      if (catRes.success) setCategories(catRes.data);
      if (brandRes.success) setBrands(brandRes.data);
    } catch (error) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ ...formData, name, slug });
  };

  // --- XỬ LÝ MẢNG ĐỘNG (ATTRIBUTES) ---
  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { key: "", value: "" }],
    });
  };
  const removeAttribute = (index) => {
    const newAttr = [...formData.attributes];
    newAttr.splice(index, 1);
    setFormData({ ...formData, attributes: newAttr });
  };
  const handleAttributeChange = (index, field, val) => {
    const newAttr = [...formData.attributes];
    newAttr[index][field] = val;
    setFormData({ ...formData, attributes: newAttr });
  };

  // --- XỬ LÝ MẢNG ĐỘNG (VARIANTS) ---
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { sku: "", name: "", price: 0, salePrice: 0 },
      ],
    });
  };
  const removeVariant = (index) => {
    const newVar = [...formData.variants];
    newVar.splice(index, 1);
    setFormData({ ...formData, variants: newVar });
  };
  const handleVariantChange = (index, field, val) => {
    const newVar = [...formData.variants];
    newVar[index][field] =
      field.includes("price") || field.includes("salePrice")
        ? Number(val)
        : val;
    setFormData({ ...formData, variants: newVar });
  };

  // --- XỬ LÝ UPLOAD ẢNH CHUNG ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadApi.uploadImage(file);
        if (res && res.success) uploadedUrls.push(res.data.url);
        else alert("Không thể upload ảnh: " + (res.message || "Lỗi server"));
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      alert("Lỗi kết nối mạng hoặc server không phản hồi.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async () => {
    try {
      // Ép kiểu Tags từ Chuỗi thành Mảng trước khi gửi xuống Backend
      const processedData = {
        ...formData,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t !== "")
          : [],
      };

      if (isEditing) await adminProductApi.update(currentId, processedData);
      else await adminProductApi.create(processedData);

      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Lỗi lưu sản phẩm: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await adminProductApi.delete(currentId);
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      alert("Lỗi xóa sản phẩm: " + error.message);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      slug: "",
      sku: "",
      categoryId: "",
      brandId: "",
      basePrice: 0,
      salePrice: 0,
      images: [],
      shortDescription: "",
      description: "",
      tags: "",
      attributes: [],
      variants: [],
      inStock: true,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
    });
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setIsEditing(true);
    setCurrentId(prod.id || prod._id);
    setFormData({
      ...prod,
      images: prod.images || [],
      attributes: prod.attributes || [],
      variants: prod.variants || [],
      // Decode mảng tags thành chuỗi để dễ sửa
      tags: prod.tags && Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
    });
    setShowModal(true);
  };

  const columns = [
    {
      header: "Sản phẩm",
      render: (row) => (
        <div className="d-flex align-items-center gap-3">
          <img
            src={row.images?.[0] || "https://via.placeholder.com/50"}
            alt="sp"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "5px",
            }}
          />
          <div>
            <div
              className="fw-bold"
              style={{
                maxWidth: "200px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={row.name}
            >
              {row.name}
            </div>
            <div className="text-muted small">SKU: {row.sku || "N/A"}</div>
            {row.variants && row.variants.length > 0 && (
              <span className="badge bg-info mt-1">
                {row.variants.length} phân loại
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Giá bán",
      render: (row) => (
        <div>
          {row.salePrice > 0 ? (
            <>
              <span className="text-danger fw-bold">
                {row.salePrice.toLocaleString()}đ
              </span>{" "}
              <br />
              <del className="text-muted small">
                {row.basePrice?.toLocaleString()}đ
              </del>
            </>
          ) : (
            <span className="fw-bold">{row.basePrice?.toLocaleString()}đ</span>
          )}
        </div>
      ),
    },
    {
      header: "Thương hiệu",
      render: (row) =>
        brands.find((b) => b.id === row.brandId)?.name || row.brandId,
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <div className="d-flex flex-column gap-1">
          <span
            className={`admin-badge admin-badge-${row.inStock ? "success" : "danger"} text-center`}
          >
            {row.inStock ? "Còn hàng" : "Hết hàng"}
          </span>
          {!row.isActive && (
            <span className="admin-badge admin-badge-secondary text-center">
              Đang ẩn
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Hành động",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border"
            onClick={() => openEditModal(row)}
          >
            <i className="bi bi-pencil text-primary"></i>
          </button>
          <button
            className="btn btn-sm btn-light border"
            onClick={() => {
              setCurrentId(row.id || row._id);
              setShowDeleteModal(true);
            }}
          >
            <i className="bi bi-trash text-danger"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading && products.length === 0)
    return (
      <AdminLayout>
        <Loading message="Đang tải sản phẩm..." />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Sản phẩm</h4>
          <p className="text-muted mb-0">
            Quản lý thông tin, phân loại và giá bán
          </p>
        </div>
        <button
          className="btn text-white fw-medium px-4 py-2"
          style={{ background: "var(--admin-gradient-success)" }}
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg me-2"></i>Thêm Sản phẩm
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        emptyMessage="Chưa có sản phẩm nào."
      />
      <Pagination
        page={page - 1}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p + 1)}
      />

      {/* MODAL BỰ CHỨA FORM */}
      <Modal
        show={showModal}
        title={isEditing ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText="Lưu Sản Phẩm"
        size="lg"
      >
        <div
          className="row g-3"
          style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "hidden" }}
        >
          {/* ================= CỘT TRÁI ================= */}
          <div className="col-md-7 border-end pe-3">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
              1. Thông tin cơ bản
            </h6>
            <div className="mb-3">
              <label className="form-label small fw-medium">
                Tên sản phẩm <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-medium">Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-medium">
                  Mã SP chung (SKU)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-medium">
                  Danh mục <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-medium">
                  Thương hiệu <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.brandId}
                  onChange={(e) =>
                    setFormData({ ...formData, brandId: e.target.value })
                  }
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">
                Tags (Cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: bestseller, k-beauty, da-mun"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">
                Tóm tắt sản phẩm
              </label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">
                Mô tả chi tiết (Hỗ trợ HTML)
              </label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>

            {/* DYNAMIC FORM: THUỘC TÍNH */}
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 className="fw-bold mb-0 text-primary">
                  2. Thuộc tính chi tiết (Attributes)
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addAttribute}
                >
                  <i className="bi bi-plus"></i> Thêm
                </button>
              </div>
              {formData.attributes.map((attr, index) => (
                <div
                  key={index}
                  className="row g-2 mb-2 align-items-center bg-light p-2 rounded"
                >
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tên (VD: Thành phần)"
                      value={attr.key}
                      onChange={(e) =>
                        handleAttributeChange(index, "key", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-7">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Giá trị (VD: Water, Glycerin...)"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-1 text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger px-2 py-1"
                      onClick={() => removeAttribute(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              {formData.attributes.length === 0 && (
                <p className="text-muted small fst-italic">
                  Chưa có thuộc tính nào.
                </p>
              )}
            </div>
          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="col-md-5 ps-3">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
              3. Giá mặc định & Hình ảnh
            </h6>
            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label small fw-medium">
                  Giá gốc chung (VNĐ) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label small fw-medium">
                  Giá Sale chung
                </label>
                <input
                  type="number"
                  className="form-control text-danger fw-bold"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salePrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <ImageUpload
              images={formData.images}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              uploading={uploading}
            />

            {/* DYNAMIC FORM: BIẾN THỂ */}
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 className="fw-bold mb-0 text-primary">
                  4. Phân loại (Variants)
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={addVariant}
                >
                  <i className="bi bi-plus"></i> Thêm loại
                </button>
              </div>
              {formData.variants.map((v, index) => (
                <div
                  key={index}
                  className="bg-light p-2 mb-3 rounded border border-success border-opacity-25"
                >
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold small">
                      Phân loại #{index + 1}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger p-0 px-1"
                      onClick={() => removeVariant(index)}
                    >
                      <i className="bi bi-x"></i> Bỏ
                    </button>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Mã SKU riêng"
                        value={v.sku}
                        onChange={(e) =>
                          handleVariantChange(index, "sku", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Tên (VD: 50ml, Đỏ)"
                        value={v.name}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Giá gốc"
                        value={v.price}
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm text-danger fw-bold"
                        placeholder="Giá Sale"
                        value={v.salePrice}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "salePrice",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.variants.length === 0 && (
                <p className="text-muted small fst-italic">
                  Sản phẩm này không có nhiều phân loại.
                </p>
              )}
            </div>

            <h6 className="fw-bold mb-2 mt-4 border-bottom pb-2 text-primary">
              5. Trạng thái (Flags)
            </h6>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <label className="form-check-label small">
                Hiển thị trên website
              </label>
            </div>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) =>
                  setFormData({ ...formData, inStock: e.target.checked })
                }
              />
              <label className="form-check-label small">
                Còn hàng (In Stock)
              </label>
            </div>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
              />
              <label className="form-check-label small text-primary fw-medium">
                Sản phẩm nổi bật (Trang chủ)
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) =>
                  setFormData({ ...formData, isBestSeller: e.target.checked })
                }
              />
              <label className="form-check-label small text-success fw-medium">
                Bán chạy (Trang chủ)
              </label>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        show={showDeleteModal}
        title="Xác nhận xóa"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Xóa sản phẩm"
        confirmVariant="danger"
      >
        <p className="text-danger mb-0">
          Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn? Hành động này không
          thể hoàn tác.
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
