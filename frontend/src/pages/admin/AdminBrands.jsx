import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/admin/ImageUpload";
import { adminBrandApi, uploadApi } from "../../services/adminProductService";
import usePageTitle from "../../hooks/usePageTitle";

const AdminBrands = () => {
  usePageTitle("Quản lý Thương hiệu");

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    originCountry: "",
    website: "",
    isActive: true,
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await adminBrandApi.getAll();
      if (res.success) setBrands(res.data);
    } catch (error) {
      alert("Lỗi tải danh sách thương hiệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Hàm tự động tạo Slug từ Tên thương hiệu
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
      // Chỉ tự động cập nhật slug nếu đang thêm mới
      slug: isEditing ? formData.slug : generateSlug(newName),
    });
  };

  // Xử lý Upload Ảnh Logo lên Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res.success) {
        setFormData({ ...formData, logoUrl: res.data.url });
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
      logoUrl: "",
      description: "",
      originCountry: "",
      website: "",
      isActive: true,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (brand) => {
    setCurrentId(brand.id || brand._id);
    setFormData({
      name: brand.name || "",
      slug: brand.slug || "",
      logoUrl: brand.logoUrl || brand.logo_url || "",
      description: brand.description || "",
      originCountry: brand.originCountry || brand.origin_country || "",
      website: brand.website || "",
      isActive: brand.isActive !== undefined ? brand.isActive : true,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (brand) => {
    setCurrentId(brand.id || brand._id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Vui lòng nhập Tên và Slug thương hiệu!");
      return;
    }

    try {
      // 🌟 MẤU CHỐT: Map dữ liệu sang snake_case cho chuẩn với Node.js
      const payload = {
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logoUrl,
        description: formData.description,
        origin_country: formData.originCountry,
        website: formData.website,
        is_active: formData.isActive,
      };

      let res;
      if (isEditing) {
        res = await adminBrandApi.update(currentId, payload);
      } else {
        res = await adminBrandApi.create(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchBrands();
      }
    } catch (error) {
      alert("Lỗi lưu thương hiệu: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await adminBrandApi.delete(currentId);
      if (res.success) {
        setShowDeleteModal(false);
        fetchBrands();
      }
    } catch (error) {
      alert("Lỗi xóa thương hiệu: " + error.message);
    }
  };

  const columns = [
    {
      header: "Logo",
      render: (row) => (
        <img
          src={row.logoUrl || row.logo_url || "https://via.placeholder.com/60"}
          alt={row.name}
          style={{
            width: "60px",
            height: "60px",
            objectFit: "contain",
            background: "#fff",
            borderRadius: "8px",
            padding: "4px",
            border: "1px solid #eee",
          }}
        />
      ),
    },
    { field: "name", header: "Tên thương hiệu" },
    {
      field: "originCountry",
      header: "Xuất xứ",
      render: (row) => row.originCountry || row.origin_country || "—",
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`badge ${row.isActive ? "bg-success" : "bg-secondary"}`}
        >
          {row.isActive ? "Đang hợp tác" : "Ngừng hợp tác"}
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
        <Loading message="Đang tải danh sách thương hiệu..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Thương hiệu</h4>
          <p className="text-muted mb-0">Danh sách đối tác nhãn hàng</p>
        </div>
        <button className="btn btn-success" onClick={handleAddNew}>
          <i className="bi bi-plus-lg me-2"></i>Thêm Thương Hiệu
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        emptyMessage="Chưa có thương hiệu nào."
      />

      {/* Modal Thêm/Sửa */}
      <Modal
        show={showModal}
        title={isEditing ? "Cập nhật Thương Hiệu" : "Thêm Thương Hiệu"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText={isEditing ? "Lưu thay đổi" : "Tạo Thương Hiệu"}
        confirmVariant="success"
      >
        <div className="mb-3">
          <ImageUpload
            images={formData.logoUrl ? [formData.logoUrl] : []}
            onUpload={handleImageUpload}
            onRemove={() => setFormData({ ...formData, logoUrl: "" })}
            uploading={uploading}
            multiple={false}
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Tên thương hiệu <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="VD: La Roche-Posay"
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
              placeholder="vd: la-roche-posay"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Quốc gia (Xuất xứ)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Pháp"
              value={formData.originCountry}
              onChange={(e) =>
                setFormData({ ...formData, originCountry: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Website</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: https://larocheposay.vn"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-medium">
            Mô tả thương hiệu
          </label>
          <textarea
            className="form-control"
            rows="3"
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
            id="isActiveBrand"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          <label
            className="form-check-label cursor-pointer"
            htmlFor="isActiveBrand"
          >
            Đang hợp tác (Hiển thị)
          </label>
        </div>
      </Modal>

      {/* Modal Xóa */}
      <Modal
        show={showDeleteModal}
        title="Xác nhận xóa"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Xóa"
        confirmVariant="danger"
      >
        <p className="mb-0 text-danger">
          Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể
          hoàn tác.
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminBrands;
