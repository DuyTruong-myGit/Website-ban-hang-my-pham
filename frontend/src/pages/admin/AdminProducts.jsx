import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/admin/ImageUpload";
import usePageTitle from "../../hooks/usePageTitle";
import {
  adminProductApi,
  adminCategoryApi,
  adminBrandApi,
  uploadApi,
} from "../../services/adminProductService";

const AdminProducts = () => {
  usePageTitle("Quản lý Sản phẩm");

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

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    categoryId: "",
    brandId: "",
    basePrice: 0,
    salePrice: 0,
    stock: 0,
    description: "",
    shortDescription: "",
    images: [],
    tags: "",
    isActive: true,
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
    inStock: true,
    variants: [],
    attributes: [],
  });

  const flattenCategories = (tree, prefix = "") => {
    let result = [];
    tree.forEach((cat) => {
      result.push({ ...cat, displayName: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, prefix + "— "));
      }
    });
    return result;
  };

  const fetchData = async (currentPage = 1) => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        adminProductApi.getAll({ page: currentPage, limit: 10 }),
        adminCategoryApi.getAll(),
        adminBrandApi.getAll(),
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data);
        if (prodRes.pagination) setTotalPages(prodRes.pagination.totalPages);
      }
      if (catRes.success) setCategories(flattenCategories(catRes.data));
      if (brandRes.success) setBrands(brandRes.data);
    } catch (error) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a")
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e")
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, "i")
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o")
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u")
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y")
      .replace(/đ/gi, "d")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      slug: isEditing ? formData.slug : generateSlug(newName),
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadApi.uploadImage(file);
        if (res.success) uploadedUrls.push(res.data.url);
      }
      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
      });
    } catch (error) {
      alert("Lỗi upload ảnh: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { key: "", value: "" }],
    });
  };

  const updateAttribute = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const removeAttribute = (index) => {
    const newAttributes = [...formData.attributes];
    newAttributes.splice(index, 1);
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { sku: "", name: "", price: 0, salePrice: 0, stock: 0, images: [] },
      ],
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      slug: "",
      sku: "",
      categoryId: "",
      brandId: "",
      basePrice: 0,
      salePrice: 0,
      stock: 0,
      description: "",
      shortDescription: "",
      images: [],
      tags: "",
      isActive: true,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      inStock: true,
      variants: [],
      attributes: [],
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (prod) => {
    setCurrentId(prod.id || prod._id);
    setFormData({
      name: prod.name || "",
      slug: prod.slug || "",
      sku: prod.sku || "",
      categoryId: prod.categoryId || prod.category_id || "",
      brandId: prod.brandId || prod.brand_id || "",
      basePrice: prod.basePrice || prod.base_price || 0,
      salePrice: prod.salePrice || prod.sale_price || 0,
      stock: prod.stock || 0,
      description: prod.description || "",
      shortDescription: prod.shortDescription || prod.short_description || "",
      images: prod.images || [],
      tags: prod.tags ? prod.tags.join(", ") : "",
      isActive: prod.isActive !== undefined ? prod.isActive : true,
      isFeatured: prod.isFeatured || false,
      isNew: prod.isNew || false,
      isBestSeller: prod.isBestSeller || false,
      inStock: prod.inStock !== undefined ? prod.inStock : true,
      // 🌟 Lấy thuộc tính và xử lý an toàn
      attributes: Array.isArray(prod.attributes)
        ? prod.attributes.map((a) => ({
            key: a.key || "",
            value: a.value || "",
          }))
        : [],
      variants: prod.variants
        ? prod.variants.map((v) => ({
            ...v,
            salePrice: v.salePrice || v.sale_price || 0,
          }))
        : [],
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (prod) => {
    setCurrentId(prod.id || prod._id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.basePrice) {
      alert("Vui lòng điền các trường bắt buộc (Tên, Slug, Giá gốc)!");
      return;
    }

    // 🌟 ÉP KIỂU STRING ĐỂ CHUẨN HÓA THUỘC TÍNH VÀ LOẠI BỎ RỖNG
    const validAttributes = formData.attributes
      .filter((attr) => attr.key.trim() !== "" && attr.value.trim() !== "")
      .map((attr) => ({
        key: String(attr.key).trim(),
        value: String(attr.value).trim(),
      }));

    const validVariants = [];
    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.name.trim()) {
        alert(
          `Vui lòng nhập "Tên" cho phân loại thứ ${i + 1} (VD: 50ml, Màu đỏ).`,
        );
        return;
      }
      let autoSku = v.sku.trim();
      if (!autoSku) {
        const prefix = formData.sku
          ? formData.sku.trim()
          : formData.slug.substring(0, 10).toUpperCase();
        const suffix = generateSlug(v.name).toUpperCase();
        autoSku = `${prefix}-${suffix}`;
      }
      validVariants.push({
        sku: autoSku,
        name: v.name.trim(),
        price: Number(v.price) || 0,
        sale_price: Number(v.salePrice) || 0,
        stock: Number(v.stock) || 0,
        images: v.images || [],
      });
    }

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        category_id: formData.categoryId ? formData.categoryId : null,
        brand_id: formData.brandId ? formData.brandId : null,
        base_price: Number(formData.basePrice),
        sale_price: Number(formData.salePrice),
        stock: Number(formData.stock),
        description: formData.description,
        short_description: formData.shortDescription,
        images: formData.images,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
        attributes: validAttributes, // Gửi mảng lên
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        is_new_product: formData.isNew,
        is_best_seller: formData.isBestSeller,
        in_stock: formData.inStock,
        variants: validVariants,
      };

      let res;
      if (isEditing) {
        res = await adminProductApi.update(currentId, payload);
      } else {
        res = await adminProductApi.create(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchData(page);
      }
    } catch (error) {
      alert("Lỗi lưu sản phẩm: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await adminProductApi.delete(currentId);
      if (res.success) {
        setShowDeleteModal(false);
        fetchData(page);
      }
    } catch (error) {
      alert("Lỗi xóa sản phẩm: " + error.message);
    }
  };

  const columns = [
    {
      header: "Hình ảnh",
      render: (row) => (
        <img
          src={
            row.images && row.images.length > 0
              ? row.images[0]
              : "https://via.placeholder.com/50"
          }
          alt={row.name}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "6px",
          }}
        />
      ),
    },
    {
      header: "Tên sản phẩm",
      render: (row) => (
        <div>
          <div
            className="fw-medium text-wrap"
            style={{
              maxWidth: "250px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {row.name}
          </div>
          <small className="text-muted">
            Thương hiệu:{" "}
            {brands.find((b) => b.id === row.brandId || b._id === row.brandId)
              ?.name || "Không có"}
          </small>
        </div>
      ),
    },
    {
      header: "Giá bán",
      render: (row) => {
        const basePrice = row.basePrice || row.base_price || 0;
        const salePrice = row.salePrice || row.sale_price || 0;

        return (
          <div className="d-flex flex-column">
            {salePrice > 0 ? (
              <>
                <span className="text-danger fw-bold">
                  {salePrice.toLocaleString()}đ
                </span>
                <del className="text-muted small">
                  {basePrice.toLocaleString()}đ
                </del>
              </>
            ) : (
              <span className="text-danger fw-bold">
                {basePrice.toLocaleString()}đ
              </span>
            )}
          </div>
        );
      },
    },
    { field: "stock", header: "Tồn kho" },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`badge ${row.isActive ? "bg-success" : "bg-secondary"}`}
        >
          {row.isActive ? "Đang bán" : "Ngừng bán"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
            title="Sửa"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDeleteClick(row)}
            title="Xóa"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <Loading message="Đang tải dữ liệu sản phẩm..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Sản phẩm</h4>
          <p className="text-muted mb-0">Thêm, sửa, xóa và quản lý kho hàng</p>
        </div>
        <button className="btn btn-success" onClick={handleAddNew}>
          <i className="bi bi-plus-lg me-2"></i>Thêm Sản Phẩm
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        emptyMessage="Chưa có sản phẩm nào."
      />

      {totalPages > 1 && (
        <Pagination
          page={page - 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p + 1)}
        />
      )}

      <Modal
        show={showModal}
        title={isEditing ? "Cập nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText={isEditing ? "Lưu thay đổi" : "Tạo Sản Phẩm"}
        confirmVariant="success"
        size="xl"
      >
        <div className="row">
          <div className="col-md-8 border-end pe-4">
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-info-circle me-2"></i>Thông tin cơ bản
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

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-medium">
                  Slug <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">
                  Mã SKU (Sản phẩm cha)
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

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-medium">Danh mục</label>
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
                      {cat.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">
                  Thương hiệu
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

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label small fw-medium">
                  Giá gốc (VNĐ) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: e.target.value })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-medium">
                  Giá khuyến mãi (VNĐ)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, salePrice: e.target.value })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-medium">
                  Tồn kho chung
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Mô tả ngắn</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-medium">
                Mô tả chi tiết
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

            <hr className="my-4" />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-info mb-0">
                <i className="bi bi-list-ul me-2"></i>Thuộc tính chi tiết
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={addAttribute}
              >
                <i className="bi bi-plus me-1"></i>Thêm thuộc tính
              </button>
            </div>

            {formData.attributes.length === 0 ? (
              <div className="text-muted small fst-italic mb-3">
                Sản phẩm chưa có thuộc tính nào (Ví dụ: Xuất xứ, Thành phần).
              </div>
            ) : (
              formData.attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="row g-2 mb-2 align-items-center bg-light p-2 rounded"
                >
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tên (VD: Xuất xứ)"
                      value={attr.key}
                      onChange={(e) =>
                        updateAttribute(idx, "key", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Giá trị (VD: Hàn Quốc)"
                      value={attr.value}
                      onChange={(e) =>
                        updateAttribute(idx, "value", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-1 text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger px-2 py-1"
                      onClick={() => removeAttribute(idx)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}

            <hr className="my-4" />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-success mb-0">
                <i className="bi bi-diagram-2 me-2"></i>Các phân loại (Variants)
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={addVariant}
              >
                <i className="bi bi-plus me-1"></i>Thêm phân loại
              </button>
            </div>

            {formData.variants.length === 0 ? (
              <div className="text-muted small fst-italic mb-3">
                Sản phẩm này không có phân loại (Ví dụ: Chỉ có 1 dung tích duy
                nhất).
              </div>
            ) : (
              formData.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="bg-light p-3 rounded mb-3 border position-relative"
                >
                  <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 m-2"
                    onClick={() => removeVariant(idx)}
                  ></button>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small mb-1">
                        Tên (VD: 50ml, Đỏ){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={v.name}
                        onChange={(e) =>
                          updateVariant(idx, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small mb-1">
                        SKU (Mã tự động sinh nếu trống)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={v.sku}
                        onChange={(e) =>
                          updateVariant(idx, "sku", e.target.value)
                        }
                        placeholder="Tự động..."
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small mb-1">Giá gốc</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(idx, "price", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small mb-1">Giá Sale</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={v.salePrice}
                        onChange={(e) =>
                          updateVariant(idx, "salePrice", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small mb-1">Kho</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(idx, "stock", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="col-md-4 ps-md-4">
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-images me-2"></i>Hình ảnh & Cấu hình
            </h6>
            <ImageUpload
              images={formData.images}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              uploading={uploading}
              multiple={true}
            />

            <div className="mb-4 mt-3">
              <label className="form-label small fw-medium">
                Tags (Cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: tri-mun, da-dau, auth"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <hr />
            <h6 className="fw-bold small mb-3">Trạng thái hiển thị</h6>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <label className="form-check-label small fw-medium">
                Kích hoạt (Đang bán)
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
              <label className="form-check-label small fw-medium">
                Còn hàng
              </label>
            </div>

            <hr />
            <h6 className="fw-bold small mb-3">Nhãn (Badge) Trang chủ</h6>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) =>
                  setFormData({ ...formData, isNew: e.target.checked })
                }
              />
              <label className="form-check-label small text-info fw-medium">
                Sản phẩm Mới (New)
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
                Nổi bật (Featured)
              </label>
            </div>
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) =>
                  setFormData({ ...formData, isBestSeller: e.target.checked })
                }
              />
              <label className="form-check-label small text-danger fw-medium">
                Bán chạy (Best Seller)
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
