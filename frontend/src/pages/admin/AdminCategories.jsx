import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import {
  adminCategoryApi,
  uploadApi,
} from "../../services/adminProductService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    description: "",
    sortOrder: 0,
    parentId: "",
    isActive: true,
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminCategoryApi.getAll();
      if (res.success) {
        setCategories(res.data);
        setFlatCategories(flattenCategories(res.data));
      }
    } catch (error) {
      alert("Lỗi tải danh mục: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res && res.success) {
        setFormData({ ...formData, imageUrl: res.data.url });
      } else {
        alert("Lỗi upload ảnh: " + (res.message || "Lỗi server"));
      }
    } catch (error) {
      alert("Lỗi kết nối khi upload ảnh.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = { ...formData, parentId: formData.parentId || null };
      if (isEditing) await adminCategoryApi.update(currentId, dataToSubmit);
      else await adminCategoryApi.create(dataToSubmit);

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      alert("Lỗi lưu danh mục: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await adminCategoryApi.delete(currentId);
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      alert("Lỗi xóa danh mục: " + error.message);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      slug: "",
      imageUrl: "",
      description: "",
      sortOrder: 0,
      parentId: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setCurrentId(cat.id || cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl || "",
      description: cat.description || "",
      sortOrder: cat.sortOrder || 0,
      parentId: cat.parentId || "",
      isActive: cat.isActive,
    });
    setShowModal(true);
  };

  const columns = [
    {
      header: "Hình ảnh",
      render: (row) => (
        <img
          src={row.imageUrl || "https://via.placeholder.com/50"}
          alt="cat"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ),
    },
    {
      header: "Tên danh mục",
      render: (row) => (
        <span className={row.parentId ? "text-muted" : "fw-bold"}>
          {row.displayName}
        </span>
      ),
    },
    { field: "slug", header: "Đường dẫn (Slug)" },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`admin-badge admin-badge-${row.isActive !== false ? "success" : "secondary"}`}
        >
          {row.isActive !== false ? "Hiển thị" : "Đã ẩn"}
        </span>
      ),
    },
    {
      header: "Hành động",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
          >
            <i className="bi bi-pencil text-primary"></i>
          </button>
          <button
            className="btn btn-sm btn-light border"
            onClick={(e) => {
              e.stopPropagation();
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

  if (loading)
    return (
      <AdminLayout>
        <Loading message="Đang tải danh mục..." />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Danh mục</h4>
          <p className="text-muted mb-0">
            Thêm, sửa, xóa cấu trúc danh mục sản phẩm
          </p>
        </div>
        <button
          className="btn text-white fw-medium px-4 py-2"
          style={{
            background: "var(--admin-gradient-success)",
            borderRadius: "8px",
          }}
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg me-2"></i>Thêm Danh Mục
        </button>
      </div>

      <DataTable
        columns={columns}
        data={flatCategories}
        emptyMessage="Chưa có danh mục nào."
      />

      <Modal
        show={showModal}
        title={isEditing ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText="Lưu lại"
      >
        <div className="mb-3">
          <label className="form-label fw-medium small">
            Tên danh mục <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="VD: Sữa rửa mặt"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium small">
            Ảnh đại diện danh mục
          </label>
          <div className="d-flex gap-3 align-items-center">
            <div
              className="border rounded-circle d-flex align-items-center justify-content-center overflow-hidden bg-light"
              style={{ width: "60px", height: "60px" }}
            >
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <i className="bi bi-image text-muted fs-4"></i>
              )}
            </div>
            <div className="flex-grow-1">
              <input
                type="file"
                className="form-control form-control-sm"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && (
                <small className="text-primary mt-1 d-block">
                  <i className="spinner-border spinner-border-sm me-1"></i>Đang
                  tải...
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium small">
            Slug (Đường dẫn tĩnh) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-medium small">Danh mục cha</label>
          <select
            className="form-select"
            value={formData.parentId}
            onChange={(e) =>
              setFormData({ ...formData, parentId: e.target.value })
            }
          >
            <option value="">-- Không có (Danh mục gốc) --</option>
            {categories.map((cat) => (
              <option
                key={cat.id || cat._id}
                value={cat.id || cat._id}
                disabled={currentId === (cat.id || cat._id)}
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 mt-3">
          <label className="form-label fw-medium small">Mô tả danh mục</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Mô tả ngắn gọn về danh mục này..."
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium small">
            Thứ tự hiển thị (Sort Order)
          </label>
          <input
            type="number"
            className="form-control"
            value={formData.sortOrder || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                sortOrder: parseInt(e.target.value) || 0,
              })
            }
          />
          <div className="form-text" style={{ fontSize: "11px" }}>
            Số nhỏ hơn sẽ xếp lên trước
          </div>
        </div>

        <div className="form-check form-switch mt-4">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          <label className="form-check-label cursor-pointer" htmlFor="isActive">
            Hiển thị trên website
          </label>
        </div>
      </Modal>

      <Modal
        show={showDeleteModal}
        title="Xác nhận xóa"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Xóa"
        confirmVariant="danger"
      >
        <p className="mb-0 text-danger">
          Bạn có chắc chắn muốn xóa danh mục này? Các danh mục con hoặc sản phẩm
          thuộc danh mục này có thể bị ảnh hưởng.
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminCategories;
