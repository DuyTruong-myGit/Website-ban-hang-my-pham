import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/admin/ImageUpload";
import usePageTitle from "../../hooks/usePageTitle";
import {
  adminCategoryApi,
  uploadApi,
} from "../../services/adminProductService";

const AdminCategories = () => {
  usePageTitle("Quản lý Danh mục");

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

  // Chuyển cây danh mục thành mảng 1 chiều để dễ hiển thị trên Table và Dropdown
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

  // Tự động tạo slug từ tên
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
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res.success) {
        setFormData({ ...formData, imageUrl: res.data.url });
      }
    } catch (error) {
      alert("Lỗi upload ảnh: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      slug: "",
      imageUrl: "",
      description: "",
      sortOrder: 0,
      parentId: "",
      isActive: true,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setCurrentId(cat.id || cat._id);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      imageUrl: cat.imageUrl || cat.image_url || "",
      description: cat.description || "",
      parentId: cat.parentId || cat.parent_id || "",
      sortOrder: cat.sortOrder || cat.sort_order || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (cat) => {
    setCurrentId(cat.id || cat._id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Vui lòng nhập Tên và Slug danh mục!");
      return;
    }

    // 🌟 MẤU CHỐT: Nếu không chọn parentId, phải gửi lên null để Node.js không báo lỗi ObjectId
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        image_url: formData.imageUrl,
        description: formData.description,
        parent_id: formData.parentId ? formData.parentId : null,
        sort_order: Number(formData.sortOrder),
        is_active: formData.isActive,
      };

      let res;
      if (isEditing) {
        res = await adminCategoryApi.update(currentId, payload);
      } else {
        res = await adminCategoryApi.create(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchCategories();
      }
    } catch (error) {
      alert("Lỗi lưu danh mục: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await adminCategoryApi.delete(currentId);
      if (res.success) {
        setShowDeleteModal(false);
        fetchCategories();
      }
    } catch (error) {
      alert("Lỗi xóa danh mục: " + error.message);
    }
  };

  const columns = [
    {
      header: "Hình ảnh",
      render: (row) =>
        row.imageUrl || row.image_url ? (
          <img
            src={row.imageUrl || row.image_url}
            alt={row.name}
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ) : (
          <div
            className="bg-light rounded d-flex align-items-center justify-content-center text-muted"
            style={{ width: "50px", height: "50px" }}
          >
            <i className="bi bi-tag"></i>
          </div>
        ),
    },
    {
      field: "displayName",
      header: "Tên danh mục",
      style: { fontWeight: "500" },
    },
    {
      header: "Slug",
      render: (row) => (
        <code className="text-muted bg-light px-2 py-1 rounded">
          {row.slug}
        </code>
      ),
    },
    { field: "sortOrder", header: "Thứ tự" },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`badge ${row.isActive ? "bg-success" : "bg-secondary"}`}
        >
          {row.isActive ? "Hiển thị" : "Đang ẩn"}
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

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Đang tải danh mục..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Danh mục</h4>
          <p className="text-muted mb-0">Phân loại sản phẩm đa cấp</p>
        </div>
        <button className="btn btn-success" onClick={handleAddNew}>
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
        title={isEditing ? "Cập nhật Danh Mục" : "Thêm Danh Mục"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText={isEditing ? "Lưu thay đổi" : "Tạo Danh Mục"}
        confirmVariant="success"
      >
        <div className="mb-3">
          <ImageUpload
            images={formData.imageUrl ? [formData.imageUrl] : []}
            onUpload={handleImageUpload}
            onRemove={() => setFormData({ ...formData, imageUrl: "" })}
            uploading={uploading}
            multiple={false}
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Tên danh mục <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="VD: Chăm sóc da"
            />
          </div>
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
        </div>

        <div className="row mb-3">
          <div className="col-md-8">
            <label className="form-label small fw-medium">
              Danh mục cha (Parent Category)
            </label>
            <select
              className="form-select"
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
            >
              <option value="">-- Không có (Đây là danh mục gốc) --</option>
              {flatCategories.map((cat) => {
                const catId = cat.id || cat._id;
                // 🌟 Tránh lỗi tự chọn chính nó làm cha gây vòng lặp vô hạn
                if (isEditing && catId === currentId) return null;
                return (
                  <option key={catId} value={catId}>
                    {cat.displayName}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Thứ tự</label>
            <input
              type="number"
              className="form-control"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-medium">Mô tả thêm</label>
          <textarea
            className="form-control"
            rows="2"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-check form-switch mt-2">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            id="isActiveCategory"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          <label
            className="form-check-label cursor-pointer"
            htmlFor="isActiveCategory"
          >
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
          Bạn có chắc chắn muốn xóa danh mục này? Các danh mục con bên trong có
          thể bị ảnh hưởng.
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminCategories;
